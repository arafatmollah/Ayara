import metaJson from '../content/quran/meta.json';
import { surahLoaders, wbwLoaders, morphologyLoaders } from '../content/quran/loaders.generated';
import { banglaLoaders } from '../content/quran/banglaLoaders.generated';
import { BANGLA_SURAHS, BanglaSurahInfo } from '../constants/banglaQuran';
import rootsDictJson from '../content/quran/roots-dictionary.json';
import { AyahData, JuzMeta, SurahMeta, WordData } from '../types/quran';

export const BISMILLAH_TEXT = metaJson.bismillah;

export const surahsList: SurahMeta[] = metaJson.surahs as SurahMeta[];
export const juzList: JuzMeta[] = metaJson.juz as JuzMeta[];

const surahMap = new Map<number, SurahMeta>(surahsList.map((s) => [s.n, s]));
const rootsDict: Record<string, { arabic: string; meaning: string; count: number }> = rootsDictJson as any;

export function getAllSurahs(): SurahMeta[] {
  return surahsList;
}

export function getSurahMeta(n: number): SurahMeta | undefined {
  return surahMap.get(n);
}

export function getBanglaSurahInfo(n: number): BanglaSurahInfo | undefined {
  return BANGLA_SURAHS[n];
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
  const rawBangla = banglaLoaders[surahNumber] ? banglaLoaders[surahNumber]() : null;
  const wbwLoader = wbwLoaders[surahNumber];
  const rawWbw = wbwLoader ? wbwLoader() : null;
  const morphLoader = morphologyLoaders[surahNumber];
  const rawMorph = morphLoader ? morphLoader() : null;

  return rawVerses.map((v, idx) => {
    const ayahNum = idx + 1;
    let words: WordData[] | undefined = undefined;

    if (rawWbw && rawWbw[idx]) {
      words = rawWbw[idx].map(([ar, tr, en], wIdx) => {
        const morph = rawMorph && rawMorph[idx] ? rawMorph[idx][wIdx] : null;
        const rootId = morph ? morph[0] : null;
        const rootData = rootId ? rootsDict[rootId] : null;

        return {
          arabic: ar,
          transliteration: tr,
          english: en,
          rootId: rootId || undefined,
          rootAr: rootData?.arabic || undefined,
          rootMeaning: rootData?.meaning || undefined,
          pos: morph ? morph[1] : undefined,
          roles: morph ? morph[2] : undefined,
          grammarCase: morph ? morph[3] : undefined,
          grammarTopicId: morph ? morph[4] : undefined,
        };
      });
    }

    return {
      surah: surahNumber,
      ayah: ayahNum,
      arabic: v[0],
      english: v[1],
      bangla: rawBangla && rawBangla[idx] ? rawBangla[idx] : undefined,
      transliteration: v[2],
      words,
    };
  });
}

export function searchSurahs(query: string): SurahMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return surahsList;

  return surahsList.filter((s) => {
    const bn = BANGLA_SURAHS[s.n];
    return (
      s.n.toString() === q ||
      s.en.toLowerCase().includes(q) ||
      s.meaning.toLowerCase().includes(q) ||
      s.ar.includes(q) ||
      (bn && (bn.name.toLowerCase().includes(q) || bn.meaning.toLowerCase().includes(q)))
    );
  });
}
