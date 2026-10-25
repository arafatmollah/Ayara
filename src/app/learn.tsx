import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import {
  getAllCourses,
} from '../services/learningPathsData';
import {
  getLearningPathProgress,
  markLessonCompleted,
  batchUpdateVocabularyWords,
  getSavedVocabulary,
} from '../services/storage';
import {
  LearningCourse,
  LearningLesson,
  LearningPathProgress,
  SavedWordItem,
} from '../types/quran';

type LevelFilter = 'all' | 'beginner' | 'elementary' | 'intermediate';
type LessonPhase = 'teach' | 'demonstrate' | 'quiz' | 'review';

export default function QuranicLearningPathsScreen() {
  const courses = getAllCourses();

  const [progress, setProgress] = useState<LearningPathProgress>({
    completedLessonIds: [],
    lastUpdated: 0,
  });

  const [activeLevel, setActiveLevel] = useState<LevelFilter>('all');
  const [expandedCourseIds, setExpandedCourseIds] = useState<Record<string, boolean>>({
    course_1_common_words: true,
  });

  // Active Lesson Runner State
  const [activeCourse, setActiveCourse] = useState<LearningCourse | null>(null);
  const [activeLesson, setActiveLesson] = useState<LearningLesson | null>(null);
  const [lessonPhase, setLessonPhase] = useState<LessonPhase>('teach');

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Vocabulary Save State
  const [isVocabSaved, setIsVocabSaved] = useState(false);

  const loadProgress = React.useCallback(async () => {
    const p = await getLearningPathProgress();
    setProgress(p);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const totalLessonsCount = courses.reduce((acc, c) => acc + c.lessons.length, 0);
  const completedLessonsCount = progress.completedLessonIds.length;
  const overallPercent = Math.min(
    100,
    totalLessonsCount > 0
      ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
      : 0
  );

  const filteredCourses = courses.filter((c) => {
    if (activeLevel === 'all') return true;
    return c.level === activeLevel;
  });

  const toggleCourseExpand = (courseId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setExpandedCourseIds((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleStartLesson = (course: LearningCourse, lesson: LearningLesson) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setActiveCourse(course);
    setActiveLesson(lesson);
    setLessonPhase('teach');
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setIsVocabSaved(false);
  };

  const handleExitLesson = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setActiveLesson(null);
    setActiveCourse(null);
    loadProgress();
  };

  const handleSelectQuizOption = (index: number) => {
    if (selectedQuizOption !== null || !activeLesson) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedQuizOption(index);
    const q = activeLesson.quizQuestions[currentQuizIndex];
    if (index === q.correctAnswerIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (!activeLesson) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (currentQuizIndex + 1 < activeLesson.quizQuestions.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedQuizOption(null);
    } else {
      setLessonPhase('review');
    }
  };

  const handleSaveLessonVocab = async () => {
    if (!activeLesson || isVocabSaved) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const existingVocab = await getSavedVocabulary();
    const existingIds = new Set(existingVocab.map((w) => w.id));

    const wordsToAdd: SavedWordItem[] = activeLesson.vocabularyToSave
      .filter((w) => !existingIds.has(w.id))
      .map((item) => ({
        id: item.id,
        arabic: item.arabic,
        transliteration: item.transliteration,
        english: item.english,
        rootAr: item.rootAr,
        surah: item.surah,
        ayah: item.ayah,
        surahName: item.surahName,
        timestamp: Date.now(),
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: Date.now(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracy: 0,
        status: 'learning',
        mastered: false,
      }));

    if (wordsToAdd.length > 0) {
      await batchUpdateVocabularyWords(wordsToAdd);
    }
    setIsVocabSaved(true);
  };

  const handleFinishLesson = async () => {
    if (!activeCourse || !activeLesson) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    await markLessonCompleted(activeCourse.id, activeLesson.id);
    handleExitLesson();
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* ================================================================= */}
      {/* 1. DIRECTORY MODE: Courses & Lessons Overview */}
      {/* ================================================================= */}
      {!activeLesson && (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.directoryHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.headerArabicTitle}>مَسَارَاتُ اللُّغَةِ القُرْآنِيَّةِ</Text>
              <Text style={styles.headerTitle}>Quranic Arabic Paths</Text>
            </View>
          </View>

          {/* Curriculum Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsTopRow}>
              <View style={styles.statsIconBox}>
                <Ionicons name="school" size={22} color={COLORS.primaryDark} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.statsTitle}>Curriculum Mastery</Text>
                <Text style={styles.statsSub}>
                  {completedLessonsCount} of {totalLessonsCount} Lessons Completed ({overallPercent}%)
                </Text>
              </View>
              <View style={styles.statsPercentBadge}>
                <Text style={styles.statsPercentText}>{overallPercent}%</Text>
              </View>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.max(2, overallPercent)}%` },
                ]}
              />
            </View>

            <View style={styles.spiritualAyahBox}>
              <Text style={styles.spiritualAyahArabic}>
                إِنَّآ أَنزَلْنَـٰهُ قُرْءَٰنًا عَرَبِيًّۭا لَّعَلَّكُمْ تَعْقِلُونَ
              </Text>
              <Text style={styles.spiritualAyahTranslation}>
                &ldquo;Indeed, We have sent it down as an Arabic Quran that you might understand.&rdquo; (Yusuf 12:2)
              </Text>
            </View>
          </View>

          {/* Level Filter Tabs */}
          <View style={styles.filterTabsRow}>
            {(
              [
                { key: 'all', label: 'All Courses' },
                { key: 'beginner', label: 'Beginner' },
                { key: 'elementary', label: 'Elementary' },
                { key: 'intermediate', label: 'Intermediate' },
              ] as const
            ).map((tab) => {
              const isActive = activeLevel === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.filterTabBtn, isActive && styles.filterTabBtnActive]}
                  onPress={() => setActiveLevel(tab.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterTabBtnText,
                      isActive && styles.filterTabBtnTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Courses List */}
          <View style={styles.coursesList}>
            {filteredCourses.map((course) => {
              const isExpanded = !!expandedCourseIds[course.id];
              const courseLessonsCompleted = course.lessons.filter((l) =>
                progress.completedLessonIds.includes(l.id)
              ).length;
              const courseCompleted =
                courseLessonsCompleted === course.lessons.length &&
                course.lessons.length > 0;

              return (
                <View key={course.id} style={styles.courseCard}>
                  {/* Course Header Card */}
                  <TouchableOpacity
                    style={styles.courseHeaderBtn}
                    onPress={() => toggleCourseExpand(course.id)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.courseIconCircle}>
                      <Ionicons
                        name={courseCompleted ? 'checkmark-circle' : (course.icon as any)}
                        size={22}
                        color={courseCompleted ? '#059669' : COLORS.primary}
                      />
                    </View>

                    <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                      <View style={styles.courseBadgeRow}>
                        <View style={styles.courseLevelBadge}>
                          <Text style={styles.courseLevelBadgeText}>{course.levelLabel}</Text>
                        </View>
                        <Text style={styles.courseArabicTitle}>{course.titleAr}</Text>
                      </View>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                      <Text style={styles.courseDescription}>{course.description}</Text>
                      <Text style={styles.courseLessonCounter}>
                        {courseLessonsCompleted} of {course.lessons.length} lessons completed
                      </Text>
                    </View>

                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>

                  {/* Expanded Lessons List */}
                  {isExpanded && (
                    <View style={styles.lessonsContainer}>
                      {course.lessons.map((lesson, idx) => {
                        const isDone = progress.completedLessonIds.includes(lesson.id);

                        return (
                          <TouchableOpacity
                            key={lesson.id}
                            style={[
                              styles.lessonRow,
                              idx < course.lessons.length - 1 && styles.lessonRowBorder,
                            ]}
                            onPress={() => handleStartLesson(course, lesson)}
                            activeOpacity={0.7}
                          >
                            <View
                              style={[
                                styles.lessonStatusCircle,
                                isDone && styles.lessonStatusCircleDone,
                              ]}
                            >
                              {isDone ? (
                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                              ) : (
                                <Text style={styles.lessonOrderText}>{idx + 1}</Text>
                              )}
                            </View>

                            <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                              <View style={styles.lessonTitleRow}>
                                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                <Text style={styles.lessonArabicTitle}>{lesson.titleAr}</Text>
                              </View>
                              <Text style={styles.lessonSummary} numberOfLines={2}>
                                {lesson.summary}
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.lessonStartPill,
                                isDone && styles.lessonStartPillDone,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.lessonStartPillText,
                                  isDone && styles.lessonStartPillTextDone,
                                ]}
                              >
                                {isDone ? 'Review' : 'Start'}
                              </Text>
                              <Ionicons
                                name={isDone ? 'refresh' : 'arrow-forward'}
                                size={12}
                                color={isDone ? '#059669' : COLORS.primaryDark}
                              />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* ================================================================= */}
      {/* 2. LESSON RUNNER MODE: Teach -> Demonstrate -> Quiz -> Review */}
      {/* ================================================================= */}
      {activeLesson && activeCourse && (
        <View style={styles.lessonRunnerContainer}>
          {/* Runner Top Bar */}
          <View style={styles.runnerTopBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleExitLesson}
              accessibilityRole="button"
              accessibilityLabel="Exit lesson"
            >
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
              <Text style={styles.runnerSupCourse}>{activeCourse.title}</Text>
              <Text style={styles.runnerMainTitle} numberOfLines={1}>
                {activeLesson.title}
              </Text>
            </View>

            <View style={{ width: 36 }} />
          </View>

          {/* Step Indicator Header (Teach -> Demonstrate -> Quiz -> Review) */}
          <View style={styles.runnerStepIndicator}>
            {(
              [
                { key: 'teach', label: '1. Teach', icon: 'book' },
                { key: 'demonstrate', label: '2. Examples', icon: 'eye' },
                { key: 'quiz', label: '3. Quiz', icon: 'help-circle' },
                { key: 'review', label: '4. Review', icon: 'checkmark-circle' },
              ] as const
            ).map((phase) => {
              const isCurrent = lessonPhase === phase.key;
              return (
                <TouchableOpacity
                  key={phase.key}
                  style={[
                    styles.stepIndicatorTab,
                    isCurrent && styles.stepIndicatorTabActive,
                  ]}
                  onPress={() => setLessonPhase(phase.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={phase.icon as any}
                    size={14}
                    color={isCurrent ? COLORS.primaryDark : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.stepIndicatorLabel,
                      isCurrent && styles.stepIndicatorLabelActive,
                    ]}
                  >
                    {phase.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Phase 1: TEACH */}
          {lessonPhase === 'teach' && (
            <ScrollView
              style={styles.runnerContentScroll}
              contentContainerStyle={styles.runnerContentArea}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.conceptHeroCard}>
                <View style={styles.conceptTagRow}>
                  <Text style={styles.conceptArabicBadge}>{activeLesson.titleAr}</Text>
                  <View style={styles.conceptPill}>
                    <Text style={styles.conceptPillText}>Core Concept</Text>
                  </View>
                </View>
                <Text style={styles.conceptTitle}>{activeLesson.title}</Text>
                <Text style={styles.conceptSummary}>{activeLesson.summary}</Text>
              </View>

              <View style={styles.conceptPointsSection}>
                <Text style={styles.conceptSectionTitle}>Key Pedagogical Rules</Text>
                {activeLesson.conceptPoints.map((pt, idx) => (
                  <View key={idx} style={styles.pointRow}>
                    <View style={styles.pointDotBadge}>
                      <Text style={styles.pointDotText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.pointDescText}>{pt}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.phaseAdvanceBtn}
                onPress={() => setLessonPhase('demonstrate')}
                activeOpacity={0.85}
              >
                <Text style={styles.phaseAdvanceBtnText}>See Quranic Verses</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Phase 2: DEMONSTRATE */}
          {lessonPhase === 'demonstrate' && (
            <ScrollView
              style={styles.runnerContentScroll}
              contentContainerStyle={styles.runnerContentArea}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.phaseSectionHeading}>
                Authentic Demonstrations from the Quran
              </Text>
              <Text style={styles.phaseSectionSub}>
                Observe how the Holy Quran uses these patterns in context.
              </Text>

              {activeLesson.demonstrations.map((demo, idx) => (
                <View key={idx} style={styles.demoCard}>
                  <View style={styles.demoHeaderRow}>
                    <View style={styles.demoRefBadge}>
                      <Ionicons name="book" size={12} color={COLORS.primaryDark} />
                      <Text style={styles.demoRefBadgeText}>
                        Surah {demo.surahName} ({demo.surahNumber}:{demo.ayahNumber})
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.demoArabic}>{demo.arabic}</Text>
                  <Text style={styles.demoTrans}>{demo.transliteration}</Text>
                  <Text style={styles.demoMeaning}>&ldquo;{demo.translation}&rdquo;</Text>

                  <View style={styles.demoNoteBox}>
                    <Ionicons name="bulb-outline" size={15} color={COLORS.primaryDark} />
                    <Text style={styles.demoNoteText}>{demo.note}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.phaseAdvanceBtn}
                onPress={() => setLessonPhase('quiz')}
                activeOpacity={0.85}
              >
                <Text style={styles.phaseAdvanceBtnText}>Practice Quiz</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Phase 3: QUIZ */}
          {lessonPhase === 'quiz' && (
            <ScrollView
              style={styles.runnerContentScroll}
              contentContainerStyle={styles.runnerContentArea}
              showsVerticalScrollIndicator={false}
            >
              {activeLesson.quizQuestions[currentQuizIndex] && (
                <>
                  <View style={styles.quizProgressBar}>
                    <Text style={styles.quizStepLabel}>
                      Question {currentQuizIndex + 1} of {activeLesson.quizQuestions.length}
                    </Text>
                    <View style={styles.quizBarTrack}>
                      <View
                        style={[
                          styles.quizBarFill,
                          {
                            width: `${Math.round(
                              ((currentQuizIndex + (selectedQuizOption !== null ? 1 : 0)) /
                                activeLesson.quizQuestions.length) *
                                100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <Text style={styles.quizQuestionText}>
                    {activeLesson.quizQuestions[currentQuizIndex].question}
                  </Text>

                  {activeLesson.quizQuestions[currentQuizIndex].arabicSnippet && (
                    <View style={styles.quizArabicSnippetBox}>
                      <Text style={styles.quizArabicSnippet}>
                        {activeLesson.quizQuestions[currentQuizIndex].arabicSnippet}
                      </Text>
                      {activeLesson.quizQuestions[currentQuizIndex].transliteration && (
                        <Text style={styles.quizTransSnippet}>
                          {activeLesson.quizQuestions[currentQuizIndex].transliteration}
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.quizOptionsGroup}>
                    {activeLesson.quizQuestions[currentQuizIndex].options.map(
                      (opt, optIdx) => {
                        const currentQ = activeLesson.quizQuestions[currentQuizIndex];
                        const isSelected = selectedQuizOption === optIdx;
                        const isAnswered = selectedQuizOption !== null;
                        const isCorrect = optIdx === currentQ.correctAnswerIndex;

                        let cardStyle = styles.quizOptionCard;
                        let textStyle = styles.quizOptionText;

                        if (isAnswered) {
                          if (isCorrect) {
                            cardStyle = styles.quizOptionCardCorrect;
                            textStyle = styles.quizOptionTextCorrect;
                          } else if (isSelected) {
                            cardStyle = styles.quizOptionCardWrong;
                            textStyle = styles.quizOptionTextWrong;
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={optIdx}
                            style={cardStyle}
                            onPress={() => handleSelectQuizOption(optIdx)}
                            disabled={isAnswered}
                            activeOpacity={0.7}
                          >
                            <View style={styles.quizLetterCircle}>
                              <Text style={styles.quizLetterText}>
                                {String.fromCharCode(65 + optIdx)}
                              </Text>
                            </View>
                            <Text style={textStyle}>{opt}</Text>
                            {isAnswered && isCorrect && (
                              <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color="#059669"
                                style={{ marginLeft: 6 }}
                              />
                            )}
                            {isAnswered && isSelected && !isCorrect && (
                              <Ionicons
                                name="close-circle"
                                size={18}
                                color="#DC2626"
                                style={{ marginLeft: 6 }}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </View>

                  {selectedQuizOption !== null && (
                    <View style={styles.quizExplanationBox}>
                      <View style={styles.explanationHeadRow}>
                        <Ionicons
                          name={
                            selectedQuizOption ===
                            activeLesson.quizQuestions[currentQuizIndex].correctAnswerIndex
                              ? 'checkmark-circle'
                              : 'information-circle'
                          }
                          size={18}
                          color={
                            selectedQuizOption ===
                            activeLesson.quizQuestions[currentQuizIndex].correctAnswerIndex
                              ? '#059669'
                              : COLORS.primaryDark
                          }
                        />
                        <Text style={styles.explanationTitle}>
                          {selectedQuizOption ===
                          activeLesson.quizQuestions[currentQuizIndex].correctAnswerIndex
                            ? 'Well done!'
                            : 'Insight:'}
                        </Text>
                      </View>
                      <Text style={styles.explanationDesc}>
                        {activeLesson.quizQuestions[currentQuizIndex].explanation}
                      </Text>
                    </View>
                  )}

                  {selectedQuizOption !== null && (
                    <TouchableOpacity
                      style={styles.phaseAdvanceBtn}
                      onPress={handleNextQuizQuestion}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.phaseAdvanceBtnText}>
                        {currentQuizIndex + 1 < activeLesson.quizQuestions.length
                          ? 'Next Question'
                          : 'Continue to Review'}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#FFFFFF"
                        style={{ marginLeft: 6 }}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
          )}

          {/* Phase 4: REVIEW */}
          {lessonPhase === 'review' && (
            <ScrollView
              style={styles.runnerContentScroll}
              contentContainerStyle={styles.runnerContentArea}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.reviewHeroCard}>
                <View style={styles.reviewIconCircle}>
                  <Ionicons name="checkmark-done" size={36} color="#059669" />
                </View>
                <Text style={styles.reviewBadge}>LESSON COMPLETED</Text>
                <Text style={styles.reviewTitle}>{activeLesson.title}</Text>
                <Text style={styles.reviewScoreSub}>
                  You scored {quizScore} of {activeLesson.quizQuestions.length} on the practice quiz.
                </Text>
              </View>

              <View style={styles.reviewTakeawaysCard}>
                <Text style={styles.takeawaysHeading}>Key Takeaways for Retention</Text>
                {activeLesson.reviewTakeaways.map((item, idx) => (
                  <View key={idx} style={styles.takeawayRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
                    <Text style={styles.takeawayText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Vocabulary Deck Integration */}
              {activeLesson.vocabularyToSave.length > 0 && (
                <View style={styles.vocabDeckCard}>
                  <View style={styles.vocabDeckHeadRow}>
                    <Ionicons name="albums" size={18} color={COLORS.primaryDark} />
                    <Text style={styles.vocabDeckTitle}>Lesson Vocabulary Deck</Text>
                  </View>
                  <Text style={styles.vocabDeckSub}>
                    Save these authentic Quranic words to your personal Spaced Repetition deck.
                  </Text>

                  <View style={styles.vocabWordPills}>
                    {activeLesson.vocabularyToSave.map((w, idx) => (
                      <View key={idx} style={styles.vocabPill}>
                        <Text style={styles.vocabPillArabic}>{w.arabic}</Text>
                        <Text style={styles.vocabPillEnglish}>{w.english}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.saveVocabBtn,
                      isVocabSaved && styles.saveVocabBtnSaved,
                    ]}
                    onPress={handleSaveLessonVocab}
                    disabled={isVocabSaved}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isVocabSaved ? 'checkmark' : 'add-circle-outline'}
                      size={18}
                      color={isVocabSaved ? '#059669' : '#FFFFFF'}
                    />
                    <Text
                      style={[
                        styles.saveVocabBtnText,
                        isVocabSaved && styles.saveVocabBtnTextSaved,
                      ]}
                    >
                      {isVocabSaved ? 'Added to Vocabulary Deck' : 'Add Words to Revision Queue'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.finishLessonBtn}
                onPress={handleFinishLesson}
                activeOpacity={0.85}
              >
                <Text style={styles.finishLessonBtnText}>Mark Complete & Return</Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  directoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerArabicTitle: {
    fontSize: 14,
    fontFamily: FONTS.arabicBold,
    color: COLORS.primaryDark,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  statsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  statsSub: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsPercentBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statsPercentText: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  spiritualAyahBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  spiritualAyahArabic: {
    fontSize: 17,
    fontFamily: FONTS.arabicMedium,
    color: COLORS.textArabic,
    textAlign: 'center',
    marginBottom: 4,
  },
  spiritualAyahTranslation: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabBtnText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  filterTabBtnTextActive: {
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
  coursesList: {
    gap: 14,
  },
  courseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  courseHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  courseIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  courseLevelBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  courseLevelBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  courseArabicTitle: {
    fontSize: 13,
    fontFamily: FONTS.arabicMedium,
    color: COLORS.textMuted,
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  courseDescription: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  courseLessonCounter: {
    fontSize: 11,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.primary,
    marginTop: 4,
  },
  lessonsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceSubtle,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lessonRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  lessonStatusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lessonStatusCircleDone: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  lessonOrderText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.textSecondary,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  lessonArabicTitle: {
    fontSize: 13,
    fontFamily: FONTS.arabicMedium,
    color: COLORS.primaryDark,
  },
  lessonSummary: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  lessonStartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    gap: 3,
  },
  lessonStartPillDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  lessonStartPillText: {
    fontSize: 11,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.primaryDark,
  },
  lessonStartPillTextDone: {
    color: '#059669',
  },

  // Runner Styles
  lessonRunnerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  runnerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  runnerSupCourse: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  runnerMainTitle: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  runnerStepIndicator: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 10,
  },
  stepIndicatorTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  stepIndicatorTabActive: {
    borderBottomColor: COLORS.primary,
  },
  stepIndicatorLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
  },
  stepIndicatorLabelActive: {
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  runnerContentScroll: {
    flex: 1,
  },
  runnerContentArea: {
    padding: 16,
    paddingBottom: 40,
  },
  conceptHeroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  conceptTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conceptArabicBadge: {
    fontSize: 16,
    fontFamily: FONTS.arabicBold,
    color: COLORS.primaryDark,
  },
  conceptPill: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conceptPillText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  conceptTitle: {
    fontSize: 19,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  conceptSummary: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  conceptPointsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  conceptSectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pointDotBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  pointDotText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  pointDescText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  phaseAdvanceBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  phaseAdvanceBtnText: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
  phaseSectionHeading: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  phaseSectionSub: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    marginBottom: 14,
  },
  demoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    ...SHADOWS.sm,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  demoRefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  demoRefBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  demoArabic: {
    fontSize: 22,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: 8,
  },
  demoTrans: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  demoMeaning: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 19,
    marginBottom: 10,
  },
  demoNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  demoNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  quizProgressBar: {
    marginBottom: 16,
  },
  quizStepLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  quizBarTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  quizBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  quizQuestionText: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    lineHeight: 23,
    marginBottom: 14,
  },
  quizArabicSnippetBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 16,
  },
  quizArabicSnippet: {
    fontSize: 24,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    textAlign: 'center',
    marginBottom: 4,
  },
  quizTransSnippet: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primaryDark,
  },
  quizOptionsGroup: {
    gap: 10,
    marginBottom: 16,
  },
  quizOptionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizOptionCardCorrect: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizOptionCardWrong: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizLetterCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quizLetterText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.textSecondary,
  },
  quizOptionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
  },
  quizOptionTextCorrect: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: '#065F46',
  },
  quizOptionTextWrong: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: '#991B1B',
  },
  quizExplanationBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  explanationHeadRow: {
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
  explanationDesc: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  reviewHeroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  reviewIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reviewBadge: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: '#059669',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  reviewTitle: {
    fontSize: 18,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  reviewScoreSub: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  reviewTakeawaysCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  takeawaysHeading: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  takeawayText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  vocabDeckCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 18,
  },
  vocabDeckHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  vocabDeckTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  vocabDeckSub: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  vocabWordPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  vocabPill: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  vocabPillArabic: {
    fontSize: 14,
    fontFamily: FONTS.arabicBold,
    color: COLORS.primaryDark,
  },
  vocabPillEnglish: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
  },
  saveVocabBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveVocabBtnSaved: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  saveVocabBtnText: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
  saveVocabBtnTextSaved: {
    color: '#059669',
  },
  finishLessonBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  finishLessonBtnText: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
});
