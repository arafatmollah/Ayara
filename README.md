# 🌿 Ayara (آيَارَى) — The Noble Quran Companion

<p align="center">
  <img src="./assets/icon.png" width="128" height="128" alt="Ayara Emblem" style="border-radius: 28px;" />
</p>

<p align="center">
  <b>A joyful, interactive, and comprehensive Quran learning and memorization companion.</b><br/>
  Featuring interactive word-by-word morphology, spaced-repetition vocabulary trainer, Hifz memorization mode, structured Quranic Arabic courses, daily spiritual habits, and audio recitations.
</p>

<p align="center">
  <a href="https://github.com/arafatmollah/Ayara/releases/latest"><img src="https://img.shields.io/github/v/release/arafatmollah/Ayara?color=7C3AED&label=Latest%20Release" alt="Latest Release" /></a>
  <a href="https://github.com/arafatmollah/Ayara/releases"><img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue?color=059669" alt="Platforms" /></a>
  <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-SDK%2058-black?logo=expo" alt="Expo SDK" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript" alt="TypeScript" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" /></a>
</p>

---

## 📥 Download & Release

Get the latest APK release directly on your Android device:

| Release | Download Link | Description |
| :--- | :--- | :--- |
| **Latest Android APK** | [**Download Ayara.apk (v1.5.0)**](https://github.com/arafatmollah/Ayara/releases/latest/download/Ayara.apk) | Direct standalone Android APK installable on all modern Android devices |
| **All Releases & Notes** | [**GitHub Releases Archive**](https://github.com/arafatmollah/Ayara/releases) | Full changelog, release notes, and version history |
| **Web Version** | [**Run in Web Browser**](http://localhost:8081) | Run locally with `npx expo start --web` |

> **Installation Note for Android APK**: If installing an APK for the first time, allow your browser or file manager to "Install unknown apps" in Android settings.

---

## ✨ Comprehensive Features

### 1. 🛡️ Quran Accuracy & Source Transparency (Foundational Core)
- **Verified Uthmani Arabic Text & Verse Numbering**: Bundled verified Tanzil Uthmani text (`quran-uthmani` v1.0.2) cross-checked against the King Fahd Complex *Mushaf al-Madinah*. Standard Kufic numbering (6,236 Ayahs across 114 Surahs). Zero generative AI hallucinations in Quranic text.
- **Clear Sources & Attribution**:
  - *Translation*: Saheeh International (1997, Dar Abul-Qasim).
  - *Transliteration*: Standard international phonetics adhering to Tajweed articulation.
  - *Recitation Audio*: EveryAyah verified audio archive with 5 master Huffaz (Sheikh Mishary Rashid Alafasy, Sheikh AbdulBaset AbdulSamad, Sheikh Maher Al-Muaiqly, Sheikh Abu Bakr Al-Shatri, Sheikh Mahmoud Khalil Al-Husary).
  - *Morphology & Trilateral Roots*: The Quranic Arabic Corpus (University of Leeds, Dr. Kais Dukes) & Classical Arabic Lexicons (*Ibn Faris*, *al-Raghib al-Isfahani*, *Lisan al-Arab*).
  - *Hadith-based Virtues*: Kutub al-Sittah citations (*Sahih al-Bukhari*, *Sahih Muslim*, *Jami` at-Tirmidhi*, *Sunan Abi Dawud*) with explicit authenticity grades (Sahih, Hasan, Da'if transparently noted).
- **Sajdah Tilawah Guidance (سَجَدَاتُ التِّلَاوَةِ)**: Dedicated badges on all 15 Quranic prostration verses with prophetic Du'as (*Sunan Abi Dawud 1414*) and jurisprudence rulings.
- **Stopping Signs (عَلَامَاتُ الْوَقْفِ) & Typography**: Comprehensive guide explaining all 7 Uthmani Waqf symbols (`مـ`, `لا`, `ج`, `صلى`, `قلى`, `ۛ ... ۛ`, `س`) and ornamental dividers (`۞`, `۝`, `۩`).
- **Content Inaccuracy Reporting**: 1-tap reporting mechanism from any Ayah, word card, or settings menu, with structured categories, suggested corrections, email dispatch, and local history logging.
- **Detailed Provenance Documentation**: See [CONTENT_LICENSES.md](./CONTENT_LICENSES.md) for full licensing, cryptographic verification methods, and academic references.

---

### 2. 🇧🇩 Full Bangla Mode (বাংলা অনুবাদ ও উচ্চারণ)
- **Offline Bengali Translation for all 114 Surahs (6,236 Ayahs)**: Authentic translation by Maulana Muhiuddin Khan (King Fahd Complex & Islamic Foundation Bangladesh), stored completely offline with zero network latency.
- **Authentic Bengali Surah Names & Meanings**: Complete Bengali titular and contextual metadata for all Surahs alongside Bengali Bismillah.
- **Bilingual Translation Switcher**: Seamlessly switch between English, বাংলা (Bangla), and Both (উভয়টি) in Reader Settings or via a single-tap pill in the reader controls bar.
- **Bengali Quran Search**: Direct phonetic and literal search in Bengali script (e.g. ফাতিহা, গাভী, কাহফ) from the Surahs library.

---

### 3. 📖 Interactive Word-by-Word Quran Reader
- **1-Tap Word Learning**: Tap any Arabic word in any Ayah to open its detailed morphology card.
- **Root Analysis (`جَذْر`)**: View the 3-letter Arabic root, its foundational meaning, and total Quranic frequency.
- **Grammar & Morphology**: Clear grammatical breakdown (Part of Speech, Grammatical Case, Derived Forms, Roles).
- **Word Pronunciation**: Listen to high-fidelity word-by-word audio pronunciations.
- **Cross-Quran Root Occurrences**: Explore other Ayahs across all 114 Surahs sharing the exact same root, with direct 1-tap navigation to read each verse in context.
- **Direct Vocabulary Bookmarking**: Save any encountered word to your personal spaced-repetition deck with one tap.

---

### 4. 🧠 Spaced-Repetition Vocabulary Trainer (SRS Engine)
- **SuperMemo-2 (SM-2) Algorithm**: Intelligent intervals calculating optimal review dates based on memory strength and ease factor.
- **Dual Recognition Flashcards**: Practice Arabic-to-English meaning recall and English-to-Arabic recognition.
- **Multiple-Choice Quizzes**: Test understanding with realistic distractors generated from genuine Quranic roots.
- **Comprehensive Deck Tracking**:
  - Mastered Words count
  - Due Reviews queue
  - New learning words
  - Weak words targeted for revision
  - Overall accuracy percentage
- **Daily Review Limits & Streaks**: Cultivate daily learning habits without burnout.

---

### 5. 🎯 Quran Memorization Mode (Hifz & Muraja'ah)
- **Targeted Practice**: Select any Surah and customize exact verse ranges (e.g. Verses 1 to 10).
- **Audio Reciter Companion**: Continuous audio playback with configurable loop and repetition counters per verse.
- **Adaptive Verse Masking**:
  - *Full Masking*: Hide the verse completely to test recall from memory.
  - *First Letter Hint*: Display the first letter of each word to nudge memory.
  - *Blurred Text*: Smooth gaussian blur over the script.
- **Self-Assessment Rating**: Grade your recitation as *Easy*, *Good*, *Hard*, or *Forgot* to drive personalized revision reminders.
- **Instant Reveal**: Tap to reveal the full Uthmani text with diacritics to verify accuracy.

---

### 6. 🎧 Continuous Surah Recitation & Ayah Focus Audio
- **Multi-Reciter Mastery**: Stream verified EveryAyah recitations from 5 master Huffaz (Sheikh Mishary Rashid Alafasy, Sheikh AbdulBaset AbdulSamad, Sheikh Maher Al-Muaiqly, Sheikh Abu Bakr Al-Shatri, Sheikh Mahmoud Khalil Al-Husary).
- **Continuous Mode vs Single-Ayah Focus**: Toggle continuous whole-surah recitation or focused single-verse playback (`infinite` toggle on the mini player and "Play All" on the Surah screen).
- **Single-Ayah Auto-Pause**: Individual ayah playback automatically pauses at completion without unintentionally overflowing into adjacent verses.
- **Persistent Floating Player Bar**: Interactive mini-player with live buffering status, playback mode badge, ayah counter, and transport controls.

---

### 7. 🌿 Daily Learning Missions (خُطَّةُ الاِسْتِقَامَةِ)
- **Balanced Daily Spiritual Routine**: Keeps sacred worship separate from competitive gamification.
  - 📖 **Read Verses**: Fulfill your personal daily reading target.
  - 🧠 **Learn Words**: Discover new Quranic vocabulary with root insights.
  - ✏️ **Grammar Exercise**: Complete interactive daily grammar & sentence challenges.
  - 🔁 **Review Due Vocabulary**: Clear your due spaced-repetition flashcards.
- **Istiqamah Completion Encouragement**: Peaceful Hadith banner upon completing all daily missions celebrating steadfast devotion.

---

### 8. 🎓 Structured Quranic Arabic Learning Paths (مَسَارَاتُ العَرَبِيَّةِ)
- Complete structured curriculum with 5 progressive courses and 20 interactive lessons:
  1. **Course 1: High-Frequency Quranic Words** — Master the words that make up over 80% of the Quranic text.
  2. **Course 2: Attached Pronouns & Markers (الضمائر المتصلة)** — Recognize possessive endings, subject markers, and object pronouns.
  3. **Course 3: Essential Particles & Prepositions (حروف الجر والعطف)** — Understand conjunctions, oaths, and prepositions.
  4. **Course 4: Trilateral Roots & Morphology (الأوزان الصرفية)** — Decode word families and root derivation patterns.
  5. **Course 5: Sentence Structures & Core Grammar (الجملة الاسمية والفعلية)** — Analyze nominal and verbal sentence structures.
- Real Quranic verses for every example, concept cards, interactive quizzes, and course completion badges.

---

### 9. ⏰ Daily 12-Hour Habit Reminders & In-App Release Updates
- **Gentle 12-Hour Reminders**: Schedule daily notifications at 8:00 PM, 9:00 PM, or 10:00 PM to review Quranic vocabulary without notification fatigue.
- **In-App GitHub Update Checker**: Ayara automatically verifies latest GitHub releases and delivers direct download notifications.
- **Dedicated Release Hub & What's New**: Discover newly shipped capabilities, detailed feature descriptions, and changelogs right from Settings or upon updating.

---

### 10. ☀️ Quranic Word of the Day (`كَلِمَةُ الْيَوْمِ`)
- Daily curated Quranic word in bold Arabic calligraphy with full diacritics.
- Transliteration, English meaning, and spiritual theme.
- Root badge showing root letters and frequency count across the Quran.
- Contextual snippet showing the word inside its revealed verse.
- 1-tap button to open the full morphology modal or jump directly to the reader.
- Playful **Shuffle / Next** button to discover more words at your own pace.

---

### 11. 🛡️ Blessed Surahs & Prophetic Sunnah Strip (`سُوَرٌ مُبَارَكَةٌ`)
- Quick 1-tap shortcuts to Surahs and Ayahs with special Prophetic virtues:
  - 🌙 **Surah Al-Mulk** (Surah 67) — Night Sunnah, protection, and intercessor in the grave.
  - ☀️ **Surah Al-Kahf** (Surah 18) — Friday light illuminating between the two Fridays.
  - 🛡️ **Ayat al-Kursi** (Surah 2:255) — The greatest verse of divine majesty and protection (with verified transliteration).
  - 💫 **Surah Ya-Sin** (Surah 36) — The radiant heart of the Quran.
  - 🌿 **Surah Ar-Rahman** (Surah 55) — The bride of the Quran celebrating Allah's boundless favors.
  - 🤍 **Surah Al-Ikhlas** (Surah 112) — Purity of faith, equivalent to reciting one-third of the Quran.

---

### 12. 📿 Playful Tasbih & Dhikr Pulse (`تَسْبِيحُ الْقَلْبِ`)
- Interactive digital Dhikr counter on the Home screen.
- Sacred Dhikr selector:
  - `سُبْحَانَ ٱللَّهِ` (SubhanAllah)
  - `ٱلْحَمْدُ لِلَّهِ` (Alhamdulillah)
  - `ٱللَّهُ أَكْبَرُ` (Allahu Akbar)
  - `لَا إِلَٰهَ إِلَّا ٱللَّهُ` (La ilaha illa Allah)
  - `أَسْتَغْفِرُ ٱللَّهَ` (Astaghfirullah)
- Tactile bouncy tap button with subtle haptic vibration feedback.
- Progress counter towards 33 beads with celebratory completion badge (*BarakAllah 🌟*).

---

### 13. 🎨 Sunset Amethyst Visual Identity & Resilient Navigation
- **Sunset Amethyst Palette**: Refined `#6121C5` branding across Android adaptive icons (foreground, background, monochrome), splash screen, and web favicon.
- **Resilient Deep-Link Navigation**: Built-in safe router back navigation preventing dead ends when launched via notifications, deep links, or web browser refreshes.
- **Accessibility & Motion Compliance**: Cheerful spring bounce animations with automatic reduced-motion detection.

---

### 14. 📊 Khatmah Tracker & Personal Reading Analytics
- **Khatmah Journey**: Real-time progress bar tracking unique verses recited out of all 6,236 Ayahs.
- **Hasanat Metric Counter**: Reflective spiritual counter (10x reward multiplier per recited letter).
- **Reading Time & Verses recited**: Segmented analytics across *Today*, *This Week*, and *All Time*.
- **Weekly Habit Strip**: M-T-W-T-F-S-S visual habit tracking with completed streak dots.
- **Daily Reflection Card**: Daily contemplation themes with Arabic Ayah, translation, and practical life takeaways.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) • [Expo](https://expo.dev/) (SDK 58) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode) |
| **Typography** | Noto Naskh Arabic (`@expo-google-fonts/noto-naskh-arabic`), Plus Jakarta Sans |
| **Audio** | `expo-audio` (Word-by-word & full verse streaming) |
| **Storage & Caching** | `@react-native-async-storage/async-storage` • `expo-sqlite` |
| **Haptics & Animations** | `expo-haptics` • React Native Animated & Reanimated |
| **Vector Graphics** | `react-native-svg` |

---

## 🚀 Getting Started (Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [Expo Go](https://expo.dev/go) app (on your physical Android/iOS device) or an emulator

### 1. Clone the Repository
```bash
git clone https://github.com/arafatmollah/Ayara.git
cd Ayara
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
# Start Expo development server
npx expo start

# Run in Web browser
npx expo start --web

# Run on Android emulator / connected device
npx expo run:android

# Run on iOS simulator (macOS only)
npx expo run:ios
```

### 4. Code Quality & Type Checking
```bash
# Run ESLint
npx eslint .

# Run TypeScript type check
npx tsc --noEmit
```

---

## 📦 Building Standalone APK (EAS Build)

To build a standalone APK using EAS (Expo Application Services):

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build standalone Android APK
eas build --platform android --profile preview
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<p align="center">
  <b>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</b><br/>
  <i>May Allah accept this effort and make it a source of benefit and barakah for all who seek to learn His Book.</i>
</p>
