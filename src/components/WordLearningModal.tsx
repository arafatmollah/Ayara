import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { WordLearningDetails, WordOccurrenceRef, SavedWordItem } from '../types/quran';
import { isVocabularyWordSaved, toggleSaveVocabularyWord } from '../services/storage';

interface WordLearningModalProps {
  visible: boolean;
  wordDetails: WordLearningDetails | null;
  onClose: () => void;
  onNavigateToAyah?: (surah: number, ayah: number) => void;
  onReportWord?: (wordDetails: WordLearningDetails) => void;
}

type TabType = 'root' | 'grammar' | 'occurrences';

export const WordLearningModal: React.FC<WordLearningModalProps> = ({
  visible,
  wordDetails,
  onClose,
  onNavigateToAyah,
  onReportWord,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('root');
  const [isSaved, setIsSaved] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const currentWordKey = wordDetails
    ? `${wordDetails.surah}:${wordDetails.ayah}:${wordDetails.wordIndex}`
    : '';
  const [trackedWordKey, setTrackedWordKey] = useState(currentWordKey);

  if (trackedWordKey !== currentWordKey) {
    setTrackedWordKey(currentWordKey);
    setActiveTab('root');
    setSaveToast(null);
  }

  // Audio player for word pronunciation
  const audioUrl = wordDetails?.audioUrl || null;
  const wordAudioPlayer = useAudioPlayer(audioUrl);
  const audioStatus = useAudioPlayerStatus(wordAudioPlayer);

  // Check saved state when wordDetails change
  useEffect(() => {
    let active = true;
    if (wordDetails) {
      const id = `${wordDetails.surah}:${wordDetails.ayah}:${wordDetails.wordIndex}`;
      isVocabularyWordSaved(id).then((saved) => {
        if (active) setIsSaved(saved);
      });
    }
    return () => {
      active = false;
    };
  }, [wordDetails]);

  if (!wordDetails) return null;

  const handlePlayWordAudio = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (!wordAudioPlayer) return;
    if (audioStatus.playing) {
      wordAudioPlayer.pause();
    } else {
      wordAudioPlayer.seekTo(0);
      wordAudioPlayer.play();
    }
  };

  const handleToggleSave = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const id = `${wordDetails.surah}:${wordDetails.ayah}:${wordDetails.wordIndex}`;
    const item: SavedWordItem = {
      id,
      arabic: wordDetails.arabic,
      transliteration: wordDetails.transliteration,
      english: wordDetails.english,
      rootAr: wordDetails.root?.arabic,
      rootMeaning: wordDetails.root?.meaning,
      grammarRole: wordDetails.grammar.roles.join(' • '),
      surah: wordDetails.surah,
      ayah: wordDetails.ayah,
      surahName: wordDetails.surahName,
      surahNameAr: wordDetails.surahNameAr,
      timestamp: Date.now(),
    };

    const newlySaved = await toggleSaveVocabularyWord(item);
    setIsSaved(newlySaved);
    setSaveToast(newlySaved ? 'Saved to Vocabulary!' : 'Removed from Vocabulary');
    setTimeout(() => {
      setSaveToast(null);
    }, 2200);
  };

  const handleJumpToOccurrence = (occ: WordOccurrenceRef) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onClose();
    onNavigateToAyah?.(occ.surah, occ.ayah);
  };

  const { root, grammar, occurrences } = wordDetails;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Top Grabber */}
          <View style={styles.grabber} />

          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerLocationBadge}>
              <Ionicons name="book-outline" size={13} color={COLORS.primaryDark} />
              <Text style={styles.headerLocationText}>
                {wordDetails.surahName} • {wordDetails.surah}:{wordDetails.ayah} (Word {wordDetails.wordIndex + 1})
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => onReportWord?.(wordDetails)}
                style={styles.headerActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Report issue with this word"
              >
                <Ionicons name="flag-outline" size={17} color={COLORS.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleSave}
                style={[styles.headerActionBtn, isSaved && styles.headerActionBtnActive]}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? 'Remove from vocabulary' : 'Save to vocabulary'}
              >
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={19}
                  color={isSaved ? COLORS.gold : COLORS.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={styles.headerActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Toast Notification */}
          {saveToast && (
            <View style={styles.toastBox}>
              <Ionicons name={isSaved ? 'checkmark-circle' : 'trash'} size={15} color={COLORS.textInverse} />
              <Text style={styles.toastText}>{saveToast}</Text>
            </View>
          )}

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Word Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroArabicRow}>
                <Text style={styles.heroArabicText}>{wordDetails.arabic}</Text>

                <TouchableOpacity
                  style={[styles.audioPlayBtn, audioStatus.playing && styles.audioPlayBtnPlaying]}
                  onPress={handlePlayWordAudio}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Pronounce word"
                >
                  {audioStatus.isBuffering ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons
                      name={audioStatus.playing ? 'volume-high' : 'volume-medium-outline'}
                      size={22}
                      color={audioStatus.playing ? COLORS.primary : COLORS.primaryDark}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.heroTranslitText}>{wordDetails.transliteration}</Text>

              <View style={styles.meaningTag}>
                <Text style={styles.meaningTagLabel}>MEANING</Text>
                <Text style={styles.meaningTagText}>{wordDetails.english}</Text>
              </View>
            </View>

            {/* Segmented Switcher */}
            <View style={styles.segmentedContainer}>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'root' && styles.segmentBtnActive]}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setActiveTab('root');
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="git-commit-outline"
                  size={15}
                  color={activeTab === 'root' ? COLORS.primaryDark : COLORS.textMuted}
                />
                <Text style={[styles.segmentText, activeTab === 'root' && styles.segmentTextActive]}>
                  Root & Family
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'grammar' && styles.segmentBtnActive]}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setActiveTab('grammar');
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="school-outline"
                  size={15}
                  color={activeTab === 'grammar' ? COLORS.primaryDark : COLORS.textMuted}
                />
                <Text style={[styles.segmentText, activeTab === 'grammar' && styles.segmentTextActive]}>
                  Grammar Role
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'occurrences' && styles.segmentBtnActive]}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setActiveTab('occurrences');
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="list-outline"
                  size={15}
                  color={activeTab === 'occurrences' ? COLORS.primaryDark : COLORS.textMuted}
                />
                <Text style={[styles.segmentText, activeTab === 'occurrences' && styles.segmentTextActive]}>
                  Occurrences ({occurrences.count})
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB CONTENT 1: ROOT & ETYMOLOGY */}
            {activeTab === 'root' && (
              <View style={styles.tabContentSection}>
                {root ? (
                  <View style={styles.rootCard}>
                    <View style={styles.rootHeaderRow}>
                      <View>
                        <Text style={styles.rootSubLabel}>TRILATERAL ROOT</Text>
                        <Text style={styles.rootArabicBig}>{root.arabic}</Text>
                      </View>
                      <View style={styles.rootCountBadge}>
                        <Ionicons name="sparkles" size={13} color={COLORS.gold} />
                        <Text style={styles.rootCountBadgeText}>{root.count} times</Text>
                      </View>
                    </View>

                    <View style={styles.rootMeaningBox}>
                      <Text style={styles.rootMeaningLabel}>Root Meaning:</Text>
                      <Text style={styles.rootMeaningValue}>{root.meaning}</Text>
                    </View>

                    {root.derivatives && root.derivatives.length > 0 && (
                      <View style={styles.derivativesContainer}>
                        <Text style={styles.derivativesTitle}>Quranic Derivatives from this Root:</Text>
                        <View style={styles.derivativesRow}>
                          {root.derivatives.map((der, dIdx) => (
                            <View key={dIdx} style={styles.derivativePill}>
                              <Text style={styles.derivativeArabic}>{der.ar}</Text>
                              <Text style={styles.derivativeCount}>{der.count}x</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyRootCard}>
                    <Ionicons name="information-circle-outline" size={32} color={COLORS.textMuted} />
                    <Text style={styles.emptyRootTitle}>Grammatical Particle / Pronoun</Text>
                    <Text style={styles.emptyRootSub}>
                      This word is a direct connecting particle, pronoun, or preposition which does not stem from a
                      triliteral root.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* TAB CONTENT 2: GRAMMAR ROLE */}
            {activeTab === 'grammar' && (
              <View style={styles.tabContentSection}>
                <View style={styles.grammarCard}>
                  <Text style={styles.sectionHeaderLabel}>GRAMMATICAL BREAKDOWN</Text>

                  {/* Role Badges */}
                  <View style={styles.roleBadgesWrap}>
                    {grammar.roles.map((role, rIdx) => (
                      <View key={rIdx} style={styles.roleChip}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                        <Text style={styles.roleChipText}>{role}</Text>
                      </View>
                    ))}
                    {grammar.grammarCase ? (
                      <View style={[styles.roleChip, styles.caseChip]}>
                        <Ionicons name="bookmark" size={14} color={COLORS.gold} />
                        <Text style={[styles.roleChipText, styles.caseChipText]}>{grammar.grammarCase}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Linked Pedagogical Grammar Topic */}
                  {grammar.topic ? (
                    <View style={styles.topicBox}>
                      <View style={styles.topicHeaderRow}>
                        <Ionicons name="book" size={17} color={COLORS.primary} />
                        <Text style={styles.topicTitle}>{grammar.topic.title}</Text>
                      </View>
                      <Text style={styles.topicSummary}>{grammar.topic.summary}</Text>

                      {grammar.topic.points && grammar.topic.points.length > 0 && (
                        <View style={styles.topicPointsList}>
                          {grammar.topic.points.map((pt, pIdx) => (
                            <View key={pIdx} style={styles.topicPointRow}>
                              <Text style={styles.topicBullet}>•</Text>
                              <Text style={styles.topicPointText}>{pt}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {/* TAB CONTENT 3: OTHER OCCURRENCES */}
            {activeTab === 'occurrences' && (
              <View style={styles.tabContentSection}>
                <View style={styles.occurrencesBanner}>
                  <Ionicons name="compass-outline" size={18} color={COLORS.primaryDark} />
                  <Text style={styles.occurrencesBannerText}>
                    Appears {occurrences.count} {occurrences.count === 1 ? 'time' : 'times'} in the Holy Quran
                  </Text>
                </View>

                {occurrences.refs && occurrences.refs.length > 0 ? (
                  <View style={styles.occListContainer}>
                    {occurrences.refs.map((occ, oIdx) => (
                      <TouchableOpacity
                        key={oIdx}
                        style={styles.occCard}
                        onPress={() => handleJumpToOccurrence(occ)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.occCardLeft}>
                          <View style={styles.occRefBadge}>
                            <Text style={styles.occRefBadgeText}>
                              {occ.surah}:{occ.ayah}
                            </Text>
                          </View>
                          <View style={styles.occTextBox}>
                            <Text style={styles.occSurahName}>{occ.surahName}</Text>
                            <Text style={styles.occArabicSnippet}>{occ.arabic}</Text>
                            <Text style={styles.occEnglishSnippet}>{`"${occ.english}"`}</Text>
                          </View>
                        </View>

                        <View style={styles.occJumpBtn}>
                          <Text style={styles.occJumpBtnText}>Go to Verse</Text>
                          <Ionicons name="arrow-forward" size={13} color={COLORS.primaryDark} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noOccText}>No additional occurrences recorded.</Text>
                )}
              </View>
            )}

            {/* Academic & Scholarly Provenance Tag */}
            <View style={styles.provenanceNotice}>
              <Ionicons name="shield-checkmark" size={13} color="#059669" />
              <Text style={styles.provenanceNoticeText}>
                Corpus Authority: The Quranic Arabic Corpus (Univ. of Leeds) & Classical Lexicons
              </Text>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Bottom Save Action Button */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity
              style={[styles.saveVocabBtn, isSaved && styles.saveVocabBtnActive]}
              onPress={handleToggleSave}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSaved ? 'checkmark-circle' : 'bookmark'}
                size={18}
                color={COLORS.textInverse}
              />
              <Text style={styles.saveVocabBtnText}>
                {isSaved ? 'Saved in Vocabulary Revision' : 'Save to My Vocabulary'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 11, 26, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  headerLocationText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionBtnActive: {
    backgroundColor: COLORS.goldSurface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  toastBox: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...SHADOWS.md,
  },
  toastText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.textInverse,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  heroCard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  heroArabicRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroArabicText: {
    fontFamily: FONTS.arabicBold,
    fontSize: 34,
    color: COLORS.textArabic,
    lineHeight: 56,
    textAlign: 'right',
  },
  audioPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    ...SHADOWS.sm,
  },
  audioPlayBtnPlaying: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primary,
  },
  heroTranslitText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  meaningTag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  meaningTagLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  meaningTagText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  segmentText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  tabContentSection: {
    marginBottom: 10,
  },
  rootCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  rootHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rootSubLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  rootArabicBig: {
    fontFamily: FONTS.arabicBold,
    fontSize: 26,
    color: COLORS.primaryDark,
    marginTop: 2,
    letterSpacing: 2,
  },
  rootCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.goldSurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  rootCountBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.goldDark,
  },
  rootMeaningBox: {
    backgroundColor: COLORS.surfaceSubtle,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  rootMeaningLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  rootMeaningValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  derivativesContainer: {
    marginTop: 4,
  },
  derivativesTitle: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  derivativesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  derivativePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  derivativeArabic: {
    fontFamily: FONTS.arabicMedium,
    fontSize: 15,
    color: COLORS.textArabic,
  },
  derivativeCount: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyRootCard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emptyRootTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  emptyRootSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  grammarCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionHeaderLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  roleBadgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  roleChipText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  caseChip: {
    backgroundColor: COLORS.goldSurface,
    borderColor: COLORS.goldBorder,
  },
  caseChipText: {
    color: COLORS.goldDark,
  },
  topicBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: 4,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  topicTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.primaryDark,
  },
  topicSummary: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
    marginBottom: 10,
  },
  topicPointsList: {
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  topicPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  topicBullet: {
    color: COLORS.primary,
    fontSize: 14,
    lineHeight: 18,
  },
  topicPointText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    flex: 1,
  },
  occurrencesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  occurrencesBannerText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  occListContainer: {
    gap: 8,
  },
  occCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  occCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  occRefBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  occRefBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  occTextBox: {
    flex: 1,
  },
  occSurahName: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  occArabicSnippet: {
    fontFamily: FONTS.arabicMedium,
    fontSize: 16,
    color: COLORS.textArabic,
    marginVertical: 2,
  },
  occEnglishSnippet: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  occJumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  occJumpBtnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.primaryDark,
  },
  noOccText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 20,
  },
  sheetFooter: {
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  saveVocabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    borderRadius: 16,
    ...SHADOWS.md,
  },
  saveVocabBtnActive: {
    backgroundColor: COLORS.goldDark,
  },
  saveVocabBtnText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.textInverse,
  },
  provenanceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  provenanceNoticeText: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: '#065F46',
    flex: 1,
  },
});
