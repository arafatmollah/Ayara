import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import {
  SavedWordItem,
  VocabularyDeckStats,
  QuizQuestion,
  SRSRating,
} from '../types/quran';
import {
  getSavedVocabulary,
  seedStarterVocabulary,
  updateVocabularyWordSRS,
} from '../services/storage';
import {
  computeDeckStats,
  getDueWords,
  getWeakWords,
  generateTrainerQuestions,
  applySRSRating,
  TrainerMode,
} from '../services/srsEngine';
import { getWordAudioUrl } from '../services/learningData';

type ViewMode = 'dashboard' | 'training' | 'results';
type QueueFilter = 'due' | 'weak' | 'all';

interface ReviewedWordSessionItem {
  word: SavedWordItem;
  originalWord: SavedWordItem;
  rating: SRSRating;
  isCorrect: boolean;
}

export default function VocabularyTrainerScreen() {
  const [deck, setDeck] = useState<SavedWordItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('due');
  const [trainerMode, setTrainerMode] = useState<TrainerMode>('all');
  const [questionCountLimit, setQuestionCountLimit] = useState<number>(10);

  // Active training state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isOptionSubmitted, setIsOptionSubmitted] = useState<boolean>(false);
  const [sessionStreak, setSessionStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [sessionReviews, setSessionReviews] = useState<ReviewedWordSessionItem[]>([]);

  // Load deck data
  const loadDeck = useCallback(() => {
    getSavedVocabulary().then(setDeck);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getSavedVocabulary().then((words) => {
      if (isMounted) setDeck(words);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute deck statistics
  const stats: VocabularyDeckStats = useMemo(() => {
    return computeDeckStats(deck);
  }, [deck]);

  // Filtered queue based on selected filter
  const targetWordsQueue: SavedWordItem[] = useMemo(() => {
    if (queueFilter === 'weak') {
      const weak = getWeakWords(deck);
      return weak.length > 0 ? weak : deck;
    }
    if (queueFilter === 'all') {
      return deck;
    }
    // Default 'due' queue
    const due = getDueWords(deck);
    return due.length > 0 ? due : deck;
  }, [deck, queueFilter]);

  // Current question and audio
  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];
  const currentWord = currentQuestion?.word;

  const currentAudioUrl = useMemo(() => {
    if (!currentWord) return null;
    const parts = currentWord.id.split(':');
    const wordIndex = parts.length >= 3 ? parseInt(parts[2], 10) : 0;
    return getWordAudioUrl(currentWord.surah, currentWord.ayah, isNaN(wordIndex) ? 0 : wordIndex);
  }, [currentWord]);

  const wordPlayer = useAudioPlayer(currentAudioUrl);
  const audioStatus = useAudioPlayerStatus(wordPlayer);

  const handlePlayAudio = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (!wordPlayer) return;
    if (audioStatus.playing) {
      wordPlayer.pause();
    } else {
      wordPlayer.seekTo(0);
      wordPlayer.play();
    }
  };

  // Seed starter deck
  const handleSeedStarterDeck = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const seeded = await seedStarterVocabulary();
    setDeck(seeded);
  };

  // Start a new training session
  const handleStartSession = (customWords?: SavedWordItem[], customLimit?: number) => {
    const sourceWords = customWords || targetWordsQueue;
    if (sourceWords.length === 0) {
      Alert.alert(
        'Empty Deck',
        'Add words from your Quran reading or seed the starter deck to begin training.',
        [
          { text: 'Seed Starter Words', onPress: handleSeedStarterDeck },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const limit = customLimit ?? (questionCountLimit === -1 ? sourceWords.length : questionCountLimit);
    const generated = generateTrainerQuestions(sourceWords, trainerMode, limit, deck);

    setQuestions(generated);
    setCurrentIndex(0);
    setIsCardFlipped(false);
    setSelectedOption(null);
    setIsOptionSubmitted(false);
    setSessionStreak(0);
    setBestStreak(0);
    setSessionReviews([]);
    setViewMode('training');
  };

  // Exit training session
  const handleExitSession = () => {
    if (sessionReviews.length > 0) {
      Alert.alert(
        'Exit Session?',
        'Your progress for answered questions has already been saved to your SRS deck.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Finish & View Summary', onPress: () => setViewMode('results') },
          { text: 'Exit to Deck', style: 'destructive', onPress: () => setViewMode('dashboard') },
        ]
      );
    } else {
      setViewMode('dashboard');
    }
  };

  // Process rating response (Flashcards)
  const handleRateFlashcard = async (rating: SRSRating) => {
    if (!currentQuestion) return;

    try {
      if (rating >= 3) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {}

    const isCorrect = rating >= 2;
    const nextStreak = isCorrect ? sessionStreak + 1 : 0;
    setSessionStreak(nextStreak);
    if (nextStreak > bestStreak) setBestStreak(nextStreak);

    // Apply SM-2 update
    const updatedWord = applySRSRating(currentQuestion.word, rating);
    await updateVocabularyWordSRS(updatedWord);

    // Update in local deck state
    setDeck((prev) => prev.map((w) => (w.id === updatedWord.id ? updatedWord : w)));

    const reviewEntry: ReviewedWordSessionItem = {
      word: updatedWord,
      originalWord: currentQuestion.word,
      rating,
      isCorrect,
    };
    const nextReviews = [...sessionReviews, reviewEntry];
    setSessionReviews(nextReviews);

    // Advance to next question or complete
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsCardFlipped(false);
      setSelectedOption(null);
      setIsOptionSubmitted(false);
    } else {
      setViewMode('results');
    }
  };

  // Process multiple choice selection
  const handleSelectMCQOption = (option: string) => {
    if (isOptionSubmitted) return;
    setSelectedOption(option);
    setIsOptionSubmitted(true);

    const isCorrect = option === currentQuestion?.correctAnswer;
    try {
      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {}

    const nextStreak = isCorrect ? sessionStreak + 1 : 0;
    setSessionStreak(nextStreak);
    if (nextStreak > bestStreak) setBestStreak(nextStreak);

    // Automatically grade for SM-2: rating 4 if instant correct, 1 if wrong
    const rating: SRSRating = isCorrect ? 4 : 1;
    if (currentQuestion) {
      const updatedWord = applySRSRating(currentQuestion.word, rating);
      updateVocabularyWordSRS(updatedWord);
      setDeck((prev) => prev.map((w) => (w.id === updatedWord.id ? updatedWord : w)));

      setSessionReviews((prev) => [
        ...prev,
        {
          word: updatedWord,
          originalWord: currentQuestion.word,
          rating,
          isCorrect,
        },
      ]);
    }
  };

  // Continue after MCQ selection
  const handleNextMCQ = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsCardFlipped(false);
      setSelectedOption(null);
      setIsOptionSubmitted(false);
    } else {
      setViewMode('results');
    }
  };

  // Session results computations
  const sessionStats = useMemo(() => {
    const total = sessionReviews.length;
    const correct = sessionReviews.filter((r) => r.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const masteredInSession = sessionReviews.filter(
      (r) => !r.originalWord.mastered && r.word.mastered
    ).map((r) => r.word);
    const weakInSession = sessionReviews.filter((r) => !r.isCorrect).map((r) => r.word);
    const xpEarned = correct * 10 + masteredInSession.length * 25;

    return {
      total,
      correct,
      accuracy,
      masteredInSession,
      weakInSession,
      xpEarned,
    };
  }, [sessionReviews]);

  // -------------------------------------------------------------
  // RENDER: Dashboard View
  // -------------------------------------------------------------
  if (viewMode === 'dashboard') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerSub}>Spaced Repetition System</Text>
            <Text style={styles.headerTitle}>Vocabulary Trainer</Text>
          </View>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={handleSeedStarterDeck}
            accessibilityRole="button"
            accessibilityLabel="Seed Quranic vocabulary"
          >
            <Ionicons name="sparkles" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner */}
          <LinearGradient
            colors={[COLORS.heroGradientStart, COLORS.heroGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroBadge}>
                <Ionicons name="repeat" size={13} color={COLORS.textInverse} />
                <Text style={styles.heroBadgeText}>SM-2 Spaced Recall</Text>
              </View>
              <Text style={styles.heroDeckCount}>{deck.length} Words in Deck</Text>
            </View>

            <Text style={styles.heroTitle}>Master Quranic Vocabulary</Text>
            <Text style={styles.heroDesc}>
              Scientifically spaced intervals strengthen long-term memory for words encountered in your reading.
            </Text>

            {/* Quick stats in Hero */}
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>{stats.dueReviewsCount}</Text>
                <Text style={styles.heroStatLabel}>Due Today</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>{stats.masteredCount}</Text>
                <Text style={styles.heroStatLabel}>Mastered</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>{stats.overallAccuracy}%</Text>
                <Text style={styles.heroStatLabel}>Accuracy</Text>
              </View>
            </View>
          </LinearGradient>

          {/* 4 Detailed SRS Metric Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statGridCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <View style={styles.statGridHeader}>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                <Text style={[styles.statGridValue, { color: '#15803D' }]}>{stats.overallAccuracy}%</Text>
              </View>
              <Text style={styles.statGridTitle}>Accuracy Rate</Text>
              <Text style={styles.statGridSub}>{stats.reviewsDoneToday} reviewed today</Text>
            </View>

            <View style={[styles.statGridCard, { backgroundColor: '#FDF4FF', borderColor: '#F5D0FE' }]}>
              <View style={styles.statGridHeader}>
                <Ionicons name="trophy" size={18} color="#9333EA" />
                <Text style={[styles.statGridValue, { color: '#7E22CE' }]}>{stats.masteredCount}</Text>
              </View>
              <Text style={styles.statGridTitle}>Mastered Words</Text>
              <Text style={styles.statGridSub}>≥21d retention</Text>
            </View>

            <View style={[styles.statGridCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <View style={styles.statGridHeader}>
                <Ionicons name="alarm" size={18} color="#D97706" />
                <Text style={[styles.statGridValue, { color: '#B45309' }]}>{stats.dueReviewsCount}</Text>
              </View>
              <Text style={styles.statGridTitle}>Due Reviews</Text>
              <Text style={styles.statGridSub}>Ready for recall</Text>
            </View>

            <View style={[styles.statGridCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
              <View style={styles.statGridHeader}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={[styles.statGridValue, { color: '#B91C1C' }]}>{stats.weakCount}</Text>
              </View>
              <Text style={styles.statGridTitle}>Weak Vocabulary</Text>
              <Text style={styles.statGridSub}>Needs reinforcement</Text>
            </View>
          </View>

          {/* Empty Deck Notice / Starter Seed Banner */}
          {deck.length === 0 ? (
            <View style={styles.starterBanner}>
              <View style={styles.starterIconBox}>
                <Ionicons name="book" size={26} color={COLORS.primary} />
              </View>
              <View style={styles.starterTextBox}>
                <Text style={styles.starterTitle}>Build Your Vocabulary Deck</Text>
                <Text style={styles.starterDesc}>
                  You haven&apos;t saved any words yet. Tap words while reading any surah to add them, or seed 15 essential Quranic words right now.
                </Text>
                <TouchableOpacity
                  style={styles.starterButton}
                  onPress={handleSeedStarterDeck}
                  activeOpacity={0.8}
                >
                  <Ionicons name="sparkles" size={16} color={COLORS.textInverse} />
                  <Text style={styles.starterButtonText}>Seed 15 Essential Words</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Weak Words Alert Card */}
          {stats.weakCount > 0 && queueFilter !== 'weak' && (
            <TouchableOpacity
              style={styles.weakAlertCard}
              onPress={() => {
                setQueueFilter('weak');
                handleStartSession(getWeakWords(deck), 10);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.weakAlertLeft}>
                <View style={styles.weakIconCircle}>
                  <Ionicons name="flash" size={18} color="#DC2626" />
                </View>
                <View>
                  <Text style={styles.weakAlertTitle}>
                    {stats.weakCount} Struggling Word{stats.weakCount > 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.weakAlertDesc}>Tap to reinforce them in an intensive sprint</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#DC2626" />
            </TouchableOpacity>
          )}

          {/* Section: Queue Selection */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. Select Review Queue</Text>
          </View>
          <View style={styles.queuePillsRow}>
            <TouchableOpacity
              style={[styles.queuePill, queueFilter === 'due' && styles.queuePillActive]}
              onPress={() => setQueueFilter('due')}
            >
              <Ionicons
                name="alarm-outline"
                size={16}
                color={queueFilter === 'due' ? COLORS.textInverse : COLORS.primaryDark}
              />
              <Text
                style={[
                  styles.queuePillText,
                  queueFilter === 'due' && styles.queuePillTextActive,
                ]}
              >
                Due Now ({stats.dueReviewsCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.queuePill, queueFilter === 'weak' && styles.queuePillActive]}
              onPress={() => setQueueFilter('weak')}
            >
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={queueFilter === 'weak' ? COLORS.textInverse : COLORS.primaryDark}
              />
              <Text
                style={[
                  styles.queuePillText,
                  queueFilter === 'weak' && styles.queuePillTextActive,
                ]}
              >
                Weak ({stats.weakCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.queuePill, queueFilter === 'all' && styles.queuePillActive]}
              onPress={() => setQueueFilter('all')}
            >
              <Ionicons
                name="layers-outline"
                size={16}
                color={queueFilter === 'all' ? COLORS.textInverse : COLORS.primaryDark}
              />
              <Text
                style={[
                  styles.queuePillText,
                  queueFilter === 'all' && styles.queuePillTextActive,
                ]}
              >
                All Deck ({stats.totalWords})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section: Training Mode */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. Choose Practice Mode</Text>
          </View>
          <View style={styles.modesContainer}>
            <TouchableOpacity
              style={[styles.modeCard, trainerMode === 'all' && styles.modeCardActive]}
              onPress={() => setTrainerMode('all')}
              activeOpacity={0.7}
            >
              <View style={[styles.modeIconBox, trainerMode === 'all' && styles.modeIconBoxActive]}>
                <Ionicons
                  name="shuffle"
                  size={20}
                  color={trainerMode === 'all' ? COLORS.textInverse : COLORS.primary}
                />
              </View>
              <View style={styles.modeInfo}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>Smart Adaptive Mixed</Text>
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  Cycles through Arabic-to-English, English-to-Arabic, and multiple-choice quizzes
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeCard, trainerMode === 'flashcard-ar' && styles.modeCardActive]}
              onPress={() => setTrainerMode('flashcard-ar')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.modeIconBox,
                  trainerMode === 'flashcard-ar' && styles.modeIconBoxActive,
                ]}
              >
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={trainerMode === 'flashcard-ar' ? COLORS.textInverse : COLORS.primary}
                />
              </View>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>Arabic → English Cards</Text>
                <Text style={styles.modeDesc}>
                  Read Arabic script, test comprehension, and reveal translation with root family
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeCard, trainerMode === 'flashcard-en' && styles.modeCardActive]}
              onPress={() => setTrainerMode('flashcard-en')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.modeIconBox,
                  trainerMode === 'flashcard-en' && styles.modeIconBoxActive,
                ]}
              >
                <Ionicons
                  name="language-outline"
                  size={20}
                  color={trainerMode === 'flashcard-en' ? COLORS.textInverse : COLORS.primary}
                />
              </View>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>English → Arabic Recognition</Text>
                <Text style={styles.modeDesc}>
                  Given English translation, practice active recall of the Arabic Quranic word
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeCard, trainerMode === 'quiz-mcq' && styles.modeCardActive]}
              onPress={() => setTrainerMode('quiz-mcq')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.modeIconBox,
                  trainerMode === 'quiz-mcq' && styles.modeIconBoxActive,
                ]}
              >
                <Ionicons
                  name="checkbox-outline"
                  size={20}
                  color={trainerMode === 'quiz-mcq' ? COLORS.textInverse : COLORS.primary}
                />
              </View>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>Multiple-Choice Quizzes</Text>
                <Text style={styles.modeDesc}>
                  Fast 4-choice recognition testing with instant validation and feedback
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section: Question Count Selector */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3. Session Length</Text>
          </View>
          <View style={styles.countRow}>
            {[5, 10, 15, -1].map((count) => {
              const isSelected = questionCountLimit === count;
              const label = count === -1 ? 'All' : `${count} Words`;
              return (
                <TouchableOpacity
                  key={count}
                  style={[styles.countPill, isSelected && styles.countPillActive]}
                  onPress={() => setQuestionCountLimit(count)}
                >
                  <Text style={[styles.countPillText, isSelected && styles.countPillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[
              styles.startSessionBtn,
              targetWordsQueue.length === 0 && styles.startSessionBtnDisabled,
            ]}
            onPress={() => handleStartSession()}
            activeOpacity={0.8}
            disabled={targetWordsQueue.length === 0}
          >
            <LinearGradient
              colors={
                targetWordsQueue.length === 0
                  ? ['#CBD5E1', '#94A3B8']
                  : [COLORS.heroGradientStart, COLORS.heroGradientEnd]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startSessionGradient}
            >
              <Ionicons name="play" size={20} color={COLORS.textInverse} />
              <Text style={styles.startSessionBtnText}>
                Start Training ({Math.min(targetWordsQueue.length, questionCountLimit === -1 ? targetWordsQueue.length : questionCountLimit)} Words)
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Active Training Session View
  // -------------------------------------------------------------
  if (viewMode === 'training' && currentQuestion) {
    const isMCQ = currentQuestion.type === 'mcq-ar-to-en' || currentQuestion.type === 'mcq-en-to-ar';
    const isArToEnFlash = currentQuestion.type === 'ar-to-en';
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Top Training Bar */}
        <View style={styles.trainingHeader}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleExitSession}
            accessibilityRole="button"
            accessibilityLabel="Exit session"
          >
            <Ionicons name="close" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {questions.length}
            </Text>
          </View>

          {sessionStreak > 1 ? (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={15} color="#EA580C" />
              <Text style={styles.streakText}>{sessionStreak}</Text>
            </View>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        <ScrollView
          style={styles.trainingBody}
          contentContainerStyle={styles.trainingBodyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Type Banner */}
          <View style={styles.questionTypeRow}>
            <View style={styles.questionTypePill}>
              <Text style={styles.questionTypePillText}>
                {isMCQ
                  ? 'Multiple Choice Quiz'
                  : isArToEnFlash
                  ? 'Arabic → English Flashcard'
                  : 'English → Arabic Recognition'}
              </Text>
            </View>
            {currentWord?.surahName && (
              <Text style={styles.sourceVerseText}>
                {currentWord.surahName} {currentWord.surah}:{currentWord.ayah}
              </Text>
            )}
          </View>

          {/* FLASHCARD INTERACTION (Ar-to-En or En-to-Ar) */}
          {!isMCQ ? (
            <View style={styles.flashcardWrapper}>
              <TouchableOpacity
                style={[styles.flashcardContainer, isCardFlipped && styles.flashcardContainerFlipped]}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setIsCardFlipped((prev) => !prev);
                }}
                activeOpacity={0.92}
              >
                {/* Audio button always visible */}
                <View style={styles.cardTopRow}>
                  <TouchableOpacity
                    style={[styles.cardAudioBtn, audioStatus.playing && styles.cardAudioBtnPlaying]}
                    onPress={handlePlayAudio}
                    accessibilityRole="button"
                    accessibilityLabel="Play word audio"
                  >
                    <Ionicons
                      name={audioStatus.playing ? 'volume-high' : 'volume-medium-outline'}
                      size={20}
                      color={audioStatus.playing ? COLORS.textInverse : COLORS.primary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.flipHint}>
                    <Ionicons name="sync-outline" size={13} color={COLORS.textMuted} /> Tap to{' '}
                    {isCardFlipped ? 'flip back' : 'reveal answer'}
                  </Text>
                </View>

                {/* Card Front Content */}
                {!isCardFlipped ? (
                  <View style={styles.cardContentBox}>
                    {isArToEnFlash ? (
                      <>
                        <Text style={styles.cardArabicText}>{currentQuestion.prompt}</Text>
                        {currentQuestion.promptSub && (
                          <View style={styles.translitBadge}>
                            <Text style={styles.translitText}>{currentQuestion.promptSub}</Text>
                          </View>
                        )}
                        <Text style={styles.recallPrompt}>Can you recall the meaning?</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.cardEnglishPrompt}>{currentQuestion.prompt}</Text>
                        {currentQuestion.promptSub && (
                          <Text style={styles.cardPromptSub}>{currentQuestion.promptSub}</Text>
                        )}
                        <Text style={styles.recallPrompt}>Can you recall the Arabic word?</Text>
                      </>
                    )}
                  </View>
                ) : (
                  /* Card Back (Revealed) Content */
                  <View style={styles.cardContentBox}>
                    {isArToEnFlash ? (
                      <>
                        <Text style={styles.cardRevealedMain}>{currentQuestion.correctAnswer}</Text>
                        <Text style={styles.cardRevealedArabic}>{currentQuestion.prompt}</Text>
                        {currentWord?.rootAr && (
                          <View style={styles.cardRootPill}>
                            <Text style={styles.cardRootText}>
                              Root: {currentWord.rootAr}{' '}
                              {currentWord.rootMeaning ? `• ${currentWord.rootMeaning}` : ''}
                            </Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <>
                        <Text style={styles.cardRevealedArabicLarge}>{currentQuestion.correctAnswer}</Text>
                        {currentQuestion.correctAnswerSub && (
                          <View style={styles.translitBadge}>
                            <Text style={styles.translitText}>{currentQuestion.correctAnswerSub}</Text>
                          </View>
                        )}
                        <Text style={styles.cardRevealedEnglish}>{currentQuestion.prompt}</Text>
                        {currentWord?.rootAr && (
                          <View style={styles.cardRootPill}>
                            <Text style={styles.cardRootText}>
                              Root: {currentWord.rootAr}{' '}
                              {currentWord.rootMeaning ? `• ${currentWord.rootMeaning}` : ''}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )}
              </TouchableOpacity>

              {/* SM-2 Recall Buttons (Visible once card is flipped) */}
              {isCardFlipped ? (
                <View style={styles.sm2RatingSection}>
                  <Text style={styles.sm2Prompt}>How well did you recall this word?</Text>
                  <View style={styles.sm2ButtonsRow}>
                    <TouchableOpacity
                      style={[styles.sm2Btn, styles.sm2AgainBtn]}
                      onPress={() => handleRateFlashcard(1)}
                    >
                      <Text style={[styles.sm2BtnTitle, { color: '#DC2626' }]}>Again</Text>
                      <Text style={styles.sm2BtnSub}>1 Day</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sm2Btn, styles.sm2HardBtn]}
                      onPress={() => handleRateFlashcard(2)}
                    >
                      <Text style={[styles.sm2BtnTitle, { color: '#D97706' }]}>Hard</Text>
                      <Text style={styles.sm2BtnSub}>2 Days</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sm2Btn, styles.sm2GoodBtn]}
                      onPress={() => handleRateFlashcard(3)}
                    >
                      <Text style={[styles.sm2BtnTitle, { color: '#16A34A' }]}>Good</Text>
                      <Text style={styles.sm2BtnSub}>4 Days</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sm2Btn, styles.sm2EasyBtn]}
                      onPress={() => handleRateFlashcard(4)}
                    >
                      <Text style={[styles.sm2BtnTitle, { color: '#2563EB' }]}>Easy</Text>
                      <Text style={styles.sm2BtnSub}>7+ Days</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.tapToRevealBtn}
                  onPress={() => setIsCardFlipped(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="eye-outline" size={18} color={COLORS.primaryDark} />
                  <Text style={styles.tapToRevealText}>Reveal Answer</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* MULTIPLE CHOICE QUIZ INTERACTION */
            <View style={styles.mcqWrapper}>
              <View style={styles.mcqPromptCard}>
                <TouchableOpacity
                  style={[styles.mcqAudioBtn, audioStatus.playing && styles.cardAudioBtnPlaying]}
                  onPress={handlePlayAudio}
                >
                  <Ionicons
                    name={audioStatus.playing ? 'volume-high' : 'volume-medium-outline'}
                    size={20}
                    color={audioStatus.playing ? COLORS.textInverse : COLORS.primary}
                  />
                </TouchableOpacity>

                {currentQuestion.type === 'mcq-ar-to-en' ? (
                  <>
                    <Text style={styles.mcqArabicPrompt}>{currentQuestion.prompt}</Text>
                    {currentQuestion.promptSub && (
                      <View style={styles.translitBadge}>
                        <Text style={styles.translitText}>{currentQuestion.promptSub}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.mcqEnglishPrompt}>{currentQuestion.prompt}</Text>
                    {currentQuestion.promptSub && (
                      <Text style={styles.mcqEnglishSub}>{currentQuestion.promptSub}</Text>
                    )}
                  </>
                )}
                <Text style={styles.mcqInstruction}>Select the matching translation:</Text>
              </View>

              {/* 4 Options */}
              <View style={styles.mcqOptionsList}>
                {(currentQuestion.options || []).map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQuestion.correctAnswer;

                  const isArabicOption = /[\u0600-\u06FF]/.test(opt);

                  return (
                    <TouchableOpacity
                      key={`${opt}_${i}`}
                      style={[
                        styles.mcqOptionBtn,
                        isSelected && !isOptionSubmitted && styles.mcqOptionSelected,
                        isOptionSubmitted && isCorrect && styles.mcqOptionCorrect,
                        isOptionSubmitted && isSelected && !isCorrect && styles.mcqOptionIncorrect,
                      ]}
                      onPress={() => handleSelectMCQOption(opt)}
                      disabled={isOptionSubmitted}
                      activeOpacity={0.75}
                    >
                      <View style={styles.mcqOptionLetterCircle}>
                        <Text style={styles.mcqOptionLetter}>
                          {String.fromCharCode(65 + i)}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.mcqOptionText,
                          isArabicOption && styles.mcqArabicOptionText,
                          isOptionSubmitted && isCorrect && styles.mcqOptionTextCorrect,
                          isOptionSubmitted && isSelected && !isCorrect && styles.mcqOptionTextIncorrect,
                        ]}
                      >
                        {opt}
                      </Text>

                      {isOptionSubmitted && isCorrect && (
                        <Ionicons name="checkmark-circle" size={22} color="#15803D" />
                      )}
                      {isOptionSubmitted && isSelected && !isCorrect && (
                        <Ionicons name="close-circle" size={22} color="#DC2626" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Feedback and Continue button */}
              {isOptionSubmitted && (
                <View style={styles.mcqFeedbackBox}>
                  {selectedOption === currentQuestion.correctAnswer ? (
                    <View style={styles.feedbackSuccessRow}>
                      <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                      <Text style={styles.feedbackSuccessText}>Excellent! Spaced repetition updated.</Text>
                    </View>
                  ) : (
                    <View style={styles.feedbackErrorRow}>
                      <Ionicons name="alert-circle" size={20} color="#DC2626" />
                      <Text style={styles.feedbackErrorText}>
                        Correct answer: {currentQuestion.correctAnswer}
                      </Text>
                    </View>
                  )}

                  {currentWord?.rootAr && (
                    <Text style={styles.feedbackRootText}>
                      Root {currentWord.rootAr} • {currentWord.rootMeaning || 'Quranic root family'}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={styles.continueBtn}
                    onPress={handleNextMCQ}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.continueBtnText}>
                      {currentIndex < questions.length - 1 ? 'Continue Next →' : 'View Results →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Session Results Summary View
  // -------------------------------------------------------------
  if (viewMode === 'results') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trophy Header */}
          <View style={styles.resultsHero}>
            <LinearGradient
              colors={[COLORS.heroGradientStart, COLORS.heroGradientEnd]}
              style={styles.resultsTrophyCircle}
            >
              <Ionicons name="trophy" size={36} color={COLORS.textInverse} />
            </LinearGradient>
            <Text style={styles.resultsTitle}>Session Completed!</Text>
            <Text style={styles.resultsSub}>
              Your spaced-repetition memory intervals have been calibrated.
            </Text>
          </View>

          {/* Results Metric Grid */}
          <View style={styles.resultsMetricsRow}>
            <View style={styles.resultMetricBox}>
              <Text style={styles.resultMetricVal}>{sessionStats.accuracy}%</Text>
              <Text style={styles.resultMetricLabel}>Accuracy</Text>
            </View>
            <View style={styles.resultMetricDivider} />
            <View style={styles.resultMetricBox}>
              <Text style={styles.resultMetricVal}>
                {sessionStats.correct} / {sessionStats.total}
              </Text>
              <Text style={styles.resultMetricLabel}>Recalled</Text>
            </View>
            <View style={styles.resultMetricDivider} />
            <View style={styles.resultMetricBox}>
              <Text style={styles.resultMetricVal}>+{sessionStats.xpEarned}</Text>
              <Text style={styles.resultMetricLabel}>Hasanat XP</Text>
            </View>
          </View>

          {/* Mastered or Weak Status callouts */}
          {sessionStats.masteredInSession.length > 0 && (
            <View style={styles.resultCalloutMastered}>
              <Ionicons name="sparkles" size={20} color="#15803D" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.resultCalloutMasteredTitle}>
                  {sessionStats.masteredInSession.length} Word{sessionStats.masteredInSession.length > 1 ? 's' : ''} Mastered!
                </Text>
                <Text style={styles.resultCalloutMasteredSub}>
                  Graduated into long-term recall queue (interval ≥ 21 days).
                </Text>
              </View>
            </View>
          )}

          {sessionStats.weakInSession.length > 0 && (
            <View style={styles.resultCalloutWeak}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.resultCalloutWeakTitle}>
                  {sessionStats.weakInSession.length} Word{sessionStats.weakInSession.length > 1 ? 's' : ''} Need Reinforcement
                </Text>
                <Text style={styles.resultCalloutWeakSub}>
                  Scheduled for immediate re-testing within 1 day.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.reviewWeakNowBtn}
                onPress={() => handleStartSession(sessionStats.weakInSession, sessionStats.weakInSession.length)}
              >
                <Text style={styles.reviewWeakNowText}>Drill Now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Breakdown of Reviewed Words */}
          <View style={styles.reviewedListHeader}>
            <Text style={styles.reviewedListTitle}>Words Reviewed This Session</Text>
          </View>
          <View style={styles.reviewedList}>
            {sessionReviews.map((item, index) => {
              return (
                <View key={`${item.word.id}_${index}`} style={styles.reviewedItemRow}>
                  <View style={styles.reviewedItemLeft}>
                    <Text style={styles.reviewedArabic}>{item.word.arabic}</Text>
                    <View>
                      <Text style={styles.reviewedEnglish}>{item.word.english}</Text>
                      <Text style={styles.reviewedTranslit}>
                        {item.word.transliteration} • Next review in {item.word.interval ?? 1}d
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.reviewedItemBadge,
                      item.isCorrect ? styles.badgeCorrect : styles.badgeIncorrect,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reviewedItemBadgeText,
                        item.isCorrect ? styles.badgeTextCorrect : styles.badgeTextIncorrect,
                      ]}
                    >
                      {item.isCorrect ? 'Remembered' : 'Needs Practice'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.resultsActions}>
            <TouchableOpacity
              style={styles.resultsPrimaryBtn}
              onPress={() => handleStartSession()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.heroGradientStart, COLORS.heroGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startSessionGradient}
              >
                <Ionicons name="refresh" size={18} color={COLORS.textInverse} />
                <Text style={styles.startSessionBtnText}>Train Another Round</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resultsSecondaryBtn}
              onPress={() => {
                loadDeck();
                setViewMode('dashboard');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.resultsSecondaryText}>Return to Trainer Dashboard</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Hero Card
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontFamily: FONTS.sansSemiBold,
  },
  heroDeckCount: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 18,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
  heroStatLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  // Detailed 4-Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statGridCard: {
    width: '48.5%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  statGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statGridValue: {
    fontSize: 18,
    fontFamily: FONTS.sansBold,
  },
  statGridTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textPrimary,
  },
  statGridSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Starter Banner
  starterBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primarySurface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 16,
  },
  starterIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  starterTextBox: {
    flex: 1,
  },
  starterTitle: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  starterDesc: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  starterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  starterButtonText: {
    fontSize: 12,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textInverse,
  },

  // Weak alert card
  weakAlertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  weakAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weakIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weakAlertTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: '#991B1B',
  },
  weakAlertDesc: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: '#B91C1C',
  },

  // Section Headers
  sectionHeader: {
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },

  // Queue Selector Pills
  queuePillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  queuePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  queuePillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  queuePillText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
  },
  queuePillTextActive: {
    color: COLORS.textInverse,
    fontFamily: FONTS.sansBold,
  },

  // Practice Modes
  modesContainer: {
    gap: 8,
    marginBottom: 18,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  modeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
  },
  modeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modeIconBoxActive: {
    backgroundColor: COLORS.primary,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  modeTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  recommendedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: '#15803D',
  },
  modeDesc: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },

  // Question Count Pills
  countRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  countPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countPillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  countPillText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  countPillTextActive: {
    color: COLORS.textInverse,
    fontFamily: FONTS.sansBold,
  },

  // Start CTA
  startSessionBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  startSessionBtnDisabled: {
    opacity: 0.6,
  },
  startSessionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  startSessionBtnText: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },

  // -------------------------------------------------------------
  // Active Training Styles
  // -------------------------------------------------------------
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 7,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: '#C2410C',
  },
  trainingBody: {
    flex: 1,
  },
  trainingBodyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  questionTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionTypePill: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questionTypePillText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  sourceVerseText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
  },

  // Flashcard View
  flashcardWrapper: {
    width: '100%',
  },
  flashcardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 24,
    minHeight: 280,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
    ...SHADOWS.md,
  },
  flashcardContainerFlipped: {
    borderColor: COLORS.primaryBorder,
    backgroundColor: '#FAF7FF',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardAudioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAudioBtnPlaying: {
    backgroundColor: COLORS.primary,
  },
  flipHint: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
  },
  cardContentBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  cardArabicText: {
    fontSize: 38,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 58,
  },
  cardEnglishPrompt: {
    fontSize: 26,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardPromptSub: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  recallPrompt: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  cardRevealedMain: {
    fontSize: 24,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardRevealedArabic: {
    fontSize: 30,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    textAlign: 'center',
    marginBottom: 12,
  },
  cardRevealedArabicLarge: {
    fontSize: 38,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 56,
  },
  cardRevealedEnglish: {
    fontSize: 18,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  translitBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  translitText: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  cardRootPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 6,
  },
  cardRootText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primaryDark,
  },

  // SM-2 Recall Buttons
  sm2RatingSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  sm2Prompt: {
    fontSize: 13,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  sm2ButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  sm2Btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  sm2AgainBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  sm2HardBtn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  sm2GoodBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  sm2EasyBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  sm2BtnTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
  },
  sm2BtnSub: {
    fontSize: 10,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tapToRevealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primarySurface,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  tapToRevealText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },

  // MCQ Styles
  mcqWrapper: {
    width: '100%',
  },
  mcqPromptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  mcqAudioBtn: {
    alignSelf: 'flex-start',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mcqArabicPrompt: {
    fontSize: 34,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    textAlign: 'center',
    marginBottom: 8,
  },
  mcqEnglishPrompt: {
    fontSize: 22,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  mcqEnglishSub: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  mcqInstruction: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  mcqOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  mcqOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  mcqOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
  },
  mcqOptionCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  mcqOptionIncorrect: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  mcqOptionLetterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mcqOptionLetter: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.textSecondary,
  },
  mcqOptionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
  },
  mcqArabicOptionText: {
    fontSize: 20,
    fontFamily: FONTS.arabicMedium,
    textAlign: 'right',
  },
  mcqOptionTextCorrect: {
    color: '#15803D',
    fontFamily: FONTS.sansBold,
  },
  mcqOptionTextIncorrect: {
    color: '#B91C1C',
  },
  mcqFeedbackBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feedbackSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  feedbackSuccessText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: '#15803D',
  },
  feedbackErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  feedbackErrorText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: '#B91C1C',
  },
  feedbackRootText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },

  // -------------------------------------------------------------
  // Results Styles
  // -------------------------------------------------------------
  resultsHero: {
    alignItems: 'center',
    marginVertical: 20,
  },
  resultsTrophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...SHADOWS.md,
  },
  resultsTitle: {
    fontSize: 24,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  resultsSub: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resultsMetricsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  resultMetricBox: {
    flex: 1,
    alignItems: 'center',
  },
  resultMetricVal: {
    fontSize: 22,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  resultMetricLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  resultMetricDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  resultCalloutMastered: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  resultCalloutMasteredTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: '#15803D',
  },
  resultCalloutMasteredSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: '#166534',
  },
  resultCalloutWeak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  resultCalloutWeakTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: '#B91C1C',
  },
  resultCalloutWeakSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: '#991B1B',
  },
  reviewWeakNowBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  reviewWeakNowText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
  reviewedListHeader: {
    marginBottom: 10,
  },
  reviewedListTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  reviewedList: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  reviewedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  reviewedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewedArabic: {
    fontSize: 22,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textArabic,
    minWidth: 70,
  },
  reviewedEnglish: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  reviewedTranslit: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
  },
  reviewedItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeCorrect: {
    backgroundColor: '#DCFCE7',
  },
  badgeIncorrect: {
    backgroundColor: '#FEE2E2',
  },
  reviewedItemBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
  },
  badgeTextCorrect: {
    color: '#15803D',
  },
  badgeTextIncorrect: {
    color: '#B91C1C',
  },
  resultsActions: {
    gap: 10,
  },
  resultsPrimaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  resultsSecondaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultsSecondaryText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textSecondary,
  },
});
