import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import {
  AyahData,
  HifzStrength,
  MaskingMode,
  VerseHifzRecord,
  MurajahReminder,
} from '../types/quran';
import {
  getAllSurahs,
  getSurahMeta,
  getSurahAyahs,
} from '../services/quranData';
import { RECITERS_LIST } from '../services/audioContext';
import {
  getHifzRecords,
  saveVerseHifzAssessment,
  getMurajahReminders,
  saveMurajahReminder,
  removeMurajahReminder,
  markMurajahCompleted,
} from '../services/storage';

const pad3 = (n: number) => String(n).padStart(3, '0');

export default function QuranMemorizationScreen() {
  const params = useLocalSearchParams<{
    surah?: string;
    startAyah?: string;
    endAyah?: string;
  }>();

  const allSurahs = useMemo(() => getAllSurahs(), []);

  // Surah & Range Selection
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(() => {
    const s = parseInt(params.surah || '1', 10);
    return isNaN(s) || s < 1 || s > 114 ? 1 : s;
  });

  const surahMeta = useMemo(() => getSurahMeta(selectedSurahNum), [selectedSurahNum]);
  const allSurahAyahs = useMemo(() => getSurahAyahs(selectedSurahNum), [selectedSurahNum]);

  const [startAyah, setStartAyah] = useState<number>(() => {
    const sa = parseInt(params.startAyah || '1', 10);
    return isNaN(sa) || sa < 1 ? 1 : sa;
  });

  const [endAyah, setEndAyah] = useState<number>(() => {
    const ea = parseInt(params.endAyah || '7', 10);
    const max = surahMeta?.ayahs || 7;
    return isNaN(ea) ? Math.min(max, 7) : Math.min(Math.max(1, ea), max);
  });

  const [prevSurahNum, setPrevSurahNum] = useState(selectedSurahNum);
  if (prevSurahNum !== selectedSurahNum) {
    setPrevSurahNum(selectedSurahNum);
    setStartAyah(1);
    setEndAyah(Math.min(surahMeta?.ayahs || 7, 7));
  }

  // Audio Playback & Reciter state
  const [selectedReciter, setSelectedReciter] = useState<string>('Husary_128kbps'); // Al-Husary default for Tajweed & Hifz
  const [isReciterModalVisible, setIsReciterModalVisible] = useState(false);
  const [repeatVerseTarget, setRepeatVerseTarget] = useState<number>(3); // Classical 3x repeat
  const [currentVerseRepeat, setCurrentVerseRepeat] = useState<number>(1);
  const [repeatRangeTarget, setRepeatRangeTarget] = useState<number>(1);
  const [currentRangePass, setCurrentRangePass] = useState<number>(1);

  // Active playing verse
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);

  // Masking state
  const [maskingMode, setMaskingMode] = useState<MaskingMode>('hidden');
  const [revealedAyahs, setRevealedAyahs] = useState<Set<number>>(new Set());

  // Hifz assessments map
  const [hifzRecords, setHifzRecords] = useState<Record<string, VerseHifzRecord>>({});

  // Modals state
  const [isSurahPickerVisible, setIsSurahPickerVisible] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [isMurajahModalVisible, setIsMurajahModalVisible] = useState(false);
  const [murajahReminders, setMurajahReminders] = useState<MurajahReminder[]>([]);
  const [reminderFrequency, setReminderFrequency] = useState<number>(3); // Every 3 days
  const [reminderTime, setReminderTime] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // Load Hifz Records and Muraja'ah reminders
  const loadHifzData = useCallback(() => {
    getHifzRecords().then(setHifzRecords);
    getMurajahReminders().then(setMurajahReminders);
  }, []);

  useEffect(() => {
    loadHifzData();
  }, [loadHifzData]);

  // Active verse range data
  const targetAyahs: AyahData[] = useMemo(() => {
    if (!allSurahAyahs || allSurahAyahs.length === 0) return [];
    const from = Math.max(1, Math.min(startAyah, endAyah));
    const to = Math.min(allSurahAyahs.length, Math.max(startAyah, endAyah));
    return allSurahAyahs.slice(from - 1, to);
  }, [allSurahAyahs, startAyah, endAyah]);

  // Audio URL calculation
  const currentAudioUrl = useMemo(() => {
    if (!activeAyah || !isAudioActive) return null;
    return `https://everyayah.com/data/${selectedReciter}/${pad3(selectedSurahNum)}${pad3(activeAyah)}.mp3`;
  }, [selectedSurahNum, activeAyah, selectedReciter, isAudioActive]);

  const player = useAudioPlayer(currentAudioUrl);
  const audioStatus = useAudioPlayerStatus(player);

  const isTransitioningRef = useRef(false);

  // Play a specific verse in range
  const playVerse = useCallback(
    (ayah: number) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

      isTransitioningRef.current = true;
      setActiveAyah(ayah);
      setIsAudioActive(true);

      const url = `https://everyayah.com/data/${selectedReciter}/${pad3(selectedSurahNum)}${pad3(ayah)}.mp3`;
      if (player) {
        player.replace(url);
        player.play();
      }
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 350);
    },
    [selectedReciter, selectedSurahNum, player]
  );

  // Toggle playback for the active range
  const handleTogglePlayback = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (!isAudioActive || !activeAyah) {
      // Start from first verse in range
      const initialAyah = targetAyahs[0]?.ayah || startAyah;
      setCurrentVerseRepeat(1);
      setCurrentRangePass(1);
      playVerse(initialAyah);
      return;
    }

    if (player) {
      if (audioStatus.playing) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  // Handle auto-advance and Takrar repeat logic when an Ayah finishes reciting
  useEffect(() => {
    if (!audioStatus.didJustFinish || isTransitioningRef.current || !activeAyah || !isAudioActive) {
      return;
    }

    const timer = setTimeout(() => {
      // 1. Infinite loop check
      if (repeatVerseTarget === -1) {
        playVerse(activeAyah);
        return;
      }

      // 2. Verse repeat count check
      if (currentVerseRepeat < repeatVerseTarget) {
        const nextRep = currentVerseRepeat + 1;
        setCurrentVerseRepeat(nextRep);
        playVerse(activeAyah);
        return;
      }

      // Verse repeat count met! Advance to next verse in range
      const currentIndexInRange = targetAyahs.findIndex((a) => a.ayah === activeAyah);
      if (currentIndexInRange >= 0 && currentIndexInRange < targetAyahs.length - 1) {
        const nextAyah = targetAyahs[currentIndexInRange + 1].ayah;
        setCurrentVerseRepeat(1);
        playVerse(nextAyah);
        return;
      }

      // 3. End of range reached: check range repeat count
      if (currentRangePass < repeatRangeTarget) {
        const nextPass = currentRangePass + 1;
        setCurrentRangePass(nextPass);
        setCurrentVerseRepeat(1);
        const firstAyah = targetAyahs[0]?.ayah || startAyah;
        playVerse(firstAyah);
        return;
      }

      // All repetitions and passes completed!
      setIsAudioActive(false);
      setActiveAyah(null);
      setCurrentVerseRepeat(1);
      setCurrentRangePass(1);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }, 50);

    return () => clearTimeout(timer);
  }, [
    audioStatus.didJustFinish,
    activeAyah,
    isAudioActive,
    repeatVerseTarget,
    currentVerseRepeat,
    repeatRangeTarget,
    currentRangePass,
    targetAyahs,
    startAyah,
    playVerse,
  ]);

  // Masking toggles
  const handleToggleAyahReveal = (ayah: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setRevealedAyahs((prev) => {
      const next = new Set(prev);
      if (next.has(ayah)) {
        next.delete(ayah);
      } else {
        next.add(ayah);
      }
      return next;
    });
  };

  const handleRevealAll = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const all = new Set(targetAyahs.map((a) => a.ayah));
    setRevealedAyahs(all);
  };

  const handleHideAll = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setRevealedAyahs(new Set());
  };

  // Self-assessment rating
  const handleAssessAyah = async (ayah: number, strength: HifzStrength) => {
    try {
      if (strength === 'fluent') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (strength === 'hesitant') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch {}

    const record = await saveVerseHifzAssessment(selectedSurahNum, ayah, strength);
    setHifzRecords((prev) => ({
      ...prev,
      [record.id]: record,
    }));
  };

  // Range mastery score calculation
  const rangeMastery = useMemo(() => {
    if (targetAyahs.length === 0) return { percent: 0, fluent: 0, hesitant: 0, struggled: 0 };
    let fluent = 0;
    let hesitant = 0;
    let struggled = 0;

    targetAyahs.forEach((item) => {
      const key = `${selectedSurahNum}:${item.ayah}`;
      const rec = hifzRecords[key];
      if (rec?.strength === 'fluent') fluent++;
      else if (rec?.strength === 'hesitant') hesitant++;
      else if (rec?.strength === 'struggled') struggled++;
    });

    const percent = Math.round((fluent / targetAyahs.length) * 100);
    return { percent, fluent, hesitant, struggled };
  }, [targetAyahs, selectedSurahNum, hifzRecords]);

  // Filtered surahs for picker modal
  const filteredSurahs = useMemo(() => {
    if (!surahSearchQuery.trim()) return allSurahs;
    const q = surahSearchQuery.trim().toLowerCase();
    return allSurahs.filter(
      (s) =>
        s.n.toString() === q ||
        s.en.toLowerCase().includes(q) ||
        s.meaning.toLowerCase().includes(q) ||
        s.ar.includes(q)
    );
  }, [allSurahs, surahSearchQuery]);

  // Save new Muraja'ah reminder
  const handleSaveMurajahReminder = async () => {
    if (!surahMeta) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const id = `murajah_${selectedSurahNum}_${startAyah}_${endAyah}`;
    const now = Date.now();
    const nextReviewDate = now + reminderFrequency * 24 * 60 * 60 * 1000;

    const reminder: MurajahReminder = {
      id,
      surah: selectedSurahNum,
      surahName: surahMeta.en,
      startAyah,
      endAyah,
      frequencyDays: reminderFrequency,
      timeOfDay: reminderTime,
      nextReviewDate,
      enabled: true,
    };

    await saveMurajahReminder(reminder);
    loadHifzData();
    setIsMurajahModalVisible(false);
  };

  // Delete Muraja'ah reminder
  const handleDeleteMurajahReminder = async (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await removeMurajahReminder(id);
    loadHifzData();
  };

  // Mark Muraja'ah completed
  const handleCompleteMurajah = async (id: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    await markMurajahCompleted(id);
    loadHifzData();
  };

  // Helper to extract first 2 words for 'prompt' mode
  const getPromptText = (arabicText: string) => {
    const words = arabicText.trim().split(/\s+/);
    if (words.length <= 2) return words.join(' ');
    return `${words.slice(0, 2).join(' ')} ...`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>

        {/* Surah Selector Dropdown */}
        <TouchableOpacity
          style={styles.surahDropdown}
          onPress={() => setIsSurahPickerVisible(true)}
          activeOpacity={0.8}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.surahDropdownTitle}>{surahMeta?.en || 'Select Surah'}</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.surahDropdownSub}>
              {surahMeta?.ar} • {surahMeta?.ayahs} Verses
            </Text>
          </View>
        </TouchableOpacity>

        {/* Muraja'ah Reminder Bell */}
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setIsMurajahModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Murajah revision reminders"
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
          {murajahReminders.length > 0 && <View style={styles.reminderDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Setup & Range Configuration Card */}
        <View style={styles.configCard}>
          <View style={styles.rangeTitleRow}>
            <View>
              <Text style={styles.rangeSectionTitle}>Verse Range (Ayat)</Text>
              <Text style={styles.rangeSectionSub}>
                Ayah {startAyah} to {endAyah} ({targetAyahs.length} verses)
              </Text>
            </View>

            <View style={styles.masteryPill}>
              <Ionicons name="sparkles" size={12} color="#15803D" />
              <Text style={styles.masteryPillText}>{rangeMastery.percent}% Fluent</Text>
            </View>
          </View>

          {/* Stepper Controls */}
          <View style={styles.stepperRow}>
            <View style={styles.stepperGroup}>
              <Text style={styles.stepperLabel}>Start Verse</Text>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setStartAyah((p) => Math.max(1, p - 1))}
                  disabled={startAyah <= 1}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{startAyah}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setStartAyah((p) => Math.min(endAyah, p + 1))}
                  disabled={startAyah >= endAyah}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stepperDivider} />

            <View style={styles.stepperGroup}>
              <Text style={styles.stepperLabel}>End Verse</Text>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setEndAyah((p) => Math.max(startAyah, p - 1))}
                  disabled={endAyah <= startAyah}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{endAyah}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setEndAyah((p) => Math.min(surahMeta?.ayahs || 7, p + 1))}
                  disabled={endAyah >= (surahMeta?.ayahs || 7)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => {
                setStartAyah(1);
                setEndAyah(Math.min(surahMeta?.ayahs || 5, 5));
              }}
            >
              <Text style={styles.presetPillText}>First 5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => {
                setStartAyah(1);
                setEndAyah(Math.min(surahMeta?.ayahs || 10, 10));
              }}
            >
              <Text style={styles.presetPillText}>First 10</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => {
                const nextStart = Math.min((surahMeta?.ayahs || 1), endAyah + 1);
                const nextEnd = Math.min((surahMeta?.ayahs || 1), nextStart + 4);
                setStartAyah(nextStart);
                setEndAyah(nextEnd);
              }}
            >
              <Text style={styles.presetPillText}>Next 5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => {
                setStartAyah(1);
                setEndAyah(surahMeta?.ayahs || 7);
              }}
            >
              <Text style={styles.presetPillText}>Whole Surah</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Audio Player & Classical Takrar Bar */}
        <View style={styles.audioTakrarCard}>
          <View style={styles.takrarTopRow}>
            {/* Reciter Selector */}
            <TouchableOpacity
              style={styles.reciterBox}
              onPress={() => setIsReciterModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="mic-outline" size={15} color={COLORS.primary} />
              <Text style={styles.reciterNameText} numberOfLines={1}>
                {RECITERS_LIST.find((r) => r.id === selectedReciter)?.name.split(' ')[0] || 'Al-Husary'}
              </Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.primaryDark} />
            </TouchableOpacity>

            {/* Repeat Count (Takrar) Pill */}
            <View style={styles.repeatSelectorRow}>
              <Text style={styles.repeatLabel}>Verse Takrar:</Text>
              {[1, 3, 5, 10, -1].map((cnt) => {
                const isSelected = repeatVerseTarget === cnt;
                return (
                  <TouchableOpacity
                    key={cnt}
                    style={[styles.repeatPill, isSelected && styles.repeatPillActive]}
                    onPress={() => setRepeatVerseTarget(cnt)}
                  >
                    <Text style={[styles.repeatPillText, isSelected && styles.repeatPillTextActive]}>
                      {cnt === -1 ? '∞' : `${cnt}x`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Range Passes Pill */}
            <View style={styles.repeatSelectorRow}>
              <Text style={styles.repeatLabel}>Passes:</Text>
              {[1, 2, 3, 5].map((cnt) => {
                const isSelected = repeatRangeTarget === cnt;
                return (
                  <TouchableOpacity
                    key={cnt}
                    style={[styles.repeatPill, isSelected && styles.repeatPillActive]}
                    onPress={() => setRepeatRangeTarget(cnt)}
                  >
                    <Text style={[styles.repeatPillText, isSelected && styles.repeatPillTextActive]}>
                      {cnt}x
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Active Audio Playback Row */}
          <View style={styles.playbackRow}>
            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.mainPlayBtn}
              onPress={handleTogglePlayback}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[COLORS.heroGradientStart, COLORS.heroGradientEnd]}
                style={styles.mainPlayGradient}
              >
                <Ionicons
                  name={isAudioActive && audioStatus.playing ? 'pause' : 'play'}
                  size={20}
                  color={COLORS.textInverse}
                />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.playbackInfoBox}>
              <Text style={styles.playbackStatusTitle}>
                {isAudioActive && activeAyah
                  ? `Reciting Ayah ${activeAyah}`
                  : 'Ready to Listen & Recite'}
              </Text>
              <Text style={styles.playbackStatusSub}>
                {isAudioActive
                  ? `Repetition ${currentVerseRepeat} of ${repeatVerseTarget === -1 ? '∞' : repeatVerseTarget} • Pass ${currentRangePass} of ${repeatRangeTarget}`
                  : `Takrar loop: ${repeatVerseTarget === -1 ? 'Infinite' : `${repeatVerseTarget} times per verse`}`}
              </Text>
            </View>

            {/* Step Controls */}
            <View style={styles.stepControls}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  const idx = targetAyahs.findIndex((a) => a.ayah === activeAyah);
                  if (idx > 0) playVerse(targetAyahs[idx - 1].ayah);
                }}
                disabled={!activeAyah || activeAyah <= startAyah}
              >
                <Ionicons name="play-skip-back" size={16} color={COLORS.primaryDark} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  const idx = targetAyahs.findIndex((a) => a.ayah === activeAyah);
                  if (idx >= 0 && idx < targetAyahs.length - 1) {
                    playVerse(targetAyahs[idx + 1].ayah);
                  }
                }}
                disabled={!activeAyah || activeAyah >= endAyah}
              >
                <Ionicons name="play-skip-forward" size={16} color={COLORS.primaryDark} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Masking Controls Bar */}
        <View style={styles.maskingBar}>
          <View style={styles.maskingModesRow}>
            <TouchableOpacity
              style={[styles.maskModePill, maskingMode === 'hidden' && styles.maskModePillActive]}
              onPress={() => setMaskingMode('hidden')}
            >
              <Ionicons
                name="eye-off-outline"
                size={14}
                color={maskingMode === 'hidden' ? COLORS.textInverse : COLORS.textPrimary}
              />
              <Text
                style={[
                  styles.maskModePillText,
                  maskingMode === 'hidden' && styles.maskModePillTextActive,
                ]}
              >
                Hide All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.maskModePill, maskingMode === 'prompt' && styles.maskModePillActive]}
              onPress={() => setMaskingMode('prompt')}
            >
              <Ionicons
                name="text-outline"
                size={14}
                color={maskingMode === 'prompt' ? COLORS.textInverse : COLORS.textPrimary}
              />
              <Text
                style={[
                  styles.maskModePillText,
                  maskingMode === 'prompt' && styles.maskModePillTextActive,
                ]}
              >
                First Words
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.maskModePill, maskingMode === 'visible' && styles.maskModePillActive]}
              onPress={() => setMaskingMode('visible')}
            >
              <Ionicons
                name="eye-outline"
                size={14}
                color={maskingMode === 'visible' ? COLORS.textInverse : COLORS.textPrimary}
              />
              <Text
                style={[
                  styles.maskModePillText,
                  maskingMode === 'visible' && styles.maskModePillTextActive,
                ]}
              >
                Reveal All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Reveal / Hide All Actions */}
          <View style={styles.quickRevealButtons}>
            <TouchableOpacity onPress={handleRevealAll} style={styles.textActionBtn}>
              <Text style={styles.textActionText}>Unveil All</Text>
            </TouchableOpacity>
            <Text style={{ color: COLORS.border }}>|</Text>
            <TouchableOpacity onPress={handleHideAll} style={styles.textActionBtn}>
              <Text style={styles.textActionText}>Veil All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verse Cards List */}
        <View style={styles.versesContainer}>
          {targetAyahs.map((item) => {
            const isPlayingThisAyah = activeAyah === item.ayah && isAudioActive;
            const isIndividualRevealed = revealedAyahs.has(item.ayah);
            const isGloballyVisible = maskingMode === 'visible';
            const isPromptMode = maskingMode === 'prompt';
            const isFullyVisible = isGloballyVisible || isIndividualRevealed;

            const recordKey = `${selectedSurahNum}:${item.ayah}`;
            const assessment = hifzRecords[recordKey];

            return (
              <View
                key={item.ayah}
                style={[
                  styles.verseCard,
                  isPlayingThisAyah && styles.verseCardActive,
                ]}
              >
                {/* Verse Card Header */}
                <View style={styles.verseCardHeader}>
                  <View style={styles.verseNumberBadge}>
                    <Text style={styles.verseNumberText}>Ayah {item.ayah}</Text>
                  </View>

                  {/* Status Pill */}
                  {assessment ? (
                    <View
                      style={[
                        styles.statusPill,
                        assessment.strength === 'fluent' && styles.statusFluent,
                        assessment.strength === 'hesitant' && styles.statusHesitant,
                        assessment.strength === 'struggled' && styles.statusStruggled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          assessment.strength === 'fluent' && styles.statusTextFluent,
                          assessment.strength === 'hesitant' && styles.statusTextHesitant,
                          assessment.strength === 'struggled' && styles.statusTextStruggled,
                        ]}
                      >
                        {assessment.strength === 'fluent'
                          ? 'Fluent (متقن)'
                          : assessment.strength === 'hesitant'
                          ? 'Hesitant'
                          : 'Needs Review'}
                      </Text>
                    </View>
                  ) : null}

                  {/* Single Verse Play Button */}
                  <TouchableOpacity
                    style={[
                      styles.versePlayBtn,
                      isPlayingThisAyah && styles.versePlayBtnActive,
                    ]}
                    onPress={() => playVerse(item.ayah)}
                    accessibilityRole="button"
                    accessibilityLabel={`Play Ayah ${item.ayah}`}
                  >
                    <Ionicons
                      name={isPlayingThisAyah && audioStatus.playing ? 'pause' : 'volume-high-outline'}
                      size={16}
                      color={isPlayingThisAyah ? COLORS.textInverse : COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Arabic Text Display Area */}
                <TouchableOpacity
                  style={styles.arabicTouchable}
                  onPress={() => handleToggleAyahReveal(item.ayah)}
                  activeOpacity={0.88}
                >
                  {isFullyVisible ? (
                    <View style={styles.revealedContent}>
                      <Text style={styles.arabicCalligraphy}>{item.arabic}</Text>
                      <Text style={styles.translationSnippet}>{item.english}</Text>
                    </View>
                  ) : isPromptMode ? (
                    <View style={styles.promptContent}>
                      <Text style={styles.arabicPromptCalligraphy}>
                        {getPromptText(item.arabic)}
                      </Text>
                      <View style={styles.maskedVeil}>
                        <Ionicons name="eye-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.maskedVeilText}>Tap to reveal remaining verse</Text>
                      </View>
                    </View>
                  ) : (
                    /* Fully Hidden Card */
                    <View style={styles.hiddenVeilBox}>
                      <View style={styles.hiddenIconCircle}>
                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.primaryDark} />
                      </View>
                      <Text style={styles.hiddenVeilTitle}>Ayah {item.ayah} Hidden</Text>
                      <Text style={styles.hiddenVeilSub}>
                        Recite from memory, then tap anywhere here to check yourself
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Self-Assessment Grading Buttons (visible when revealed) */}
                {isFullyVisible && (
                  <View style={styles.assessmentSection}>
                    <Text style={styles.assessmentHeading}>Grade Your Recall:</Text>
                    <View style={styles.assessmentButtonsRow}>
                      <TouchableOpacity
                        style={[
                          styles.assessBtn,
                          styles.assessBtnFluent,
                          assessment?.strength === 'fluent' && styles.assessBtnFluentActive,
                        ]}
                        onPress={() => handleAssessAyah(item.ayah, 'fluent')}
                      >
                        <Ionicons name="checkmark-circle" size={15} color="#15803D" />
                        <Text style={styles.assessBtnFluentText}>Fluent (متقن)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.assessBtn,
                          styles.assessBtnHesitant,
                          assessment?.strength === 'hesitant' && styles.assessBtnHesitantActive,
                        ]}
                        onPress={() => handleAssessAyah(item.ayah, 'hesitant')}
                      >
                        <Ionicons name="alert-circle" size={15} color="#B45309" />
                        <Text style={styles.assessBtnHesitantText}>Hesitant</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.assessBtn,
                          styles.assessBtnStruggled,
                          assessment?.strength === 'struggled' && styles.assessBtnStruggledActive,
                        ]}
                        onPress={() => handleAssessAyah(item.ayah, 'struggled')}
                      >
                        <Ionicons name="close-circle" size={15} color="#DC2626" />
                        <Text style={styles.assessBtnStruggledText}>Struggled</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Schedule Muraja'ah CTA Banner */}
        <TouchableOpacity
          style={styles.murajahCtaCard}
          onPress={() => setIsMurajahModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.murajahCtaLeft}>
            <View style={styles.murajahCtaIcon}>
              <Ionicons name="calendar" size={22} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.murajahCtaTitle}>Schedule Muraja&apos;ah Revision</Text>
              <Text style={styles.murajahCtaSub}>
                Set automatic reminders to retain {surahMeta?.en} ({startAyah}-{endAyah})
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Surah Picker Modal                                   */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={isSurahPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsSurahPickerVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Surah to Memorize</Text>
            <TouchableOpacity
              onPress={() => setIsSurahPickerVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.modalSearchBox}>
            <Ionicons name="search" size={17} color={COLORS.textMuted} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search by name, number, or Arabic..."
              placeholderTextColor={COLORS.textMuted}
              value={surahSearchQuery}
              onChangeText={setSurahSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {filteredSurahs.map((surah) => (
              <TouchableOpacity
                key={surah.n}
                style={[
                  styles.surahPickerItem,
                  surah.n === selectedSurahNum && styles.surahPickerItemActive,
                ]}
                onPress={() => {
                  setSelectedSurahNum(surah.n);
                  setIsSurahPickerVisible(false);
                }}
              >
                <View style={styles.pickerNumberBox}>
                  <Text style={styles.pickerNumberText}>{surah.n}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.pickerSurahName}>{surah.en}</Text>
                  <Text style={styles.pickerSurahMeaning}>
                    {surah.meaning} • {surah.ayahs} Verses
                  </Text>
                </View>

                <Text style={styles.pickerArabicTitle}>{surah.ar}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Muraja'ah Revision Reminders Modal                   */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={isMurajahModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsMurajahModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Muraja&apos;ah Revision Reminders</Text>
            <TouchableOpacity
              onPress={() => setIsMurajahModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {/* Create Reminder Card for Current Range */}
            <View style={styles.createReminderCard}>
              <Text style={styles.createReminderHeading}>Set Reminder for Current Passage</Text>
              <Text style={styles.createReminderSub}>
                {surahMeta?.en} ({surahMeta?.ar}) • Verses {startAyah} to {endAyah}
              </Text>

              {/* Frequency selection */}
              <Text style={styles.reminderFieldLabel}>Revision Frequency:</Text>
              <View style={styles.reminderPillsRow}>
                {[
                  { label: 'Daily', days: 1 },
                  { label: 'Every 2 Days', days: 2 },
                  { label: 'Every 3 Days', days: 3 },
                  { label: 'Weekly', days: 7 },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.days}
                    style={[
                      styles.reminderOptionPill,
                      reminderFrequency === item.days && styles.reminderOptionPillActive,
                    ]}
                    onPress={() => setReminderFrequency(item.days)}
                  >
                    <Text
                      style={[
                        styles.reminderOptionText,
                        reminderFrequency === item.days && styles.reminderOptionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preferred Time */}
              <Text style={styles.reminderFieldLabel}>Preferred Time of Day:</Text>
              <View style={styles.reminderPillsRow}>
                {[
                  { label: 'Morning (Fajr)', val: 'morning' as const },
                  { label: 'Afternoon (Asr)', val: 'afternoon' as const },
                  { label: 'Evening (Isha)', val: 'evening' as const },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.val}
                    style={[
                      styles.reminderOptionPill,
                      reminderTime === item.val && styles.reminderOptionPillActive,
                    ]}
                    onPress={() => setReminderTime(item.val)}
                  >
                    <Text
                      style={[
                        styles.reminderOptionText,
                        reminderTime === item.val && styles.reminderOptionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveReminderBtn}
                onPress={handleSaveMurajahReminder}
                activeOpacity={0.8}
              >
                <Ionicons name="alarm" size={17} color={COLORS.textInverse} />
                <Text style={styles.saveReminderBtnText}>Save Revision Reminder</Text>
              </TouchableOpacity>
            </View>

            {/* Existing Scheduled Reminders */}
            <Text style={styles.existingRemindersHeading}>
              Active Muraja&apos;ah Schedules ({murajahReminders.length})
            </Text>

            {murajahReminders.length === 0 ? (
              <View style={styles.emptyRemindersBox}>
                <Ionicons name="calendar-outline" size={38} color={COLORS.textMuted} />
                <Text style={styles.emptyRemindersTitle}>No Muraja&apos;ah Reminders Scheduled</Text>
                <Text style={styles.emptyRemindersSub}>
                  Consistent revision preserves memorized verses in long-term memory.
                </Text>
              </View>
            ) : (
              murajahReminders.map((rem) => {
                return (
                  <View key={rem.id} style={styles.reminderItemCard}>
                    <View style={styles.reminderItemLeft}>
                      <View style={styles.reminderIconCircle}>
                        <Ionicons name="book" size={16} color={COLORS.primary} />
                      </View>
                      <View>
                        <Text style={styles.reminderSurahTitle}>
                          {rem.surahName} ({rem.startAyah}-{rem.endAyah})
                        </Text>
                        <Text style={styles.reminderFrequencyText}>
                          Every {rem.frequencyDays === 1 ? 'day' : `${rem.frequencyDays} days`} • {rem.timeOfDay}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reminderActionsRow}>
                      <TouchableOpacity
                        style={styles.completeRevisionBtn}
                        onPress={() => handleCompleteMurajah(rem.id)}
                      >
                        <Ionicons name="checkmark" size={14} color="#15803D" />
                        <Text style={styles.completeRevisionText}>Mark Done</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteReminderBtn}
                        onPress={() => handleDeleteMurajahReminder(rem.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: Reciter Picker Modal                                 */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={isReciterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsReciterModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Reciter (Qari)</Text>
            <TouchableOpacity
              onPress={() => setIsReciterModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {RECITERS_LIST.map((r) => {
              const isSelected = r.id === selectedReciter;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.surahPickerItem,
                    isSelected && styles.surahPickerItemActive,
                  ]}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setSelectedReciter(r.id);
                    setIsReciterModalVisible(false);
                  }}
                >
                  <View style={styles.pickerNumberBox}>
                    <Ionicons
                      name="mic"
                      size={16}
                      color={isSelected ? COLORS.primary : COLORS.textMuted}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pickerSurahName}>{r.name}</Text>
                    <Text style={styles.pickerSurahMeaning}>
                      {r.subname} • {r.bitrate}
                    </Text>
                  </View>

                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahDropdown: {
    flex: 1,
    marginLeft: 12,
  },
  surahDropdownTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  surahDropdownSub: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  reminderDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Range Config Card
  configCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    ...SHADOWS.sm,
  },
  rangeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  rangeSectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  rangeSectionSub: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  masteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  masteryPillText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: '#15803D',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  stepperGroup: {
    flex: 1,
    alignItems: 'center',
  },
  stepperLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  stepperValue: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    minWidth: 26,
    textAlign: 'center',
  },
  stepperDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetPillText: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },

  // Audio Takrar Card
  audioTakrarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    ...SHADOWS.sm,
  },
  takrarTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  reciterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reciterNameText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  repeatSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  repeatLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
  },
  repeatPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  repeatPillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  repeatPillText: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  repeatPillTextActive: {
    color: COLORS.textInverse,
    fontFamily: FONTS.sansBold,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainPlayBtn: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  mainPlayGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackInfoBox: {
    flex: 1,
  },
  playbackStatusTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  playbackStatusSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  stepControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Masking Mode Bar
  maskingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  maskingModesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  maskModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  maskModePillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  maskModePillText: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
  },
  maskModePillTextActive: {
    color: COLORS.textInverse,
    fontFamily: FONTS.sansBold,
  },
  quickRevealButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  textActionText: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primary,
  },

  // Verses List
  versesContainer: {
    gap: 12,
    marginBottom: 20,
  },
  verseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  verseCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAF7FF',
  },
  verseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseNumberBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verseNumberText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusFluent: {
    backgroundColor: '#DCFCE7',
  },
  statusHesitant: {
    backgroundColor: '#FEF3C7',
  },
  statusStruggled: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
  },
  statusTextFluent: {
    color: '#15803D',
  },
  statusTextHesitant: {
    color: '#B45309',
  },
  statusTextStruggled: {
    color: '#DC2626',
  },
  versePlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versePlayBtnActive: {
    backgroundColor: COLORS.primary,
  },

  // Arabic Calligraphy & Masking States
  arabicTouchable: {
    paddingVertical: 6,
  },
  revealedContent: {
    alignItems: 'center',
  },
  arabicCalligraphy: {
    fontSize: 26,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    lineHeight: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  translationSnippet: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  promptContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  arabicPromptCalligraphy: {
    fontSize: 26,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    textAlign: 'center',
    marginBottom: 10,
  },
  maskedVeil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  maskedVeilText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primaryDark,
  },
  hiddenVeilBox: {
    alignItems: 'center',
    paddingVertical: 18,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryBorder,
  },
  hiddenIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  hiddenVeilTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  hiddenVeilSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 16,
  },

  // Assessment Buttons
  assessmentSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  assessmentHeading: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  assessmentButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  assessBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  assessBtnFluent: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  assessBtnFluentActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  assessBtnFluentText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: '#15803D',
  },
  assessBtnHesitant: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  assessBtnHesitantActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  assessBtnHesitantText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: '#B45309',
  },
  assessBtnStruggled: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  assessBtnStruggledActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  assessBtnStruggledText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: '#DC2626',
  },

  // Muraja'ah CTA
  murajahCtaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    ...SHADOWS.sm,
  },
  murajahCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  murajahCtaIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  murajahCtaTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  murajahCtaSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Modal Common Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
    padding: 0,
  },

  // Surah Picker Items
  surahPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  surahPickerItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
  },
  pickerNumberBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerNumberText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  pickerSurahName: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  pickerSurahMeaning: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  pickerArabicTitle: {
    fontSize: 18,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
  },

  // Muraja'ah Modal Styles
  createReminderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  createReminderHeading: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  createReminderSub: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primary,
    marginTop: 2,
    marginBottom: 14,
  },
  reminderFieldLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  reminderPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  reminderOptionPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reminderOptionPillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  reminderOptionText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
  },
  reminderOptionTextActive: {
    color: COLORS.textInverse,
    fontFamily: FONTS.sansBold,
  },
  saveReminderBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  saveReminderBtnText: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
  existingRemindersHeading: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  emptyRemindersBox: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyRemindersTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  emptyRemindersSub: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  reminderItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  reminderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  reminderIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderSurahTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  reminderFrequencyText: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  reminderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completeRevisionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  completeRevisionText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: '#15803D',
  },
  deleteReminderBtn: {
    padding: 4,
  },
});
