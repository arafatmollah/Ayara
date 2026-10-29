import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import {
  getReaderSettings,
  saveReaderSettings,
  getDailyGoal,
  setDailyGoal,
  getUserProfile,
  setUserProfile,
  clearAllActivityData,
  DEFAULT_SETTINGS,
  getContentErrorReports,
} from '../../services/storage';
import { useQuranAudio, RECITERS_LIST } from '../../services/audioContext';
import { ReaderSettings, TranslationLanguage, UserProfile, ContentErrorReport } from '../../types/quran';
import { SourcesTransparencyModal } from '../../components/SourcesTransparencyModal';
import { WaqfSignsModal } from '../../components/WaqfSignsModal';
import { ContentErrorReportModal } from '../../components/ContentErrorReportModal';
import { WhatsNewModal } from '../../components/WhatsNewModal';
import {
  enableDailyLearnReminder,
  disableLearnReminder,
  getReminderSettings,
  setReminderTime,
  formatReminderTime12h,
} from '../../services/notifications';
import { getCurrentVersion, manualCheckForUpdates } from '../../services/appUpdate';

const REMINDER_PRESETS = [
  { hour: 20, minute: 0, label: '8:00 PM' },
  { hour: 21, minute: 0, label: '9:00 PM' },
  { hour: 22, minute: 0, label: '10:00 PM' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [dailyGoal, setGoal] = useState<number>(3);
  const [profile, setProfile] = useState<UserProfile>(() => ({ name: 'Believer', joinedAt: Date.now() }));
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [editNameText, setEditNameText] = useState('');

  // Accuracy & Transparency Modals
  const [isSourcesModalVisible, setIsSourcesModalVisible] = useState(false);
  const [isWaqfModalVisible, setIsWaqfModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [submittedReports, setSubmittedReports] = useState<ContentErrorReport[]>([]);
  const [isViewReportsVisible, setIsViewReportsVisible] = useState(false);

  // Learn Reminder
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(22);
  const [reminderMinute, setReminderMinute] = useState(0);

  // App Update Check & What's New
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isWhatsNewVisible, setIsWhatsNewVisible] = useState(false);

  const audio = useQuranAudio();

  const handleCheckForUpdates = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsCheckingUpdate(true);
    try {
      await manualCheckForUpdates();
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  useEffect(() => {
    getReaderSettings().then(setSettings);
    getDailyGoal().then(setGoal);
    getUserProfile().then(setProfile);
    getContentErrorReports().then(setSubmittedReports);
    getReminderSettings().then((s) => {
      setReminderEnabled(s.enabled);
      setReminderHour(s.hour);
      setReminderMinute(s.minute);
    });
  }, []);

  const updateSettings = async (partial: Partial<ReaderSettings>) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const updated = await saveReaderSettings(partial);
    setSettings(updated);
  };

  const updateGoal = async (newGoal: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await setDailyGoal(newGoal);
    setGoal(newGoal);
  };

  const handleSelectReciter = (reciterId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    audio?.setReciter(reciterId);
    updateSettings({ reciter: reciterId });
  };

  const handleSaveName = async () => {
    if (!editNameText.trim()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const updated = await setUserProfile(editNameText.trim());
    setProfile(updated);
    setIsNameModalVisible(false);
    setEditNameText('');
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Reading Data',
      'Are you sure you want to reset your reading history, daily goals progress, and bookmarks? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch {}
            await clearAllActivityData();
            Alert.alert('Data Reset', 'All reading progress has been successfully cleared.');
          },
        },
      ]
    );
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(20, Math.min(42, settings.arabicFontSize + delta));
    updateSettings({ arabicFontSize: newSize });
  };

  const handleOpenLink = async (url: string, label: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Notice', `Unable to open ${label} on this device.`);
      }
    } catch {
      Alert.alert('Notice', `Unable to navigate to ${label}.`);
    }
  };

  const handleToggleReminder = async (value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (value) {
      const ok = await enableDailyLearnReminder(reminderHour, reminderMinute);
      if (ok) {
        setReminderEnabled(true);
      } else {
        setReminderEnabled(false);
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications for this app in your device settings to receive daily reminders.'
        );
      }
    } else {
      await disableLearnReminder();
      setReminderEnabled(false);
    }
  };

  const handleUpdateReminderTime = async (hour: number, minute: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setReminderHour(hour);
    setReminderMinute(minute);
    await setReminderTime(hour, minute);
    if (reminderEnabled) {
      const ok = await enableDailyLearnReminder(hour, minute);
      if (!ok) {
        setReminderEnabled(false);
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications for this app in your device settings to receive daily reminders.'
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subGreeting}>Preferences</Text>
          <Text style={styles.appTitle}>Settings & Goals</Text>
        </View>

        {/* Daily Goal Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Daily Habit Target</Text>
          <Text style={styles.rowSub}>Select your daily Quran recitation goal</Text>
          <View style={styles.goalPillsRow}>
            {[3, 5, 10, 20].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.goalPill, dailyGoal === num && styles.goalPillActive]}
                onPress={() => updateGoal(num)}
                activeOpacity={0.7}
              >
                <Text style={[styles.goalPillNum, dailyGoal === num && styles.goalPillNumActive]}>
                  {num}
                </Text>
                <Text style={[styles.goalPillLabel, dailyGoal === num && styles.goalPillLabelActive]}>
                  verses/day
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Learn Reminder Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Daily Learn Reminder</Text>
          <Text style={styles.rowSub}>Get a gentle reminder to learn Quran</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.rowTitle}>
                Reminder at {formatReminderTime12h(reminderHour, reminderMinute)}
              </Text>
              <Text style={styles.rowSub}>
                {formatReminderTime12h(reminderHour, reminderMinute)} daily
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={reminderEnabled ? COLORS.primaryDark : '#f4f3f4'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.rowTitle}>Reminder Time</Text>
              <Text style={styles.rowSub}>Tap to set time (default 10:00 PM)</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {REMINDER_PRESETS.map((preset) => {
                const isSelected = reminderHour === preset.hour && reminderMinute === preset.minute;
                return (
                  <TouchableOpacity
                    key={`${preset.hour}:${preset.minute}`}
                    style={[styles.timePill, isSelected && styles.timePillActive]}
                    onPress={() => handleUpdateReminderTime(preset.hour, preset.minute)}
                    accessibilityRole="button"
                    accessibilityLabel={`Set reminder to ${preset.label}`}
                  >
                    <Text style={[styles.timePillText, isSelected && styles.timePillTextActive]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Live Font Preview Card */}
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Arabic Typography Preview</Text>
          <Text
            style={[
              styles.previewArabic,
              { fontSize: settings.arabicFontSize, lineHeight: Math.round(settings.arabicFontSize * 1.8) },
            ]}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </Text>
          {settings.showTransliteration && (
            <Text style={styles.previewTranslit}>Bismillaahir Rahmaanir Raheem</Text>
          )}
          {settings.showTranslation && (
            <Text style={styles.previewTrans}>
              In the name of Allah, the Entirely Merciful, the Especially Merciful.
            </Text>
          )}
        </View>

        {/* Font Size Adjuster */}
        <View style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.rowTitle}>Arabic Font Size</Text>
              <Text style={styles.rowSub}>Current: {settings.arabicFontSize} pt</Text>
            </View>
            <View style={styles.fontControlsRow}>
              <TouchableOpacity
                style={styles.fontBtn}
                onPress={() => adjustFontSize(-2)}
                accessibilityRole="button"
                accessibilityLabel="Decrease font size"
              >
                <Ionicons name="remove" size={18} color={COLORS.primaryDark} />
              </TouchableOpacity>
              <Text style={styles.fontSizeValue}>{settings.arabicFontSize}</Text>
              <TouchableOpacity
                style={styles.fontBtn}
                onPress={() => adjustFontSize(2)}
                accessibilityRole="button"
                accessibilityLabel="Increase font size"
              >
                <Ionicons name="add" size={18} color={COLORS.primaryDark} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Display Toggles */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Display Elements</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.rowTitle}>Translation</Text>
              <Text style={styles.rowSub}>Show ayah translation below Arabic</Text>
            </View>
            <Switch
              value={settings.showTranslation}
              onValueChange={(val) => updateSettings({ showTranslation: val })}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={settings.showTranslation ? COLORS.primaryDark : '#f4f3f4'}
            />
          </View>

          {settings.showTranslation && (
            <View style={styles.langSelectorBox}>
              <Text style={styles.langSelectorTitle}>Translation Language / অনুবাদের ভাষা</Text>
              <View style={styles.langOptionsRow}>
                {[
                  { id: 'english', label: 'English', sub: 'Saheeh Int.' },
                  { id: 'bangla', label: 'বাংলা', sub: 'মুহিউদ্দীন খান' },
                  { id: 'both', label: 'উভয়টি', sub: 'English + বাংলা' },
                ].map((opt) => {
                  const isSelected = (settings.translationLanguage || 'english') === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.langOptionBtn, isSelected && styles.langOptionBtnActive]}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch {}
                        updateSettings({ translationLanguage: opt.id as TranslationLanguage });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.langOptionLabel, isSelected && styles.langOptionLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.langOptionSub, isSelected && styles.langOptionSubActive]}>
                        {opt.sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.rowTitle}>Transliteration</Text>
              <Text style={styles.rowSub}>Phonetic English pronunciation guide</Text>
            </View>
            <Switch
              value={settings.showTransliteration}
              onValueChange={(val) => updateSettings({ showTransliteration: val })}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={settings.showTransliteration ? COLORS.primaryDark : '#f4f3f4'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.rowTitle}>Word-by-Word Breakdown</Text>
              <Text style={styles.rowSub}>Show vocabulary cards for each Arabic word</Text>
            </View>
            <Switch
              value={settings.showWbw}
              onValueChange={(val) => updateSettings({ showWbw: val })}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={settings.showWbw ? COLORS.primaryDark : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Dynamic Reciter Picker */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Audio Reciter</Text>
          <Text style={styles.rowSub}>Select your preferred reciter (EveryAyah CDN)</Text>

          <View style={styles.recitersContainer}>
            {RECITERS_LIST.map((r) => {
              const isSelected = (settings.reciter || 'Alafasy_128kbps') === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.reciterItem, isSelected && styles.reciterItemActive]}
                  onPress={() => handleSelectReciter(r.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reciterRadio}>
                    {isSelected && <View style={styles.reciterRadioInner} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.reciterNameText, isSelected && styles.reciterNameTextActive]}>
                      {r.name}
                    </Text>
                    <Text style={styles.reciterSubText}>
                      {r.subname} • {r.bitrate}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reader Profile Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Reader Profile</Text>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.rowTitle}>{profile.name}</Text>
              <Text style={styles.rowSub}>Greeting name across the companion</Text>
            </View>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => {
                setEditNameText(profile.name);
                setIsNameModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.editProfileText}>Edit Name</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data & Progress Management */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Data Management</Text>
          <Text style={styles.rowSub}>Reset reading progress and start fresh</Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.resetBtnText}>Reset Reading Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Quran Accuracy & Source Transparency Section */}
        <View style={styles.sectionCard}>
          <View style={styles.accuracyHeaderRow}>
            <View style={styles.accuracyShieldBadge}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.sectionHeader}>Quran Accuracy & Sources</Text>
              <Text style={styles.rowSub}>The foundational trust of the Ayara companion</Text>
            </View>
          </View>

          {/* Row 1: Verified Sources & Provenance */}
          <TouchableOpacity
            style={styles.accuracyRowItem}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setIsSourcesModalVisible(true);
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View verified Quran sources and authenticity"
          >
            <View style={styles.accuracyRowIcon}>
              <Ionicons name="library-outline" size={18} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.rowTitle}>Sources & Methodology</Text>
              <Text style={styles.rowSub}>Tanzil Uthmani, Saheeh Int., EveryAyah & Corpus</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 2: Stopping Signs (Waqf) Guide */}
          <TouchableOpacity
            style={styles.accuracyRowItem}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setIsWaqfModalVisible(true);
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open Quranic stopping signs and typography guide"
          >
            <View style={styles.accuracyRowIcon}>
              <Ionicons name="pause-circle-outline" size={18} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.rowTitle}>Stopping Signs (Waqf) Guide</Text>
              <Text style={styles.rowSub}>Explanation of مـ, لا, ج, صلى, قلى, and Sajdah marks</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 3: Report Suspected Discrepancy */}
          <TouchableOpacity
            style={styles.accuracyRowItem}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
              setIsReportModalVisible(true);
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Report suspected content or translation discrepancy"
          >
            <View style={[styles.accuracyRowIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="flag-outline" size={18} color="#DC2626" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.rowTitle}>Report a Content Discrepancy</Text>
              <Text style={styles.rowSub}>Report suspected typos, translations or audio glitches</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Row 4 (if any reports submitted): View Submitted Reports */}
          {submittedReports.length > 0 && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.accuracyRowItem}
                onPress={() => setIsViewReportsVisible(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.accuracyRowIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="document-text-outline" size={18} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.rowTitle}>My Submitted Reports ({submittedReports.length})</Text>
                  <Text style={styles.rowSub}>View previously submitted feedback records</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Creator & Developer Signature */}
        <View style={styles.signatureCard}>
          <View style={styles.signatureTopRow}>
            <View style={styles.signatureAvatar}>
              <Text style={styles.signatureAvatarText}>AM</Text>
            </View>
            <View style={styles.signatureMeta}>
              <View style={styles.signatureBadgeRow}>
                <Text style={styles.signatureBadgeText}>CREATOR & DEVELOPER</Text>
                <View style={styles.signatureVerifiedPill}>
                  <Ionicons name="checkmark-circle" size={11} color="#059669" />
                  <Text style={styles.signatureVerifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.signatureName}>Arafat Mollah</Text>
              <Text style={styles.signatureSub}>Software Engineer • Ayara Creator</Text>
            </View>
          </View>

          <View style={styles.signatureQuoteBox}>
            <Text style={styles.signatureArabicDua}>جَزَاكُمُ ٱللَّٰهُ خَيْرًا</Text>
            <Text style={styles.signatureQuoteText}>
              I built Ayara with sincere reverence to make the Holy Quran accessible, verifiable, and beautiful. If this app benefits you, please keep me and my parents in your sincere duas.
            </Text>
          </View>

          {/* Quick Connect & Links */}
          <View style={styles.signatureActionsRow}>
            <TouchableOpacity
              style={styles.signatureActionBtn}
              onPress={() => handleOpenLink('https://github.com/arafatmollah', 'GitHub Profile')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Visit GitHub Profile"
            >
              <Ionicons name="logo-github" size={15} color={COLORS.textPrimary} />
              <Text style={styles.signatureActionText}>GitHub</Text>
              <Ionicons name="open-outline" size={11} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signatureActionBtn}
              onPress={() => handleOpenLink('https://github.com/arafatmollah/Ayara', 'Ayara GitHub Repository')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View Ayara Source Repository"
            >
              <Ionicons name="git-branch-outline" size={15} color={COLORS.primary} />
              <Text style={[styles.signatureActionText, { color: COLORS.primaryDark }]}>Repository</Text>
              <Ionicons name="open-outline" size={11} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signatureActionBtn}
              onPress={() =>
                handleOpenLink(
                  'mailto:arafatshuvo18@gmail.com?subject=Ayara%20Quran%20App%20Message',
                  'Email'
                )
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Send Email"
            >
              <Ionicons name="mail-outline" size={15} color="#059669" />
              <Text style={[styles.signatureActionText, { color: '#059669' }]}>Contact</Text>
              <Ionicons name="arrow-forward-outline" size={11} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>

        {/* About App Info */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Ayara (آيَارَى) v{getCurrentVersion()}</Text>
          <Text style={styles.aboutText}>
            Built with reverence, verified sources, and open-source transparency.{'\n'}
            May Allah accept this effort from all who recite, memorize, and learn.
          </Text>
          <View style={styles.aboutActionsRow}>
            <TouchableOpacity
              style={styles.updateCheckBtn}
              onPress={handleCheckForUpdates}
              disabled={isCheckingUpdate}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Check for updates on GitHub"
            >
              {isCheckingUpdate ? (
                <ActivityIndicator size="small" color={COLORS.primaryDark} />
              ) : (
                <>
                  <Ionicons name="cloud-download-outline" size={16} color={COLORS.primaryDark} />
                  <Text style={styles.updateCheckBtnText}>Check for Updates</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsNewBtn}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setIsWhatsNewVisible(true);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View what's new in this release"
            >
              <Ionicons name="sparkles-outline" size={16} color={COLORS.primaryDark} />
              <Text style={styles.whatsNewBtnText}>What’s New</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Name Modal */}
      <Modal
        visible={isNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Profile Name</Text>
            <Text style={styles.modalSub}>
              Enter how you want Quran companion to greet you
            </Text>

            <TextInput
              style={styles.nameTextInput}
              placeholder="Your name..."
              placeholderTextColor={COLORS.textMuted}
              value={editNameText}
              onChangeText={setEditNameText}
              autoFocus
              maxLength={24}
            />

            <View style={styles.nameModalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsNameModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nameSaveBtn}
                onPress={handleSaveName}
              >
                <Text style={styles.nameSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sources & Transparency Modal */}
      <SourcesTransparencyModal
        visible={isSourcesModalVisible}
        onClose={() => setIsSourcesModalVisible(false)}
        onOpenErrorReport={() => setIsReportModalVisible(true)}
      />

      {/* Waqf Stopping Signs Guide Modal */}
      <WaqfSignsModal
        visible={isWaqfModalVisible}
        onClose={() => setIsWaqfModalVisible(false)}
      />

      {/* Content Error Reporting Modal */}
      <ContentErrorReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        onSubmitted={(newReport) => {
          setSubmittedReports((prev) => [newReport, ...prev]);
        }}
      />

      {/* What's New Release Modal */}
      <WhatsNewModal
        visible={isWhatsNewVisible}
        onClose={() => setIsWhatsNewVisible(false)}
      />

      {/* Submitted Reports Modal */}
      <Modal
        visible={isViewReportsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsViewReportsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.reportsHeaderRow}>
              <Text style={styles.modalTitle}>My Submitted Reports</Text>
              <TouchableOpacity
                onPress={() => setIsViewReportsVisible(false)}
                style={styles.closeBtnSmall}
              >
                <Ionicons name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              All reported items are queued for review against the King Fahd Complex Mushaf.
            </Text>

            <ScrollView style={{ marginTop: 12 }}>
              {submittedReports.map((r) => (
                <View key={r.id} style={styles.reportItemCard}>
                  <View style={styles.reportItemTop}>
                    <Text style={styles.reportItemBadge}>
                      Surah {r.surah}:{r.ayah} • {r.category}
                    </Text>
                    <Text style={styles.reportItemStatus}>{r.status}</Text>
                  </View>
                  <Text style={styles.reportItemDesc}>{r.description}</Text>
                  {r.suggestedCorrection && (
                    <Text style={styles.reportItemCorrection}>
                      Suggestion: {r.suggestedCorrection}
                    </Text>
                  )}
                  <Text style={styles.reportItemDate}>
                    {new Date(r.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 16,
  },
  subGreeting: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  previewLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  previewArabic: {
    fontFamily: FONTS.arabicSemiBold,
    color: COLORS.textArabic,
    textAlign: 'center',
    marginBottom: 8,
  },
  previewTranslit: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewTrans: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  rowSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  fontControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fontBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.primaryDark,
    minWidth: 24,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  reciterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reciterIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  signatureCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    ...SHADOWS.md,
  },
  signatureTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  signatureAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySurface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  signatureAvatarText: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  signatureMeta: {
    flex: 1,
  },
  signatureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  signatureBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  signatureVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  signatureVerifiedText: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    color: '#059669',
    textTransform: 'uppercase',
  },
  signatureName: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  signatureSub: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  signatureQuoteBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signatureArabicDua: {
    fontFamily: FONTS.arabicSemiBold,
    fontSize: 17,
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  signatureQuoteText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  signatureActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  signatureActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signatureActionText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  aboutCard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  aboutText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  aboutActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  updateCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  updateCheckBtnText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  whatsNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  whatsNewBtnText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  goalPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  goalPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalPillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  goalPillNum: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  goalPillNumActive: {
    color: COLORS.textInverse,
  },
  goalPillLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  goalPillLabelActive: {
    color: '#D1E0D9',
  },
  recitersContainer: {
    marginTop: 12,
    gap: 8,
  },
  reciterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reciterItemActive: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primary,
  },
  reciterRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reciterRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  reciterNameText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  reciterNameTextActive: {
    color: COLORS.primaryDark,
  },
  reciterSubText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  editProfileBtn: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  editProfileText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  resetBtnText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  modalSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  nameTextInput: {
    width: '100%',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  nameModalActionsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  nameSaveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  nameSaveText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textInverse,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  accuracyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  accuracyShieldBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  accuracyRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  accuracyRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  closeBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportItemCard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    width: '100%',
  },
  reportItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reportItemBadge: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  reportItemStatus: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  reportItemDesc: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
    lineHeight: 17,
    marginBottom: 4,
  },
  reportItemCorrection: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.primaryDark,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  reportItemDate: {
    fontSize: 10,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
  },
  timePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  timePillText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  timePillTextActive: {
    color: COLORS.textInverse,
  },
  langSelectorBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langSelectorTitle: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  langOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langOptionBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langOptionBtnActive: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primaryDark,
  },
  langOptionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  langOptionLabelActive: {
    color: COLORS.primaryDark,
  },
  langOptionSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  langOptionSubActive: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.sansMedium,
  },
});
