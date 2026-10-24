import metaJson from '../content/quran/meta.json';
import { surahLoaders, wbwLoaders } from '../content/quran/loaders.generated';
import { AyahData, JuzMeta, SurahMeta, WordData } from '../types/quran';

export const BISMILLAH_TEXT = metaJson.bismillah;

export const surahsList: SurahMeta[] = metaJson.surahs as SurahMeta[];
export const juzList: JuzMeta[] = metaJson.juz as JuzMeta[];

const surahMap = new Map<number, SurahMeta>(surahsList.map((s) => [s.n, s]));

export function getAllSurahs(): SurahMeta[] {
  return surahsList;
}

export function getSurahMeta(n: number): SurahMeta | undefined {
  return surahMap.get(n);
}

export function getAllJuz(): JuzMeta[] {
  return juzList;
}

export function getJuzMeta(n: number): JuzMeta | undefined {
  return juzList.find((j) => j.n === n);
}

export function getSurahAyahs(surahNumber: number): AyahData[] {
  const loader = surahLoaders[surahNumber];
  if (!loader) return [];

  const rawVerses = loader();
  const wbwLoader = wbwLoaders[surahNumber];
  const rawWbw = wbwLoader ? wbwLoader() : null;

  return rawVerses.map((v, idx) => {
    const ayahNum = idx + 1;
    let words: WordData[] | undefined = undefined;

    if (rawWbw && rawWbw[idx]) {
      words = rawWbw[idx].map(([ar, tr, en]) => ({
        arabic: ar,
        transliteration: tr,
        english: en,
      }));
    }

    return {
      surah: surahNumber,
      ayah: ayahNum,
      arabic: v[0],
      english: v[1],
      transliteration: v[2],
      words,
    };
  });
}

export function searchSurahs(query: string): SurahMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return surahsList;

  return surahsList.filter((s) => {
    return (
      s.n.toString() === q ||
      s.en.toLowerCase().includes(q) ||
      s.meaning.toLowerCase().includes(q) ||
      s.ar.includes(q)
    );
  });
}
