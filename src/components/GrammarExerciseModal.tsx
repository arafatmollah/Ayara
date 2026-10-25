import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { getDailyGrammarExercise } from '../services/grammarData';
import { incrementMissionProgress } from '../services/storage';
import { DailyGrammarExercise } from '../types/quran';

interface GrammarExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onCompleted?: () => void;
  topicId?: string;
}

type ModalViewMode = 'lesson' | 'quiz' | 'completed';

export const GrammarExerciseModal: React.FC<GrammarExerciseModalProps> = ({
  visible,
  onClose,
  onCompleted,
  topicId,
}) => {
  // Load the exercise definition based on topicId or today's topic
  const [exercise, setExercise] = useState<DailyGrammarExercise>(() =>
    getDailyGrammarExercise(topicId)
  );
  const [viewMode, setViewMode] = useState<ModalViewMode>('lesson');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // If topicId changes while open, refresh exercise
  const [trackedTopicId, setTrackedTopicId] = useState(topicId);
  if (trackedTopicId !== topicId) {
    setTrackedTopicId(topicId);
    setExercise(getDailyGrammarExercise(topicId));
    setViewMode('lesson');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setCorrectAnswersCount(0);
  }

  const handleStartPractice = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setViewMode('quiz');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return; // Already answered
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedOption(index);
    const currentQ = exercise.questions[currentQuestionIndex];
    if (index === currentQ.correctAnswerIndex) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (currentQuestionIndex + 1 < exercise.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // Completed all 3 questions!
      try {
        await incrementMissionProgress('grammar_exercise', 1);
        if (onCompleted) onCompleted();
      } catch {}
      setViewMode('completed');
    }
  };

  const handleReset = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setViewMode('lesson');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setCorrectAnswersCount(0);
  };

  const currentQ = exercise.questions[currentQuestionIndex];
  const progressPercent = Math.round(
    ((currentQuestionIndex + (selectedOption !== null ? 1 : 0)) /
      exercise.questions.length) *
      100
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Close grammar modal"
          >
            <Ionicons name="close" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerSup}>DAILY LEARNING MISSION</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Quranic Grammar Practice
            </Text>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* ---------------- VIEW 1: LESSON OVERVIEW ---------------- */}
        {viewMode === 'lesson' && (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.lessonScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Topic Hero Card */}
            <View style={styles.topicHeroCard}>
              <View style={styles.topicBadgeRow}>
                <View style={styles.topicBadge}>
                  <Ionicons name="school" size={14} color={COLORS.primary} />
                  <Text style={styles.topicBadgeText}>Grammar Rule</Text>
                </View>
                <View style={styles.featurePill}>
                  <Text style={styles.featurePillText}>{exercise.topicFeature}</Text>
                </View>
              </View>

              <Text style={styles.topicTitle}>{exercise.topicTitle}</Text>
              <Text style={styles.topicSummary}>{exercise.summary}</Text>
            </View>

            {/* Key Quranic Rules / Points */}
            <View style={styles.pointsSection}>
              <Text style={styles.sectionHeading}>Key Grammar Points</Text>
              {exercise.points.map((pt, idx) => (
                <View key={idx} style={styles.pointRow}>
                  <View style={styles.pointNumberBadge}>
                    <Text style={styles.pointNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.pointText}>{pt}</Text>
                </View>
              ))}
            </View>

            {/* Spiritual & Educational Istiqamah Note */}
            <View style={styles.spiritualNoteCard}>
              <Ionicons name="sparkles" size={18} color={COLORS.gold} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.spiritualNoteTitle}>Consistency in Learning</Text>
                <Text style={styles.spiritualNoteBody}>
                  Understanding the grammatical building blocks unlocks the deep beauty
                  and eloquence of the Quranic discourse word by word.
                </Text>
              </View>
            </View>

            {/* Start Practice CTA */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleStartPractice}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Start 3 Question Practice"
            >
              <Text style={styles.primaryActionButtonText}>
                Start 3-Question Practice
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ---------------- VIEW 2: QUIZ / PRACTICE ---------------- */}
        {viewMode === 'quiz' && currentQ && (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.quizScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Progress Bar & Question Counter */}
            <View style={styles.quizProgressHeader}>
              <View style={styles.quizCounterRow}>
                <Text style={styles.quizStepText}>
                  Question {currentQuestionIndex + 1} of {exercise.questions.length}
                </Text>
                <Text style={styles.quizTopicTag}>{exercise.topicTitle}</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>

            {/* Question Text */}
            <Text style={styles.questionText}>{currentQ.question}</Text>

            {/* Quranic Arabic Snippet (if present) */}
            {currentQ.arabicSnippet && (
              <View style={styles.arabicSnippetBox}>
                <Text style={styles.arabicSnippetText}>{currentQ.arabicSnippet}</Text>
                {currentQ.transliteration && (
                  <Text style={styles.arabicSnippetTrans}>{currentQ.transliteration}</Text>
                )}
                {currentQ.translation && (
                  <Text style={styles.arabicSnippetMeaning}>{currentQ.translation}</Text>
                )}
              </View>
            )}

            {/* Options List */}
            <View style={styles.optionsList}>
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isAnswered = selectedOption !== null;
                const isCorrect = optIdx === currentQ.correctAnswerIndex;

                let optCardStyle = styles.optionCard;
                let optTextStyle = styles.optionText;
                let badgeIcon = null;

                if (isAnswered) {
                  if (isCorrect) {
                    optCardStyle = styles.optionCardCorrect;
                    optTextStyle = styles.optionTextCorrect;
                    badgeIcon = (
                      <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    );
                  } else if (isSelected) {
                    optCardStyle = styles.optionCardWrong;
                    optTextStyle = styles.optionTextWrong;
                    badgeIcon = (
                      <Ionicons name="close-circle" size={20} color="#DC2626" />
                    );
                  }
                }

                return (
                  <TouchableOpacity
                    key={optIdx}
                    style={optCardStyle}
                    onPress={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLetterBadge}>
                      <Text style={styles.optionLetterText}>
                        {String.fromCharCode(65 + optIdx)}
                      </Text>
                    </View>
                    <Text style={optTextStyle}>{option}</Text>
                    {badgeIcon && <View style={styles.optionBadgeWrap}>{badgeIcon}</View>}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explanation Card (Appears upon answer) */}
            {selectedOption !== null && (
              <View style={styles.explanationBox}>
                <View style={styles.explanationTitleRow}>
                  <Ionicons
                    name={
                      selectedOption === currentQ.correctAnswerIndex
                        ? 'checkmark-circle'
                        : 'information-circle'
                    }
                    size={18}
                    color={
                      selectedOption === currentQ.correctAnswerIndex
                        ? '#059669'
                        : COLORS.primaryDark
                    }
                  />
                  <Text style={styles.explanationTitle}>
                    {selectedOption === currentQ.correctAnswerIndex
                      ? 'Correct!'
                      : 'Grammar Note:'}
                  </Text>
                </View>
                <Text style={styles.explanationText}>{currentQ.explanation}</Text>
              </View>
            )}

            {/* Bottom Next / Finish Button */}
            {selectedOption !== null && (
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={handleNextQuestion}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionButtonText}>
                  {currentQuestionIndex + 1 < exercise.questions.length
                    ? 'Next Question'
                    : 'Complete Grammar Mission'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* ---------------- VIEW 3: COMPLETED STATE ---------------- */}
        {viewMode === 'completed' && (
          <View style={styles.completedContainer}>
            <View style={styles.completedCard}>
              <View style={styles.completedIconCircle}>
                <Ionicons name="checkmark-done" size={40} color="#059669" />
              </View>

              <Text style={styles.completedBadgeTag}>MISSION COMPLETED</Text>
              <Text style={styles.completedTitle}>Grammar Exercise Done</Text>

              <Text style={styles.completedArabicText}>
                الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
              </Text>

              <Text style={styles.completedSub}>
                You completed today&apos;s exercise on &ldquo;{exercise.topicTitle}&rdquo; with{' '}
                {correctAnswersCount} of {exercise.questions.length} correct.
              </Text>

              <View style={styles.completedDivider} />

              <View style={styles.spiritualRewardBox}>
                <Ionicons name="heart" size={18} color="#F87171" />
                <Text style={styles.spiritualRewardText}>
                  &ldquo;Whoever treads a path seeking knowledge, Allah makes easy for him a
                  path to Paradise.&rdquo; — Sahih Muslim
                </Text>
              </View>

              <View style={styles.completedButtonRow}>
                <TouchableOpacity
                  style={styles.reviewLessonBtn}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={16} color={COLORS.primary} />
                  <Text style={styles.reviewLessonBtnText}>Review Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.doneBtnText}>Return to Daily Plan</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.explorePathsBtn}
                onPress={() => {
                  onClose();
                  router.push('/learn');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="school" size={16} color={COLORS.primaryDark} />
                <Text style={styles.explorePathsBtnText}>Explore Full 5-Course Learning Paths</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.primaryDark} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerSup: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    letterSpacing: 1.2,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  headerRightSpacer: {
    width: 36,
  },
  scrollArea: {
    flex: 1,
  },
  lessonScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topicHeroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    ...SHADOWS.sm,
    marginBottom: 16,
  },
  topicBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  topicBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.primaryDark,
  },
  featurePill: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featurePillText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  topicTitle: {
    fontSize: 20,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  topicSummary: {
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  pointsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pointNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  pointNumberText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  spiritualNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldSurface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    marginBottom: 20,
  },
  spiritualNoteTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.goldDark,
    marginBottom: 2,
  },
  spiritualNoteBody: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.goldDark,
    lineHeight: 17,
  },
  primaryActionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  primaryActionButtonText: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
  quizScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  quizProgressHeader: {
    marginBottom: 18,
  },
  quizCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizStepText: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  quizTopicTag: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  questionText: {
    fontSize: 17,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: 14,
  },
  arabicSnippetBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  arabicSnippetText: {
    fontSize: 26,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    textAlign: 'center',
    marginBottom: 4,
  },
  arabicSnippetTrans: {
    fontSize: 14,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  arabicSnippetMeaning: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCardCorrect: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCardWrong: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetterBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionLetterText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  optionTextCorrect: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: '#065F46',
    lineHeight: 20,
  },
  optionTextWrong: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: '#991B1B',
    lineHeight: 20,
  },
  optionBadgeWrap: {
    marginLeft: 8,
  },
  explanationBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  explanationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  explanationTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  explanationText: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  completedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  completedIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completedBadgeTag: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    letterSpacing: 1.2,
    color: '#059669',
    marginBottom: 4,
  },
  completedTitle: {
    fontSize: 20,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  completedArabicText: {
    fontSize: 22,
    fontFamily: FONTS.arabicBold,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginVertical: 8,
  },
  completedSub: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  completedDivider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  spiritualRewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 20,
    gap: 8,
  },
  spiritualRewardText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: '#9A3412',
    lineHeight: 17,
  },
  completedButtonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  reviewLessonBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  reviewLessonBtnText: {
    fontSize: 13,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.primaryDark,
  },
  doneBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  doneBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
  explorePathsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginTop: 10,
    width: '100%',
    gap: 6,
  },
  explorePathsBtnText: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
});
