import rootsDictionaryJson from '../content/quran/roots-dictionary.json';
import wordOccurrencesJson from '../content/quran/word-occurrences.json';
import grammarTopicsJson from '../content/learning/grammar-topics.json';
import { getSurahMeta } from './quranData';
import { WordData, WordLearningDetails, WordOccurrenceRef } from '../types/quran';

const rootsDict: Record<string, any> = rootsDictionaryJson as any;
const wordOccurrencesDict: Record<string, { c: number; r: any[] }> = wordOccurrencesJson as any;
const grammarTopicsList: any[] = grammarTopicsJson as any[];
const grammarTopicMap = new Map<string, any>(grammarTopicsList.map((t) => [t.id, t]));

const pad3 = (n: number) => String(n).padStart(3, '0');
const cleanWord = (w: string) => w.replace(/[\u06D6-\u06DC\u06DE\u06E9]/g, '').replace(/\s+/g, ' ').trim();
const stripDiacritics = (s: string) => s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06ED\u0640]/g, '').replace(/[ٱأإآ]/g, 'ا');

export function getWordAudioUrl(surah: number, ayah: number, wordIndex: number): string {
  return `https://audio.qurancdn.com/wbw/${pad3(surah)}_${pad3(ayah)}_${pad3(wordIndex + 1)}.mp3`;
}

export function getWordLearningDetails(
  surah: number,
  ayah: number,
  wordIndex: number,
  word: WordData
): WordLearningDetails {
  const surahMeta = getSurahMeta(surah);
  const surahName = surahMeta ? surahMeta.en : `Surah ${surah}`;
  const surahNameAr = surahMeta ? surahMeta.ar : '';

  // 1. Root details
  let rootData: WordLearningDetails['root'] = null;
  const rootId = word.rootId;
  if (rootId && rootsDict[rootId]) {
    const rawR = rootsDict[rootId];
    const occurrencesWithMeta: WordOccurrenceRef[] = (rawR.occurrences || []).map((o: any) => {
      const sMeta = getSurahMeta(o.s);
      return {
        surah: o.s,
        ayah: o.a,
        arabic: o.ar,
        transliteration: o.tr,
        english: o.en,
        surahName: sMeta ? sMeta.en : `Surah ${o.s}`,
      };
    });

    rootData = {
      id: rawR.id,
      arabic: rawR.arabic,
      meaning: rawR.meaning,
      count: rawR.count,
      derivatives: rawR.derivatives || [],
      occurrences: occurrencesWithMeta,
    };
  }

  // 2. Grammar details
  const topicId = word.grammarTopicId;
  const topic = topicId ? grammarTopicMap.get(topicId) : undefined;
  const grammar: WordLearningDetails['grammar'] = {
    pos: word.pos || 'Word',
    roles: word.roles && word.roles.length > 0 ? word.roles : ['Quranic vocabulary'],
    grammarCase: word.grammarCase,
    topic: topic
      ? {
          id: topic.id,
          title: topic.title,
          feature: topic.feature,
          summary: topic.summary,
          points: topic.points || [],
        }
      : undefined,
  };

  // 3. Other Quranic Occurrences of this word
  const bare = stripDiacritics(cleanWord(word.arabic));
  let occurrences: WordLearningDetails['occurrences'] = {
    count: 1,
    refs: [
      {
        surah,
        ayah,
        arabic: word.arabic,
        transliteration: word.transliteration,
        english: word.english,
        surahName,
      },
    ],
  };

  if (wordOccurrencesDict[bare]) {
    const occ = wordOccurrencesDict[bare];
    const refsWithMeta: WordOccurrenceRef[] = occ.r.map((item: any) => {
      // item format from generator: { s, a, ar, tr, en }
      const s = item.s;
      const a = item.a;
      const sMeta = getSurahMeta(s);
      return {
        surah: s,
        ayah: a,
        arabic: item.ar,
        transliteration: item.tr,
        english: item.en,
        surahName: sMeta ? sMeta.en : `Surah ${s}`,
      };
    });

    occurrences = {
      count: occ.c,
      refs: refsWithMeta,
    };
  } else if (rootData && rootData.occurrences.length > 0) {
    // If exact surface word only appears once or is rare, fallback to root occurrences
    occurrences = {
      count: 1,
      refs: [
        {
          surah,
          ayah,
          arabic: word.arabic,
          transliteration: word.transliteration,
          english: word.english,
          surahName,
        },
      ],
    };
  }

  const audioUrl = getWordAudioUrl(surah, ayah, wordIndex);

  return {
    arabic: word.arabic,
    transliteration: word.transliteration,
    english: word.english,
    surah,
    ayah,
    wordIndex,
    surahName,
    surahNameAr,
    audioUrl,
    root: rootData,
    grammar,
    occurrences,
  };
}
