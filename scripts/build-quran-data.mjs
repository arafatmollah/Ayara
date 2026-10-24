// Builds bundled, verified Quran content from public sources. Re-run: `node scripts/build-quran-data.mjs`
// Sources (see CONTENT_LICENSES.md):
//   Arabic text   — Tanzil Uthmani (via api.alquran.cloud, edition quran-uthmani)
//   Translation   — Saheeh International (via api.alquran.cloud, edition en.sahih)
//   Transliteration — api.alquran.cloud edition en.transliteration
//   Word-by-word  — Quran.com API v4 (text_uthmani, English word translation + transliteration)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const CACHE = path.join(ROOT, '.scratch');
const OUT_QURAN = path.join(ROOT, 'src', 'content', 'quran');
const OUT_LEARN = path.join(ROOT, 'src', 'content', 'learning', 'generated');
fs.mkdirSync(path.join(CACHE, 'wbw'), { recursive: true });
fs.mkdirSync(path.join(OUT_QURAN, 'surahs'), { recursive: true });
fs.mkdirSync(path.join(OUT_QURAN, 'wbw'), { recursive: true });
fs.mkdirSync(OUT_LEARN, { recursive: true });

async function cachedJson(file, url) {
  const p = path.join(CACHE, file);
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const json = await res.json();
      fs.writeFileSync(p, JSON.stringify(json));
      return json;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

const pad3 = (n) => String(n).padStart(3, '0');
const stripDiacritics = (s) => s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[ٱأإآ]/g, 'ا');

const meta = (await cachedJson('meta.json', 'https://api.alquran.cloud/v1/meta')).data;
const ar = (await cachedJson('q-quran-uthmani.json', 'https://api.alquran.cloud/v1/quran/quran-uthmani')).data;
const en = (await cachedJson('q-en.sahih.json', 'https://api.alquran.cloud/v1/quran/en.sahih')).data;
const tr = (await cachedJson('q-en.transliteration.json', 'https://api.alquran.cloud/v1/quran/en.transliteration')).data;

// ---------- Surah text ----------
const surahMeta = [];
let bismillahText = null;
for (let i = 0; i < 114; i++) {
  const s = ar.surahs[i];
  const n = s.number;
  const verses = s.ayahs.map((a, j) => {
    let arabic = a.text.replace(/^\uFEFF/, '').trim();
    if (j === 0 && n !== 1 && n !== 9) {
      const tokens = arabic.split(' ');
      if (stripDiacritics(tokens[0]).startsWith('بسم')) {
        if (!bismillahText && n === 2) bismillahText = tokens.slice(0, 4).join(' ');
        arabic = tokens.slice(4).join(' ');
      } else {
        throw new Error(`Expected bismillah prefix in surah ${n}`);
      }
    }
    return [arabic, en.surahs[i].ayahs[j].text.trim(), tr.surahs[i].ayahs[j].text.trim()];
  });
  fs.writeFileSync(path.join(OUT_QURAN, 'surahs', `${pad3(n)}.json`), JSON.stringify(verses));
  surahMeta.push({
    n,
    ar: s.name.replace(/^سُورَةُ\s*/, ''),
    en: s.englishName,
    meaning: s.englishNameTranslation,
    ayahs: s.ayahs.length,
    type: s.revelationType,
    firstGlobal: s.ayahs[0].number,
    bismillah: n !== 1 && n !== 9,
  });
}

// ---------- Juz ----------
// English names are the commonly used (Indo-Pak) names; Arabic names are taken verbatim from the
// verified text at the verse that gives the Juz its name.
const JUZ_NAMES = [
  ['Alif Lam Meem', '2:1', 1], ['Sayaqool', '2:142', 1], ['Tilkar Rusul', '2:253', 2], ['Lan Tanaloo', '3:92', 2],
  ['Wal Muhsanat', '4:24', 1], ['La Yuhibbullah', '4:148', 3], ['Wa Iza Samiu', '5:83', 2], ['Wa Law Annana', '6:111', 2],
  ['Qalal Mala', '7:88', 2], ["Wa A'lamu", '8:41', 1], ["Ya'taziroon", '9:94', 1], ['Wa Ma Min Dabbah', '11:6', 3],
  ["Wa Ma Ubarri'u", '12:53', 2], ['Rubama', '15:2', 1], ['Subhanallazi', '17:1', 2], ['Qal Alam', '18:75', 2],
  ['Iqtaraba', '21:1', 1], ['Qad Aflaha', '23:1', 2], ['Wa Qalallazina', '25:21', 2], ['Amman Khalaq', '27:60', 2],
  ['Utlu Ma Oohiya', '29:45', 3], ['Wa Man Yaqnut', '33:31', 2], ['Wa Mali', '36:22', 2], ['Faman Azlamu', '39:32', 2],
  ['Ilayhi Yuraddu', '41:47', 2], ['Ha Meem', '46:1', 1], ['Qala Fama Khatbukum', '51:31', 3], ['Qad Sami Allahu', '58:1', 3],
  ['Tabarakallazi', '67:1', 2], ['Amma', '78:1', 1],
];
const verseText = (key) => {
  const [s, a] = key.split(':').map(Number);
  return JSON.parse(fs.readFileSync(path.join(OUT_QURAN, 'surahs', `${pad3(s)}.json`), 'utf8'))[a - 1][0];
};
const juzMeta = meta.juzs.references.map((start, i) => {
  const next = meta.juzs.references[i + 1];
  let end;
  if (!next) end = { s: 114, a: 6 };
  else if (next.ayah > 1) end = { s: next.surah, a: next.ayah - 1 };
  else end = { s: next.surah - 1, a: surahMeta[next.surah - 2].ayahs };
  const [enName, key, words] = JUZ_NAMES[i];
  const nameAr = verseText(key)
    .split(' ')
    .filter((t) => t !== '۞')
    .slice(0, words)
    .join(' ');
  return { n: i + 1, name: enName, nameAr, nameRef: key, start: { s: start.surah, a: start.ayah }, end };
});

fs.writeFileSync(
  path.join(OUT_QURAN, 'meta.json'),
  JSON.stringify({ bismillah: bismillahText, surahs: surahMeta, juz: juzMeta }, null, 1),
);

// ---------- Word by word ----------
async function wbwForChapter(n) {
  const out = [];
  let page = 1;
  for (;;) {
    const url = `https://api.quran.com/api/v4/verses/by_chapter/${n}?words=true&word_fields=text_uthmani&per_page=50&page=${page}`;
    const json = await cachedJson(path.join('wbw', `${pad3(n)}-${page}.json`), url);
    for (const v of json.verses) {
      out[v.verse_number - 1] = v.words
        .filter((w) => w.char_type_name === 'word')
        .map((w) => [w.text_uthmani, w.transliteration?.text ?? '', w.translation?.text ?? '']);
    }
    if (!json.pagination.next_page) break;
    page = json.pagination.next_page;
  }
  return out;
}

const wbw = [];
const queue = Array.from({ length: 114 }, (_, i) => i + 1);
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const n = queue.shift();
      wbw[n - 1] = await wbwForChapter(n);
      if (wbw[n - 1].length !== surahMeta[n - 1].ayahs) throw new Error(`wbw verse count mismatch in ${n}`);
      fs.writeFileSync(path.join(OUT_QURAN, 'wbw', `${pad3(n)}.json`), JSON.stringify(wbw[n - 1]));
    }
  }),
);

// Learning data uses words without recitation pause marks (ۖ ۗ ۚ ۛ ۞), which are not part of the word itself.
const cleanWord = (w) => w.replace(/[\u06D6-\u06DC\u06DE\u06E9]/g, '').replace(/\s+/g, ' ').trim();
const lw = wbw.map((s) => s.map((v) => v.map(([a, t, e]) => [cleanWord(a), t, e])));

// ---------- Generated learning data (derived only from verified WBW data) ----------
const inJuz = (j, s, a) => {
  const { start, end } = j;
  const after = s > start.s || (s === start.s && a >= start.a);
  const before = s < end.s || (s === end.s && a <= end.a);
  return after && before;
};

// Global surface-form statistics
const global = new Map(); // ar -> {count, translations: Map, tr: Map, first ref}
for (let s = 1; s <= 114; s++) {
  lw[s - 1].forEach((words, ai) => {
    words.forEach(([w, t, e], wi) => {
      let g = global.get(w);
      if (!g) global.set(w, (g = { count: 0, en: new Map(), tr: new Map(), refs: [] }));
      g.count++;
      g.en.set(e, (g.en.get(e) ?? 0) + 1);
      g.tr.set(t, (g.tr.get(t) ?? 0) + 1);
      if (g.refs.length < 40) g.refs.push(`${s}:${ai + 1}:${wi + 1}`);
    });
  });
}
const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];

const introduced = new Set();
const introducedGloss = new Set();
const glossKey = (e) => e.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z ]/g, '').trim();
const VOCAB_PER_JUZ = 24;
const vocab = [];
const passages = [];
for (const j of juzMeta) {
  const local = new Map();
  const verses = [];
  for (let s = j.start.s; s <= j.end.s; s++) {
    lw[s - 1].forEach((words, ai) => {
      if (!inJuz(j, s, ai + 1)) return;
      verses.push({ s, a: ai + 1, words });
      words.forEach(([w], wi) => {
        let l = local.get(w);
        if (!l) local.set(w, (l = { count: 0, ref: `${s}:${ai + 1}:${wi + 1}` }));
        l.count++;
      });
    });
  }
  const candidates = [...local.entries()]
    .filter(([w]) => !introduced.has(w) && stripDiacritics(w).length >= 2)
    .map(([w, l]) => ({ w, local: l.count, global: global.get(w).count, ref: l.ref }))
    .filter((c) => c.global >= 3 || j.n >= 25)
    .sort((a, b) => b.local * 2 + b.global - (a.local * 2 + a.global));
  // Each meaning is taught once so multiple-choice answers are never ambiguous.
  const picked = [];
  for (const c of candidates) {
    if (picked.length >= VOCAB_PER_JUZ) break;
    const gloss = glossKey(top(global.get(c.w).en));
    if (!gloss || introducedGloss.has(gloss)) continue;
    introducedGloss.add(gloss);
    picked.push(c);
  }
  picked.forEach((c, i) => {
    introduced.add(c.w);
    const g = global.get(c.w);
    vocab.push({
      id: `j${j.n}w${i + 1}`,
      juz: j.n,
      ar: c.w,
      tr: top(g.tr),
      en: top(g.en),
      freq: g.count,
      ref: c.ref,
    });
  });

  // Short, self-contained verses for reading, ordering and fill-in exercises.
  const short = verses
    .filter((v) => v.words.length >= 3 && v.words.length <= 7)
    .sort((a, b) => a.words.length - b.words.length || a.s - b.s || a.a - b.a);
  const pick = [];
  const step = Math.max(1, Math.floor(short.length / 6));
  for (let i = 0; i < short.length && pick.length < 6; i += step) pick.push(`${short[i].s}:${short[i].a}`);
  const mid = verses.filter((v) => v.words.length >= 6 && v.words.length <= 14);
  const stepM = Math.max(1, Math.floor(mid.length / 4));
  const comprehension = [];
  for (let i = 0; i < mid.length && comprehension.length < 4; i += stepM) comprehension.push(`${mid[i].s}:${mid[i].a}`);
  passages.push({ juz: j.n, short: pick, comprehension, verseCount: verses.length });
}

fs.writeFileSync(path.join(OUT_LEARN, 'vocab.json'), JSON.stringify(vocab));
fs.writeFileSync(path.join(OUT_LEARN, 'passages.json'), JSON.stringify(passages));

// Grammar and root examples: a word qualifies only if BOTH its Arabic form and its established
// word-by-word English gloss match, which keeps examples faithful to the source data.
const normalize = (s) => stripDiacritics(s).replace(/[ءؤئ]/g, 'ا').replace(/\s/g, '');
const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'content', 'learning', 'grammar-topics.json'), 'utf8'));
const roots = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'content', 'learning', 'roots.json'), 'utf8'));
const entry = (w) => {
  const g = global.get(w);
  return { ar: w, tr: top(g.tr), en: top(g.en), freq: g.count, ref: g.refs[0] };
};
const wordsInRange = (j) => {
  const set = new Map();
  for (let s = j.start.s; s <= j.end.s; s++)
    lw[s - 1].forEach((words, ai) => {
      if (!inJuz(j, s, ai + 1)) return;
      words.forEach(([w]) => set.set(w, (set.get(w) ?? 0) + 1));
    });
  return set;
};
const allWords = [...global.keys()];
const grammar = juzMeta.map((j, i) => {
  const t = topics[i];
  const ar = new RegExp(t.arabic);
  const gl = new RegExp(t.gloss, 'i');
  const ok = (w) => ar.test(normalize(w)) && gl.test(top(global.get(w).en));
  const local = [...wordsInRange(j).entries()].filter(([w]) => ok(w)).sort((a, b) => b[1] - a[1]).map(([w]) => w);
  const fallback = allWords.filter((w) => ok(w) && !local.includes(w)).sort((a, b) => global.get(b).count - global.get(a).count);
  const examples = [...local, ...fallback].slice(0, 8).map(entry);
  if (examples.length < 4) throw new Error(`Not enough grammar examples for ${t.id}: ${examples.length}`);
  return { juz: j.n, topic: t.id, examples };
});
const isSubsequence = (letters, word) => {
  let k = 0;
  for (const ch of word) if (ch === letters[k]) k++;
  return k === letters.length;
};
const rootExamples = roots.map((r) => {
  const letters = r.letters.map((l) => normalize(l));
  const gl = new RegExp(r.gloss, 'i');
  const words = allWords
    .filter((w) => isSubsequence(letters, normalize(w)) && gl.test(top(global.get(w).en)))
    .sort((a, b) => global.get(b).count - global.get(a).count)
    .slice(0, 8)
    .map(entry);
  if (words.length < 3) throw new Error(`Not enough root examples for ${r.id}`);
  return { root: r.id, examples: words };
});
fs.writeFileSync(path.join(OUT_LEARN, 'grammar-examples.json'), JSON.stringify(grammar));
fs.writeFileSync(path.join(OUT_LEARN, 'root-examples.json'), JSON.stringify(rootExamples));
console.log(grammar.map((g) => `${g.topic}: ${g.examples.slice(0, 4).map((e) => `${e.ar}=${e.en}`).join(' | ')}`).join('\n'));
console.log(rootExamples.map((r) => `${r.root}: ${r.examples.slice(0, 4).map((e) => `${e.ar}=${e.en}`).join(' | ')}`).join('\n'));

// ---------- Lazy loader index ----------
const lines = [
  '// AUTO-GENERATED by scripts/build-quran-data.mjs — do not edit.',
  'type Verse = [arabic: string, english: string, transliteration: string];',
  'type Word = [arabic: string, transliteration: string, english: string];',
  'export const surahLoaders: Record<number, () => Verse[]> = {',
  ...surahMeta.map((s) => `  ${s.n}: () => require('./surahs/${pad3(s.n)}.json'),`),
  '};',
  'export const wbwLoaders: Record<number, () => Word[][]> = {',
  ...surahMeta.map((s) => `  ${s.n}: () => require('./wbw/${pad3(s.n)}.json'),`),
  '};',
  '',
];
fs.writeFileSync(path.join(OUT_QURAN, 'loaders.generated.ts'), lines.join('\n'));

console.log('bismillah:', bismillahText);
console.log(juzMeta.map((j) => `${j.n} ${j.name} ${j.nameAr} ${j.start.s}:${j.start.a}-${j.end.s}:${j.end.a}`).join('\n'));
console.log('vocab', vocab.length, 'sample', vocab.slice(0, 6));
