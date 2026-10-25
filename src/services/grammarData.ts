import grammarTopicsData from '../content/learning/grammar-topics.json';
import grammarExamplesData from '../content/learning/generated/grammar-examples.json';
import { DailyGrammarExercise, GrammarExerciseQuestion } from '../types/quran';

export interface GrammarTopic {
  id: string;
  title: string;
  feature: string;
  arabic?: string;
  gloss?: string;
  summary: string;
  points: string[];
}

export interface GrammarExampleItem {
  ar: string;
  tr: string;
  en: string;
  freq: number;
  ref: string;
}

interface GrammarTopicExamples {
  juz: number;
  topic: string;
  examples: GrammarExampleItem[];
}

const topics: GrammarTopic[] = grammarTopicsData as GrammarTopic[];
const topicExamples: GrammarTopicExamples[] = grammarExamplesData as GrammarTopicExamples[];

export function getAllGrammarTopics(): GrammarTopic[] {
  return topics;
}

export function getGrammarTopicById(id: string): GrammarTopic | undefined {
  return topics.find((t) => t.id === id);
}

export function getTopicExamples(topicId: string): GrammarExampleItem[] {
  const match = topicExamples.find((te) => te.topic === topicId);
  return match ? match.examples : [];
}

/**
 * Returns today's grammar topic index deterministically rotating through the 30 topics.
 */
export function getTodayGrammarTopicIndex(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return Math.abs(dayOfYear) % topics.length;
}

/**
 * Generates an educational 3-question daily exercise for a Quranic grammar topic.
 */
export function getDailyGrammarExercise(topicId?: string): DailyGrammarExercise {
  const selectedTopic = topicId
    ? topics.find((t) => t.id === topicId) || topics[0]
    : topics[getTodayGrammarTopicIndex()] || topics[0];

  const examples = getTopicExamples(selectedTopic.id);
  const fallbackExamples: GrammarExampleItem[] = [
    { ar: 'ٱلْكِتَـٰبَ', tr: 'l-kitāba', en: 'the Book', freq: 74, ref: '2:53:4' },
    { ar: 'فِى', tr: 'fī', en: 'in', freq: 1098, ref: '2:10:1' },
    { ar: 'رَبَّنَا', tr: 'rabbanā', en: 'Our Lord', freq: 40, ref: '2:127:8' },
    { ar: 'قَالَ', tr: 'qāla', en: 'He said', freq: 407, ref: '2:30:2' },
  ];
  const activeExamples = examples.length >= 3 ? examples : fallbackExamples;

  // Pool of alternative meanings for distractors
  const distractorsList = [
    'Indicates the vocative call ("O ...")',
    'Expresses past completed action ("they did")',
    'Attaches as a plural masculine ending ("-ūn / -īn")',
    'Acts as a future negation particle ("will never")',
    'Signifies certainty or past emphasis ("certainly / already")',
    'Joins connected sentences with "and"',
    'Refers to female dual entities ("the two women")',
    'Forms a conditional clause ("if / then")',
  ];

  // Distractor meaning pool from other topics
  const alternateWordMeanings = [
    'the heavens and earth',
    'and do not follow',
    'from their Lord',
    'with clear proofs',
    'indeed they know',
    'upon you all',
    'they used to ponder',
  ];

  // Question 1: Concept & Rule recognition
  const q1Correct = selectedTopic.summary;
  const filteredDistractors = distractorsList
    .filter((d) => !d.toLowerCase().includes(selectedTopic.title.toLowerCase()))
    .slice(0, 3);
  const q1Options = [q1Correct, ...filteredDistractors].sort(() => 0.5 - ((selectedTopic.id.charCodeAt(0) % 2) ? 0.3 : 0.7));
  const q1CorrectIndex = q1Options.indexOf(q1Correct);

  const q1: GrammarExerciseQuestion = {
    id: `${selectedTopic.id}_q1`,
    question: `What is the function of "${selectedTopic.feature}" in Quranic Arabic?`,
    options: q1Options,
    correctAnswerIndex: q1CorrectIndex >= 0 ? q1CorrectIndex : 0,
    explanation: selectedTopic.points[0] || selectedTopic.summary,
  };

  // Question 2: Example Translation Identification
  const ex2 = activeExamples[0] || fallbackExamples[0];
  const cleanEn = ex2.en.replace(/[()]/g, '').trim();
  const q2Correct = cleanEn;
  const q2Alt1 = alternateWordMeanings[0];
  const q2Alt2 = alternateWordMeanings[1];
  const q2Alt3 = activeExamples[1] ? activeExamples[1].en.replace(/[()]/g, '').trim() : alternateWordMeanings[2];
  const rawQ2Options = [q2Correct, q2Alt1, q2Alt2, q2Alt3];
  // Deduplicate and ensure 4 options
  const uniqueQ2Options = Array.from(new Set(rawQ2Options));
  while (uniqueQ2Options.length < 4) {
    uniqueQ2Options.push(`alternative meaning ${uniqueQ2Options.length}`);
  }
  const q2Options = uniqueQ2Options.sort((a, b) => a.localeCompare(b));
  const q2CorrectIndex = q2Options.indexOf(q2Correct);

  const q2: GrammarExerciseQuestion = {
    id: `${selectedTopic.id}_q2`,
    question: 'What is the meaning of this Quranic word in context?',
    arabicSnippet: ex2.ar,
    transliteration: ex2.tr,
    translation: `Found in Surah ${ex2.ref}`,
    options: q2Options,
    correctAnswerIndex: q2CorrectIndex >= 0 ? q2CorrectIndex : 0,
    explanation: `"${ex2.ar}" (${ex2.tr}) translates as "${cleanEn}". It features "${selectedTopic.feature}".`,
  };

  // Question 3: Spotting the Grammar Pattern in the Quran
  const ex3 = activeExamples[1] || activeExamples[0] || fallbackExamples[1];
  const q3Correct = `${ex3.ar} (${ex3.tr}) — "${ex3.en.replace(/[()]/g, '')}"`;
  
  // Pick other words from different topics as distractors
  const otherTopic = topics.find((t) => t.id !== selectedTopic.id) || topics[1];
  const otherExamples = getTopicExamples(otherTopic.id);
  const distractor1 = otherExamples[0]
    ? `${otherExamples[0].ar} (${otherExamples[0].tr}) — "${otherExamples[0].en.replace(/[()]/g, '')}"`
    : 'كِتَٰبٌ (kitābun) — "a book"';
  const distractor2 = otherExamples[1]
    ? `${otherExamples[1].ar} (${otherExamples[1].tr}) — "${otherExamples[1].en.replace(/[()]/g, '')}"`
    : 'قَوْمٍ (qawmin) — "a people"';
  const distractor3 = otherExamples[2]
    ? `${otherExamples[2].ar} (${otherExamples[2].tr}) — "${otherExamples[2].en.replace(/[()]/g, '')}"`
    : 'أَرْضًا (arḍan) — "a land"';

  const rawQ3Options = [q3Correct, distractor1, distractor2, distractor3];
  const uniqueQ3Options = Array.from(new Set(rawQ3Options));
  while (uniqueQ3Options.length < 4) {
    uniqueQ3Options.push(`Alternative word ${uniqueQ3Options.length}`);
  }
  const q3Options = uniqueQ3Options.sort((a, b) => b.length - a.length);
  const q3CorrectIndex = q3Options.indexOf(q3Correct);

  const q3: GrammarExerciseQuestion = {
    id: `${selectedTopic.id}_q3`,
    question: `Which of the following demonstrates the rule: ${selectedTopic.title}?`,
    arabicSnippet: ex3.ar,
    options: q3Options,
    correctAnswerIndex: q3CorrectIndex >= 0 ? q3CorrectIndex : 0,
    explanation: selectedTopic.points[1] || selectedTopic.points[0] || selectedTopic.summary,
  };

  return {
    topicId: selectedTopic.id,
    topicTitle: selectedTopic.title,
    topicFeature: selectedTopic.feature,
    summary: selectedTopic.summary,
    points: selectedTopic.points,
    questions: [q1, q2, q3],
  };
}
