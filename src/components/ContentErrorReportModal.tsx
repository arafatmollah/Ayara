import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { ContentErrorCategory, ContentErrorReport } from '../types/quran';
import { saveContentErrorReport } from '../services/storage';

interface ContentErrorReportModalProps {
  visible: boolean;
  onClose: () => void;
  initialSurah?: number;
  initialAyah?: number;
  initialSurahName?: string;
  initialWordIndex?: number;
  initialWordText?: string;
  initialArabicSnippet?: string;
  initialTranslationSnippet?: string;
  initialCategory?: ContentErrorCategory;
  onSubmitted?: (report: ContentErrorReport) => void;
}

const CATEGORIES: { id: ContentErrorCategory; label: string; icon: string }[] = [
  { id: 'arabic_text', label: 'Arabic & Tashkeel', icon: 'text' },
  { id: 'translation', label: 'Translation Meaning', icon: 'language' },
  { id: 'transliteration', label: 'Transliteration', icon: 'volume-medium' },
  { id: 'morphology_root', label: 'Word Root / Grammar', icon: 'git-commit' },
  { id: 'audio_recitation', label: 'Audio Glitch', icon: 'musical-notes' },
  { id: 'stopping_sign_waqf', label: 'Stopping Mark (Waqf)', icon: 'pause-circle' },
  { id: 'hadith_virtue', label: 'Hadith Reference', icon: 'book' },
  { id: 'other', label: 'Other Content Issue', icon: 'ellipsis-horizontal' },
];

export const ContentErrorReportModal: React.FC<ContentErrorReportModalProps> = ({
  visible,
  onClose,
  initialSurah,
  initialAyah,
  initialSurahName,
  initialWordIndex,
  initialWordText,
  initialArabicSnippet,
  initialTranslationSnippet,
  initialCategory = 'arabic_text',
  onSubmitted,
}) => {
  const [surah, setSurah] = useState<string>(initialSurah ? String(initialSurah) : '1');
  const [ayah, setAyah] = useState<string>(initialAyah ? String(initialAyah) : '1');
  const [category, setCategory] = useState<ContentErrorCategory>(initialCategory);
  const [description, setDescription] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      if (initialSurah) setSurah(String(initialSurah));
      if (initialAyah) setAyah(String(initialAyah));
      if (initialCategory) setCategory(initialCategory);
      setIsSubmittedSuccess(false);
      setDescription('');
      setSuggestedCorrection('');
      setReference('');
    }
  }

  const sNum = parseInt(surah, 10) || 1;
  const aNum = parseInt(ayah, 10) || 1;

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please provide a brief description of the suspected issue.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const report = await saveContentErrorReport({
      surah: sNum,
      ayah: aNum,
      surahName: initialSurahName,
      wordIndex: initialWordIndex,
      wordText: initialWordText,
      category,
      arabicSnippet: initialArabicSnippet,
      translationSnippet: initialTranslationSnippet,
      description: description.trim(),
      suggestedCorrection: suggestedCorrection.trim() || undefined,
      scholarlyReference: reference.trim() || undefined,
      userEmail: email.trim() || undefined,
    });

    setIsSubmittedSuccess(true);
    onSubmitted?.(report);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(
      `[Ayara Content Audit] Issue in Surah ${sNum}:${aNum} (${category})`
    );
    const body = encodeURIComponent(
      `Ayara Content Inaccuracy Report\n\n` +
      `Surah: ${sNum} ${initialSurahName ? `(${initialSurahName})` : ''}\n` +
      `Ayah: ${aNum}\n` +
      `${initialWordText ? `Word: ${initialWordText} (Word #${(initialWordIndex ?? 0) + 1})\n` : ''}` +
      `${initialArabicSnippet ? `Arabic Snippet: ${initialArabicSnippet}\n` : ''}` +
      `${initialTranslationSnippet ? `Translation: ${initialTranslationSnippet}\n` : ''}` +
      `Category: ${category}\n\n` +
      `Issue Description:\n${description}\n\n` +
      `Suggested Correction:\n${suggestedCorrection || 'None provided'}\n\n` +
      `Scholarly/Mushaf Reference:\n${reference || 'Standard Medina Mushaf'}\n\n` +
      `Reported via Ayara Mobile Companion`
    );
    Linking.openURL(`mailto:accuracy@ayara.app?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Notice', 'Unable to open email client. Your report has been recorded locally.');
    });
  };

  const resetAndClose = () => {
    setIsSubmittedSuccess(false);
    setDescription('');
    setSuggestedCorrection('');
    setReference('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={resetAndClose} />

        <View style={styles.sheet}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBox}>
                <Ionicons name="flag-outline" size={18} color="#DC2626" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Report a Content Discrepancy</Text>
                <Text style={styles.headerSub}>بَلِّغْ عَنْ خَطَإٍ فِي الْمُحْتَوَى</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={resetAndClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {isSubmittedSuccess ? (
            /* Success confirmation card */
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-circle" size={48} color="#059669" />
              </View>
              <Text style={styles.successArabic}>جَزَاكَ ٱللَّهُ خَيْرًا</Text>
              <Text style={styles.successTitle}>Report Submitted Successfully</Text>
              <Text style={styles.successText}>
                May Allah reward you abundantly for safeguarding the sacred text. Your report for Surah {sNum}:{aNum} has been saved locally and queued for review against the official King Fahd Complex Mushaf al-Madinah.
              </Text>

              <TouchableOpacity
                style={styles.emailDispatchBtn}
                onPress={handleSendEmail}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={16} color={COLORS.primaryDark} />
                <Text style={styles.emailDispatchText}>Send Copy to Editorial Team Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeSuccessBtn}
                onPress={resetAndClose}
                activeOpacity={0.85}
              >
                <Text style={styles.closeSuccessBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {/* Location Pre-fill Banner */}
              <View style={styles.contextCard}>
                <View style={styles.contextTopRow}>
                  <Text style={styles.contextBadge}>
                    Surah {sNum} {initialSurahName ? `(${initialSurahName})` : ''} • Ayah {aNum}
                  </Text>
                  {initialWordText && (
                    <Text style={styles.contextWordBadge}>Word: {initialWordText}</Text>
                  )}
                </View>
                {initialArabicSnippet && (
                  <Text style={styles.contextArabic} numberOfLines={2}>
                    {initialArabicSnippet}
                  </Text>
                )}
                {initialTranslationSnippet && (
                  <Text style={styles.contextTranslation} numberOfLines={2}>
                    {initialTranslationSnippet}
                  </Text>
                )}
              </View>

              {/* Category Picker */}
              <Text style={styles.inputLabel}>CATEGORY OF ISSUE</Text>
              <View style={styles.categoryWrap}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch {}
                        setCategory(cat.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={12}
                        color={isSelected ? COLORS.primaryDark : COLORS.textSecondary}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Issue Description Input */}
              <Text style={styles.inputLabel}>WHAT IS THE SUSPECTED INACCURACY? *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. Missing fathah over letter nun, or misaligned audio recitation at word 4..."
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              {/* Suggested Correction */}
              <Text style={styles.inputLabel}>SUGGESTED CORRECTION (OPTIONAL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Correct text with Tashkeel or accurate translation..."
                placeholderTextColor={COLORS.textMuted}
                value={suggestedCorrection}
                onChangeText={setSuggestedCorrection}
              />

              {/* Reference / Source */}
              <Text style={styles.inputLabel}>SCHOLARLY / MUSHAF REFERENCE (OPTIONAL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Mushaf al-Madinah page 142, or Tafsir Ibn Kathir..."
                placeholderTextColor={COLORS.textMuted}
                value={reference}
                onChangeText={setReference}
              />

              {/* User Email */}
              <Text style={styles.inputLabel}>YOUR EMAIL (OPTIONAL, FOR AUDIT FOLLOW-UP)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.actionsBox}>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                >
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.textInverse} />
                  <Text style={styles.submitBtnText}>Submit Inaccuracy Report</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.directEmailBtn}
                  onPress={handleSendEmail}
                  activeOpacity={0.7}
                >
                  <Ionicons name="mail" size={14} color={COLORS.primaryDark} />
                  <Text style={styles.directEmailText}>Send Directly via Email App</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
    ...SHADOWS.md,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: FONTS.arabicMedium,
    color: '#DC2626',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  contextCard: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 16,
  },
  contextTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  contextBadge: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  contextWordBadge: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  contextArabic: {
    fontFamily: FONTS.arabicSemiBold,
    fontSize: 18,
    color: COLORS.textArabic,
    textAlign: 'right',
    marginBottom: 4,
  },
  contextTranslation: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 6,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.sansBold,
  },
  textArea: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  actionsBox: {
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.sm,
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
  directEmailBtn: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  directEmailText: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primaryDark,
  },
  successContainer: {
    padding: 24,
    alignItems: 'center',
  },
  successIconBox: {
    marginBottom: 12,
  },
  successArabic: {
    fontFamily: FONTS.arabicBold,
    fontSize: 26,
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 17,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emailDispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primarySurface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  emailDispatchText: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  closeSuccessBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSuccessBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
});
