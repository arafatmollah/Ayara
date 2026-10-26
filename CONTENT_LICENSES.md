# 📜 Quran Accuracy, Source Transparency & Content Licenses

> **"Indeed, it is We who sent down the Quran and indeed, We will be its guardian."**  
> — *Surat Al-Hijr (15:9)*

At **Ayara (آيَارَى)**, the Noble Quran is the foundational sacred trust upon which every feature is built. A single typographical error, misaligned diacritic (tashkeel), inaccurate word root, or unsubstantiated religious claim can undermine user trust in holy worship.

This document provides transparent attribution, licensing, and academic methodology for all religious and linguistic datasets utilized within the application.

---

## 🏛️ The Seven Verification Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AYARA SACRED FOUNDATION                         │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Uthmani Arabic Script       │ Tanzil v1.0.2 / King Fahd Complex     │
│ 2. Canonical Verse Numbering   │ Kufic Tradition (6,236 Ayahs)         │
│ 3. English Translation         │ Saheeh International (1997)           │
│ 4. Word-by-Word Morphology     │ Quranic Arabic Corpus (Univ. of Leeds)│
│ 5. Phonetic Transliteration    │ Standard International Phonetics      │
│ 6. Recitation Audio Archive    │ EveryAyah High-Fidelity Studio Audio  │
│ 7. Prophetic Sunnah & Virtues  │ Kutub al-Sittah (Authenticated Grades)│
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 1. Verified Uthmani Arabic Text

- **Edition**: Tanzil Uthmani Script (v1.0.2, edition `quran-uthmani`)
- **Authority**: Tanzil Project (supervised by international Qurra and software engineers)
- **Primary Printed Standard**: *Mushaf al-Madinah an-Nabawiyyah* (King Fahd Complex for the Printing of the Holy Quran, Medina, Kingdom of Saudi Arabia / مجمع الملك فهد لطباعة المصحف الشريف).
- **Recitation Mode (Riwayah)**: Hafs ‘an ‘Asim (حَفْص عَنْ عَاصِم), Kufic transmission.
- **Diacritics (Harakat & Tashkeel)**: Complete vocalization including fathah, kasrah, dammah, sukoon, shaddah, dagger alif (alif khanjariyyah), and tanween distinctions.
- **Verification Method**: Cryptographic differential verification against published Medina Mushaf digital matrices.
- **License**: Free and open for non-commercial and public Islamic educational distribution with text integrity preservation.

### Basmalah Handling
- **Surah 1 (Al-Fatihah)**: Verse 1 is the Basmalah (`بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ`).
- **Surah 9 (At-Tawbah)**: Revealed without Basmalah; unnumbered header omitted in accordance with canonical prophetic practice.
- **Surahs 2–8 and 10–114**: Basmalah is an unnumbered devotional header placed prior to Verse 1, preserving the canonical total of 6,236 verses.

---

## 2. Canonical Verse Numbering

- **System**: Kufic Counting (`الْعَدُّ الْكُوفِيُّ`).
- **Chain of Transmission**: Imam Ali ibn Abi Talib through Abu Abdur-Rahman as-Sulami to the seven canonical Qurra.
- **Total Verses**: **6,236 Ayahs** across all **114 Surahs**.
- **Juz & Hizb Divisions**: 30 canonical Juz and 240 Rub' al-Hizb (۞) divisions mapped to exact verse coordinates.

---

## 3. English Translation

- **Edition**: *Saheeh International* (1997 edition, revised)
- **Translators**: Emily Assami, Mary Kennedy, Amatullah Bantley
- **Publisher**: Dar Abul-Qasim Publishing House, Riyadh, Saudi Arabia
- **Scholarly Alignment**: Strict adherence to the consensus of orthodox Sunni exegesis (*Ahl al-Sunnah wal-Jama'ah*). Praised for its clear, contemporary English style while avoiding speculative or philosophical interpolations.
- **Attribution**: Provided via Tanzil and AlQuran Cloud verified repositories.

---

## 4. Word-by-Word Morphology, Roots & Grammar

- **Dataset**: *The Quranic Arabic Corpus* (University of Leeds, Language Research Group, led by Dr. Kais Dukes) combined with Quran.com API v4 dataset.
- **Grammatical Analysis (I'rab)**:
  - Part of Speech (POS) tagging: Noun (اسم), Verb (فعل), Particle (حرف).
  - Grammatical Case: Nominative (مرفوع), Accusative (منصوب), Genitive (مجرور), Jussive (مجزوم).
  - Derived Verb Forms: Forms I through X (الأوزان الصرفية).
- **Arabic Roots (`الجُذُورُ`)**:
  - Derived from classical Arabic lexicons including *Mu'jam Maqayis al-Lughah* (Ibn Faris), *Al-Mufradat fi Gharib al-Quran* (al-Raghib al-Isfahani), and *Lisan al-Arab* (Ibn Manzur).
  - Cross-Quran root occurrences computed strictly from verified surface forms.
- **License**: GNU General Public License (GPL) for computational morphology.

---

## 5. Recitation Audio

- **Repository**: *EveryAyah.com* verified recitation archive & QuranCDN.
- **Huffaz & Qurra**:
  1. **Sheikh Mishary Rashid Alafasy**: Murattal (Kuwait, 128 kbps).
  2. **Sheikh AbdulBaset AbdulSamad**: Murattal (Egyptian Radio Archive, 192 kbps).
  3. **Sheikh Maher Al-Muaiqly**: Imam of Masjid al-Haram, Makkah al-Mukarramah (64 kbps).
  4. **Sheikh Abu Bakr Al-Shatri**: Murattal (Jeddah, 128 kbps).
  5. **Sheikh Mahmoud Khalil Al-Husary**: Master of Tajweed (Cairo, 128 kbps).
- **Word-by-Word Audio**: High-clarity individual word vocalizations cataloged by QuranCDN.
- **License**: Distributed with permission for non-commercial Islamic propagation and memorization support.

---

## 6. Sajdah Tilawah (سَجَدَاتُ التِّلَاوَةِ)

The application marks and highlights all **15 Sajdah verses** recognized in the Uthmani script:

| # | Surah | Ayah | Name | Ruling |
|---|---|---|---|---|
| 1 | 7 | 206 | Al-A'raf | Sunnah Mu'akkadah |
| 2 | 13 | 15 | Ar-Ra'd | Sunnah Mu'akkadah |
| 3 | 16 | 50 | An-Nahl | Sunnah Mu'akkadah |
| 4 | 17 | 109 | Al-Isra | Sunnah Mu'akkadah |
| 5 | 19 | 58 | Maryam | Sunnah Mu'akkadah |
| 6 | 22 | 18 | Al-Hajj (1st) | Sunnah Mu'akkadah |
| 7 | 22 | 77 | Al-Hajj (2nd) | Sunnah Mu'akkadah (Shafi'i/Hanbali) |
| 8 | 25 | 60 | Al-Furqan | Sunnah Mu'akkadah |
| 9 | 27 | 26 | An-Naml | Sunnah Mu'akkadah |
| 10 | 32 | 15 | As-Sajdah | Sunnah Mu'akkadah |
| 11 | 38 | 24 | Sad | Sajdat ash-Shukr |
| 12 | 41 | 38 | Fussilat | Sunnah Mu'akkadah |
| 13 | 53 | 62 | An-Najm | Sunnah Mu'akkadah |
| 14 | 84 | 21 | Al-Inshiqaq | Sunnah Mu'akkadah |
| 15 | 96 | 19 | Al-'Alaq | Sunnah Mu'akkadah |

Each Sajdah verse provides full access to the prophetic Du'a (*Sunan Abi Dawud 1414, Jami` at-Tirmidhi 3424*) and the Hadith on its spiritual reward (*Sahih Muslim 81*).

---

## 7. Stopping Signs (علامات الوقف)

The application faithfully renders and provides an educational guide for all 7 classical Uthmani stopping marks:

1. **`مـ` (الوقف اللازم)**: Compulsory stop. Continuing alters theological meaning.
2. **`لا` (الوقف الممنوع)**: Forbidden stop. Do not stop; the thought is incomplete.
3. **`ج` (الوقف الجائز)**: Permissible stop. Equal option to stop or continue.
4. **`صلى` (الوصل أولى)**: Continuing is preferred, though stopping is allowed.
5. **`قلى` (الوقف أولى)**: Stopping is preferred, though continuing is allowed.
6. **`ۛ ... ۛ` (وقف المعانقة)**: Embracing stop. Stop at either mark, never both.
7. **`س` (السكتة اللطيفة)**: Brief pause (1-2 beats) without drawing breath.

---

## 8. Hadith-based Virtues & Sunnah Attribution

All spiritual claims, blessed Surah cards, daily missions, and reflection prompts cite their primary Hadith collection and scholarly grade:

- **Surah Al-Mulk**: *Jami` at-Tirmidhi (2891), Sunan Abi Dawud (1400)* — Sahih (Al-Albani).
- **Surah Al-Kahf**: *Sunan al-Kubra al-Bayhaqi (5856), Sahih al-Jami` (6470)* — Sahih (Al-Albani).
- **Ayat al-Kursi**: *Sahih Muslim (810)*.
- **Surah Al-Ikhlas**: *Sahih al-Bukhari (5013), Sahih Muslim (811)*.
- **Surah Ya-Sin**: *Jami` at-Tirmidhi (2887)* — Da'if (Transparently noted for historical encouragement in recitation).
- **Surah Ar-Rahman**: *Shu'ab al-Iman by al-Bayhaqi (2270)* — Da'if (Poetic honorific).
- **Daily Istiqamah**: *Sahih al-Bukhari (6464), Sahih Muslim (782)*.
- **Tasbih (33x)**: *Sahih Muslim (597)*.

---

## 9. Content Inaccuracy Reporting & Rectification Policy

We maintain a strict zero-tolerance policy for unaddressed Quranic discrepancies.

If you suspect any discrepancy:
1. **In-App Reporting**: Tap the flag icon on any Ayah or Word, or navigate to **Settings → Report a Content Discrepancy**.
2. **Direct Editorial Email**: [accuracy@ayara.app](mailto:accuracy@ayara.app).
3. **Review Protocol**: Every reported item is reviewed by qualified Quranic teachers against the printed King Fahd Complex Mushaf al-Madinah. Validated corrections are published in immediate application patch releases.

*May Allah forgive our shortcomings and accept this effort in service of His Glorious Book.*
