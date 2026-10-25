import { LearningCourse } from '../types/quran';
export type { LearningCourse };

export const QURANIC_LEARNING_COURSES: LearningCourse[] = [
  // =========================================================================
  // COURSE 1: Common Words & Foundations (الكلمات الشائعة والأساسيات)
  // =========================================================================
  {
    id: 'course_1_common_words',
    level: 'beginner',
    levelLabel: 'Beginner • Level 1',
    order: 1,
    title: 'Common Words & Foundations',
    titleAr: 'الكلمات الشائعة والأساسيات',
    description:
      'Master the most frequent words in the Holy Quran, the definite article, and essential conjunctions.',
    icon: 'sparkles-outline',
    lessons: [
      {
        id: 'c1_l1_divine_names',
        courseId: 'course_1_common_words',
        order: 1,
        title: 'Divine Names & Core Nouns',
        titleAr: 'الأسماء الحسنى والكلمات المتكررة',
        summary:
          'Learn the most frequent nouns in the Quran: Allah, Rabb (Lord), Kitāb (Book), and Ard (Earth).',
        conceptPoints: [
          'The name ٱللَّه (Allāh) appears over 2,800 times in the Quran, representing the Sole Creator.',
          'رَبّ (Rabb) translates to "Lord, Sustainer, and Cherisher", appearing over 980 times.',
          'كِتَاب (Kitāb) means "writing" or "Book", while أَرْض (Ard) means "earth" and سَمَاء (Samāʾ) means "sky/heaven".',
          'Recognizing these core nouns immediately unlocks comprehension of nearly every single page.',
        ],
        demonstrations: [
          {
            arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
            transliteration: 'Bismi Allāhi al-Raḥmāni al-Raḥīm',
            translation: 'In the name of Allah, the Most Gracious, the Most Merciful.',
            surahNumber: 1,
            ayahNumber: 1,
            surahName: 'Al-Fatiha',
            highlightWords: ['ٱللَّهِ', 'ٱلرَّحْمَـٰنِ', 'ٱلرَّحِيمِ'],
            note: 'The foundational opening of the Quran featuring the Divine Name and His supreme attributes of Mercy.',
          },
          {
            arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
            transliteration: 'Al-ḥamdu lillāhi Rabbi al-ʿālamīn',
            translation: 'All praise is for Allah, the Lord of all the worlds.',
            surahNumber: 1,
            ayahNumber: 2,
            surahName: 'Al-Fatiha',
            highlightWords: ['رَبِّ', 'ٱلْعَـٰلَمِينَ'],
            note: 'Shows the word رَبّ (Lord) in construct with ٱلْعَالَمِينَ (the worlds).',
          },
          {
            arabic: 'ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ',
            transliteration: 'Dhālika al-kitābu lā rayba fīhi hudan lil-muttaqīn',
            translation: 'This is the Book about which there is no doubt, a guidance for the God-conscious.',
            surahNumber: 2,
            ayahNumber: 2,
            surahName: 'Al-Baqarah',
            highlightWords: ['ٱلْكِتَـٰبُ'],
            note: 'Introduces ٱلْكِتَاب (the Book) as the ultimate divine guidance.',
          },
        ],
        quizQuestions: [
          {
            id: 'c1_l1_q1',
            question: 'What is the primary Quranic meaning of the word "رَبّ" (Rabb)?',
            options: [
              'Lord, Sustainer, and Nourisher',
              'The Prophet',
              'The Holy Mountain',
              'The Written Law',
            ],
            correctAnswerIndex: 0,
            explanation:
              'رَبّ (Rabb) means Lord, Sustainer, Cherisher, and Caretaker. It appears over 980 times in the Quran.',
          },
          {
            id: 'c1_l1_q2',
            question: 'In Surah Al-Fatiha (1:2), what does "ٱلْعَـٰلَمِينَ" mean in "رَبِّ ٱلْعَـٰلَمِينَ"?',
            arabicSnippet: 'رَبِّ ٱلْعَـٰلَمِينَ',
            transliteration: 'Rabbi al-ʿālamīn',
            options: [
              'Of all the worlds / universe',
              'Of the angels alone',
              'Of the believers only',
              'Of the day of judgment',
            ],
            correctAnswerIndex: 0,
            explanation:
              'ٱلْعَالَمِينَ is the plural of عَالَم, meaning "all realms of existence, creations, and worlds".',
          },
          {
            id: 'c1_l1_q3',
            question: 'Which word in Surah Al-Baqarah 2:2 refers to "the Book"?',
            arabicSnippet: 'ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ',
            options: ['ٱلْكِتَـٰبُ', 'ذَٰلِكَ', 'رَيْبَ', 'فِيهِ'],
            correctAnswerIndex: 0,
            explanation:
              'ٱلْكِتَاب (al-Kitāb) is the definite noun meaning "the Book".',
          },
        ],
        reviewTakeaways: [
          'Allāh (ٱللَّه) and Rabb (رَبّ) are the foundational words of devotion in the Quran.',
          'Kitāb (كِتَاب) denotes divine revelation and guidance.',
          'These high-frequency words recur in every Surah, forming your core Quranic foundation.',
        ],
        vocabularyToSave: [
          { id: '1:1:2', arabic: 'ٱللَّهِ', transliteration: 'l-lahi', english: 'Allah', surah: 1, ayah: 1, surahName: 'Al-Fatiha' },
          { id: '1:2:3', arabic: 'رَبِّ', transliteration: 'rabbi', english: 'the Lord', rootAr: 'ر ب ب', surah: 1, ayah: 2, surahName: 'Al-Fatiha' },
          { id: '2:2:2', arabic: 'ٱلْكِتَـٰبُ', transliteration: 'l-kitābu', english: 'the Book', rootAr: 'ك ت ب', surah: 2, ayah: 2, surahName: 'Al-Baqarah' },
          { id: '1:2:4', arabic: 'ٱلْعَـٰلَمِينَ', transliteration: 'l-ʿālamīna', english: 'the worlds', rootAr: 'ع ل م', surah: 1, ayah: 2, surahName: 'Al-Fatiha' },
        ],
      },
      {
        id: 'c1_l2_definite_article',
        courseId: 'course_1_common_words',
        order: 2,
        title: 'The Definite Article ال (Al-)',
        titleAr: 'لام التعريف ال',
        summary:
          'Understand how the prefix ال turns indefinite nouns into specific, definite ones, and learn the rules of solar and lunar pronunciation.',
        conceptPoints: [
          'Adding ال (al-) to a noun turns it from indefinite ("a book" كِتَاب) to definite ("the Book" ٱلْكِتَاب).',
          'In the Quran, the alif is often written ٱ (alif waṣla), pronounced only at the start of speech and silenced when flowing from a prior word.',
          'With Sun letters (such as ر, س, ن, ت, د), the ل is assimilated: ٱلرَّحْمَٰن is pronounced "ar-raḥmān", not "al-raḥmān".',
          'With Moon letters (such as ب, ج, ح, ع, ك, م), the ل is pronounced distinctly: ٱلْحَمْدُ is read "al-ḥamdu".',
        ],
        demonstrations: [
          {
            arabic: 'ٱلْحَمْدُ لِلَّهِ',
            transliteration: 'Al-ḥamdu lillāh',
            translation: 'All praise is for Allah.',
            surahNumber: 1,
            ayahNumber: 2,
            surahName: 'Al-Fatiha',
            highlightWords: ['ٱلْحَمْدُ'],
            note: 'Notice the distinct "l" sound in ٱلْحَمْدُ (Moon letter ح).',
          },
          {
            arabic: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
            transliteration: 'Ar-raḥmāni ar-raḥīm',
            translation: 'The Most Gracious, the Most Merciful.',
            surahNumber: 1,
            ayahNumber: 3,
            surahName: 'Al-Fatiha',
            highlightWords: ['ٱلرَّحْمَـٰنِ', 'ٱلرَّحِيمِ'],
            note: 'The "l" assimilates into the Sun letter ر with a shaddah: ar-raḥmān.',
          },
        ],
        quizQuestions: [
          {
            id: 'c1_l2_q1',
            question: 'How does Arabic transform "a book" (كِتَاب) into "the book"?',
            options: [
              'By prefixing ال (al-) to the front: ٱلْكِتَاب',
              'By adding an ending ـة',
              'By doubling the middle letter',
              'By placing a kasrah underneath',
            ],
            correctAnswerIndex: 0,
            explanation:
              'Adding ال turns indefinite nouns into definite nouns, functioning like "the" in English.',
          },
          {
            id: 'c1_l2_q2',
            question: 'Why is "ٱلرَّحْمَـٰن" pronounced "ar-raḥmān" instead of "al-raḥmān"?',
            options: [
              'Because the letter ر (rā) is a Sun letter that assimilates the lām',
              'Because the word is an adjective',
              'Because it is at the end of the sentence',
              'Because it has a sukun',
            ],
            correctAnswerIndex: 0,
            explanation:
              'Before Sun letters (like ر), the lām is merged into the letter, which takes a shaddah.',
          },
          {
            id: 'c1_l2_q3',
            question: 'Which of the following demonstrates a Moon letter where the "l" is clearly spoken?',
            options: ['ٱلْحَمْدُ (al-ḥamdu)', 'ٱلرَّحِيمُ (ar-raḥīmu)', 'ٱلصَّلَوٰةُ (aṣ-ṣalātu)', 'ٱلنَّاسُ (an-nāsu)'],
            correctAnswerIndex: 0,
            explanation:
              'ح is a Moon letter, so the lām is pronounced clearly: al-ḥamdu.',
          },
        ],
        reviewTakeaways: [
          'ال equates to the definite article "the".',
          'Sun letters assimilate the "l" into a doubled consonant (shaddah).',
          'Moon letters pronounce the "l" crisply.',
        ],
        vocabularyToSave: [
          { id: '1:2:1', arabic: 'ٱلْحَمْدُ', transliteration: 'al-ḥamdu', english: 'All praise', rootAr: 'ح م د', surah: 1, ayah: 2, surahName: 'Al-Fatiha' },
          { id: '1:3:1', arabic: 'ٱلرَّحْمَـٰنِ', transliteration: 'al-raḥmāni', english: 'The Most Gracious', rootAr: 'ر ح م', surah: 1, ayah: 3, surahName: 'Al-Fatiha' },
          { id: '1:3:2', arabic: 'ٱلرَّحِيمِ', transliteration: 'al-raḥīmi', english: 'The Most Merciful', rootAr: 'ر ح م', surah: 1, ayah: 3, surahName: 'Al-Fatiha' },
        ],
      },
      {
        id: 'c1_l3_conjunctions',
        courseId: 'course_1_common_words',
        order: 3,
        title: 'Conjunctions وَ (And) & فَـ (So/Then)',
        titleAr: 'حروف العطف: الواو والفاء',
        summary:
          'Discover how the single-letter prefixes وَ (and) and فَـ (so/then) connect ideas, sentences, and historical narratives.',
        conceptPoints: [
          'وَ (wa) means "and". It is the most frequent particle in the Quran and is always joined directly to the following word.',
          'فَـ (fa) means "so", "then", or "as a result", introducing an immediate consequence or sequence of events.',
          'Unlike English where "and" stands alone, Arabic attaches these conjunctions seamlessly as prefixes: وَٱللَّهُ (and Allah), فَلَا (so do not).',
        ],
        demonstrations: [
          {
            arabic: 'وَٱللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ',
            transliteration: 'Wal-lāhu bimā taʿmalūna baṣīr',
            translation: 'And Allah is All-Seeing of what you do.',
            surahNumber: 2,
            ayahNumber: 96,
            surahName: 'Al-Baqarah',
            highlightWords: ['وَٱللَّهُ'],
            note: 'وَ connects this declaration with the preceding discourse: "And Allah..."',
          },
          {
            arabic: 'فَلَا تَجْعَلُوا۟ لِلَّهِ أَندَادًۭا',
            transliteration: 'Falā tajʿalū lillāhi andādā',
            translation: 'So do not set up rivals to Allah.',
            surahNumber: 2,
            ayahNumber: 22,
            surahName: 'Al-Baqarah',
            highlightWords: ['فَلَا'],
            note: 'فَـ indicates the logical consequence: because He created you and provided for you, therefore do not associate partners with Him.',
          },
        ],
        quizQuestions: [
          {
            id: 'c1_l3_q1',
            question: 'What is the English meaning of the attached prefix وَ (wa)?',
            options: ['And', 'In', 'From', 'With'],
            correctAnswerIndex: 0,
            explanation:
              'وَ (wa) is the coordinating conjunction meaning "and". It attaches to the next word without a space.',
          },
          {
            id: 'c1_l3_q2',
            question: 'How does the particle فَـ (fa) differ from وَ (wa)?',
            options: [
              'فَـ denotes consequence or sequence ("so", "then", "consequently")',
              'فَـ means "or"',
              'فَـ means "never"',
              'فَـ is an attached pronoun',
            ],
            correctAnswerIndex: 0,
            explanation:
              'While وَ simply joins ("and"), فَـ introduces an immediate result, sequence, or response ("so / then").',
          },
          {
            id: 'c1_l3_q3',
            question: 'In the phrase "فَلَا تَجْعَلُوا۟", what does "فَلَا" mean?',
            arabicSnippet: 'فَلَا',
            options: ['So (do) not', 'And they did', 'Because of', 'Without'],
            correctAnswerIndex: 0,
            explanation:
              'فَـ (so) + لَا (not) combines into فَلَا: "So do not...".',
          },
        ],
        reviewTakeaways: [
          'وَ joins clauses as "and".',
          'فَـ signals consequence and sequential action ("so / then").',
          'Both are prefix particles attached seamlessly to the head of the following word.',
        ],
        vocabularyToSave: [
          { id: '2:19:17', arabic: 'وَٱللَّهُ', transliteration: 'wal-lahu', english: 'And Allah', surah: 2, ayah: 19, surahName: 'Al-Baqarah' },
          { id: '2:22:18', arabic: 'فَلَا', transliteration: 'falā', english: 'So (do) not', surah: 2, ayah: 22, surahName: 'Al-Baqarah' },
          { id: '2:8:9', arabic: 'وَمَا', transliteration: 'wamā', english: 'And not', surah: 2, ayah: 8, surahName: 'Al-Baqarah' },
        ],
      },
    ],
  },

  // =========================================================================
  // COURSE 2: Attached Pronouns (الضمائر المتصلة)
  // =========================================================================
  {
    id: 'course_2_pronouns',
    level: 'beginner',
    levelLabel: 'Beginner • Level 2',
    order: 2,
    title: 'Attached Pronouns',
    titleAr: 'الضمائر المتصلة',
    description:
      'Learn how Arabic attaches pronouns to the ends of nouns, verbs, and prepositions: his, her, your, our, and their.',
    icon: 'people-outline',
    lessons: [
      {
        id: 'c2_l1_third_person_singular',
        courseId: 'course_2_pronouns',
        order: 1,
        title: 'ـهُ / ـهِ & ـهَا (Him/His & Her/Its)',
        titleAr: 'ضمائر الغائب المفرد: ـهُ وـهَا',
        summary:
          'Learn the third-person singular suffixes attached to nouns and prepositions.',
        conceptPoints: [
          'The suffix ـهُ (-hu) attaches to nouns to mean "his" (e.g. رَبُّهُ "his Lord").',
          'When attached to prepositions, it means "him" or "it" (e.g. فِيهِ "in it", بِهِ "with it/him").',
          'After an "i" vowel (kasrah or yā), ـهُ shifts to ـهِ (-hi) for phonetic harmony (e.g. فِي + ـهُ = فِيهِ).',
          'The feminine counterpart is ـهَا (-hā), meaning "her" or "its" (e.g. فِيهَا "in it/her").',
        ],
        demonstrations: [
          {
            arabic: 'ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ',
            transliteration: 'Dhālika al-kitābu lā rayba fīh',
            translation: 'This is the Book, there is no doubt in it.',
            surahNumber: 2,
            ayahNumber: 2,
            surahName: 'Al-Baqarah',
            highlightWords: ['فِيهِ'],
            note: 'فِيهِ is composed of فِى (in) + ـهِ (it), referring back to ٱلْكِتَاب.',
          },
          {
            arabic: 'خَلَقَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ بِٱلْحَقِّ ۚ تَعَـٰلَىٰ عَمَّا يُشْرِكُونَ',
            transliteration: 'Khalaqa as-samāwāti wal-arḍa bil-ḥaqq',
            translation: 'He created the heavens and earth in truth.',
            surahNumber: 16,
            ayahNumber: 3,
            surahName: 'An-Nahl',
            highlightWords: ['بِٱلْحَقِّ'],
            note: 'Shows the masculine third person subject referring to Allah.',
          },
          {
            arabic: 'جَنَّـٰتٍ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ خَـٰلِدِينَ فِيهَا',
            transliteration: 'Jannātin tajrī min taḥtihā al-anhāru khālidīna fīhā',
            translation: 'Gardens beneath which rivers flow, abiding eternally therein.',
            surahNumber: 3,
            ayahNumber: 15,
            surahName: 'Ali Imran',
            highlightWords: ['تَحْتِهَا', 'فِيهَا'],
            note: 'تَحْتِهَا (beneath it) and فِيهَا (in it) use the feminine suffix ـهَا referring to جَنَّات (gardens).',
          },
        ],
        quizQuestions: [
          {
            id: 'c2_l1_q1',
            question: 'What does the suffix "ـهُ" mean when attached to a noun like "رَبُّهُۥ"?',
            options: ['His Lord', 'Our Lord', 'Your Lord', 'Their Lord'],
            correctAnswerIndex: 0,
            explanation:
              'ـهُ (-hu) is the 3rd person masculine singular pronoun meaning "his" or "him".',
          },
          {
            id: 'c2_l1_q2',
            question: 'Why does "فِى" + "ـهُ" become "فِيهِ" (fīhi) instead of "fīhu"?',
            options: [
              'Phonetic harmony: after the yā/kasrah, the vowel harmonizes to kasrah (-hi)',
              'Because it is feminine',
              'Because it is a verb',
              'Because it is plural',
            ],
            correctAnswerIndex: 0,
            explanation:
              'Arabic shifts -hu to -hi whenever preceded by a kasrah or a yā to maintain effortless vocal harmony.',
          },
          {
            id: 'c2_l1_q3',
            question: 'What is the feminine equivalent of "ـهُ" (meaning "her / its")?',
            options: ['ـهَا (-hā)', 'ـنَا (-nā)', 'ـكُمْ (-kum)', 'ـكَ (-ka)'],
            correctAnswerIndex: 0,
            explanation:
              'ـهَا (-hā) represents third person feminine singular ("her / its / therein").',
          },
        ],
        reviewTakeaways: [
          'ـهُ / ـهِ = him / his / it (masculine).',
          'ـهَا = her / its (feminine).',
          'Vowels harmonize smoothly depending on the preceding sound.',
        ],
        vocabularyToSave: [
          { id: '2:19:5', arabic: 'فِيهِ', transliteration: 'fīhi', english: 'in it', surah: 2, ayah: 19, surahName: 'Al-Baqarah' },
          { id: '2:22:13', arabic: 'بِهِۦ', transliteration: 'bihi', english: 'with it', surah: 2, ayah: 22, surahName: 'Al-Baqarah' },
          { id: '2:25:29', arabic: 'فِيهَآ', transliteration: 'fīhā', english: 'in it', surah: 2, ayah: 25, surahName: 'Al-Baqarah' },
        ],
      },
      {
        id: 'c2_l2_second_person',
        courseId: 'course_2_pronouns',
        order: 2,
        title: 'ـكَ & ـكُمْ (You & You All)',
        titleAr: 'ضمائر المخاطب: ـكَ وـكُمْ',
        summary:
          'Learn how the Quran directly addresses the listener in both singular and plural forms.',
        conceptPoints: [
          'ـكَ (-ka) means "you" or "your" in the masculine singular (e.g. رَبُّكَ "your Lord").',
          'In feminine singular address, it takes a kasrah: ـكِ (-ki), as when Maryam (peace be upon her) is addressed.',
          'ـكُمْ (-kum) means "you all" or "your" in the masculine plural, used whenever Allah addresses the community of believers or mankind.',
        ],
        demonstrations: [
          {
            arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
            transliteration: 'Iyyāka naʿbudu wa-iyyāka nastaʿīn',
            translation: 'You alone we worship, and You alone we ask for help.',
            surahNumber: 1,
            ayahNumber: 5,
            surahName: 'Al-Fatiha',
            highlightWords: ['إِيَّاكَ'],
            note: 'Direct personal address to Allah: إِيَّا + ـكَ = "You alone".',
          },
          {
            arabic: 'يَـٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ',
            transliteration: 'Yā ayyuhā an-nāsu uʿbudū rabbakumu alladhī khalaqakum',
            translation: 'O mankind, worship your Lord, who created you.',
            surahNumber: 2,
            ayahNumber: 21,
            surahName: 'Al-Baqarah',
            highlightWords: ['رَبَّكُمُ', 'خَلَقَكُمْ'],
            note: 'Shows the plural address: رَبَّكُم (your Lord) and خَلَقَكُم (He created you all).',
          },
        ],
        quizQuestions: [
          {
            id: 'c2_l2_q1',
            question: 'What is the difference between "رَبُّكَ" and "رَبُّكُمْ"?',
            options: [
              'رَبُّكَ addresses one person ("your Lord"), while رَبُّكُمْ addresses a group ("your Lord, of you all")',
              'رَبُّكَ is past tense',
              'رَبُّكُمْ refers to angels',
              'There is no difference',
            ],
            correctAnswerIndex: 0,
            explanation:
              'ـكَ (-ka) is singular ("your"), while ـكُمْ (-kum) is plural ("your all\'s").',
          },
          {
            id: 'c2_l2_q2',
            question: 'In Surah Al-Fatiha 1:5, what does "إِيَّاكَ" mean?',
            arabicSnippet: 'إِيَّاكَ نَعْبُدُ',
            options: ['You alone', 'Our Lord', 'Their way', 'All people'],
            correctAnswerIndex: 0,
            explanation:
              'إِيَّاكَ places exclusive emphasis on the single addressee: "You alone".',
          },
        ],
        reviewTakeaways: [
          'ـكَ (-ka) = you / your (singular).',
          'ـكُمْ (-kum) = you / your (plural).',
          'Extremely frequent in direct Quranic exhortations.',
        ],
        vocabularyToSave: [
          { id: '2:252:5', arabic: 'عَلَيْكَ', transliteration: 'ʿalayka', english: 'to you', surah: 2, ayah: 252, surahName: 'Al-Baqarah' },
          { id: '2:40:7', arabic: 'عَلَيْكُمْ', transliteration: 'ʿalaykum', english: 'upon you', surah: 2, ayah: 40, surahName: 'Al-Baqarah' },
          { id: '2:49:17', arabic: 'رَّبِّكُمْ', transliteration: 'rabbikum', english: 'your Lord', rootAr: 'ر ب ب', surah: 2, ayah: 49, surahName: 'Al-Baqarah' },
        ],
      },
      {
        id: 'c2_l3_first_person',
        courseId: 'course_2_pronouns',
        order: 3,
        title: 'ـي / ـنِي & ـنَا (Me/My & Us/Our)',
        titleAr: 'ضمائر المتكلم: ـي وـنَا',
        summary:
          'Master first-person singular and plural suffixes: expressing intimacy in duʿāʾ and communal prayer.',
        conceptPoints: [
          'ـي (-ī) attaches to nouns and prepositions to mean "my" (e.g. رَبِّي "my Lord", لِي "for me").',
          'Attached to verbs, a protecting nūn (ن) is inserted: ـنِي (-nī), meaning "me" (e.g. يَهْدِينِ "He guides me").',
          'ـنَا (-nā) represents "us" or "our" (e.g. رَبَّنَا "Our Lord", ٱهْدِنَا "Guide us"). It is the voice of communal humility.',
        ],
        demonstrations: [
          {
            arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
            transliteration: 'Ihdinā aṣ-ṣirāṭa al-mustaqīm',
            translation: 'Guide us to the straight path.',
            surahNumber: 1,
            ayahNumber: 6,
            surahName: 'Al-Fatiha',
            highlightWords: ['ٱهْدِنَا'],
            note: 'ٱهْدِ (guide!) + ـنَا (us) = Guide us.',
          },
          {
            arabic: 'قَالَ رَبِّ ٱغْفِرْ لِى وَلِأَخِى',
            transliteration: 'Qāla Rabbi ighfir lī wali-akhī',
            translation: 'He said: My Lord, forgive me and my brother.',
            surahNumber: 7,
            ayahNumber: 151,
            surahName: 'Al-A\'raf',
            highlightWords: ['رَبِّ', 'لِى', 'وَلِأَخِى'],
            note: 'Expresses intimate singular petition: رَبِّ (my Lord), لِي (for me), and أَخِي (my brother).',
          },
        ],
        quizQuestions: [
          {
            id: 'c2_l3_q1',
            question: 'What does the suffix "ـنَا" signify in "رَبَّنَا" (Rabbanā)?',
            options: ['Our ("Our Lord")', 'Your', 'His', 'Their'],
            correctAnswerIndex: 0,
            explanation:
              'ـنَا (-nā) is the first person plural pronoun meaning "us / our".',
          },
          {
            id: 'c2_l3_q2',
            question: 'In "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", which part means "us"?',
            options: ['The suffix ـنَا in ٱهْدِنَا', 'ٱلصِّرَٰطَ', 'ٱلْمُسْتَقِيمَ', 'The alif'],
            correctAnswerIndex: 0,
            explanation:
              'ٱهْدِ (Guide!) + ـنَا (us) = "Guide us".',
          },
        ],
        reviewTakeaways: [
          'ـي / ـنِي = me / my (singular).',
          'ـنَا = us / our (plural).',
          'Central to Quranic supplications (Adʿiyah).',
        ],
        vocabularyToSave: [
          { id: '2:127:8', arabic: 'رَبَّنَا', transliteration: 'rabbanā', english: 'Our Lord', rootAr: 'ر ب ب', surah: 2, ayah: 127, surahName: 'Al-Baqarah' },
          { id: '3:51:3', arabic: 'رَبِّى', transliteration: 'rabbī', english: 'my Lord', rootAr: 'ر ب ب', surah: 3, ayah: 51, surahName: 'Ali Imran' },
          { id: '1:6:1', arabic: 'ٱهْدِنَا', transliteration: 'ih\'dinā', english: 'Guide us', rootAr: 'ه د ي', surah: 1, ayah: 6, surahName: 'Al-Fatiha' },
        ],
      },
      {
        id: 'c2_l4_plural_dual_pronouns',
        courseId: 'course_2_pronouns',
        order: 4,
        title: 'ـهُمْ & ـهُمَا (Them & Both of Them)',
        titleAr: 'ضمائر الجمع والمثنى الغائب',
        summary:
          'Learn third-person plural and dual suffixes, frequently used to describe groups, predecessors, and pairs.',
        conceptPoints: [
          'ـهُمْ (-hum) attached to a noun means "their" (e.g. دِينُهُمْ "their religion").',
          'Attached to a preposition, it means "them" (e.g. عَلَيْهِمْ "upon them", لَهُمْ "for them").',
          'ـهُمَا (-humā) is the dual pronoun referring specifically to two individuals or two entities (e.g. لَهُمَا "to both of them").',
        ],
        demonstrations: [
          {
            arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
            transliteration: 'Ṣirāṭa alladhīna anʿamta ʿalayhim',
            translation: 'The path of those upon whom You have bestowed favor.',
            surahNumber: 1,
            ayahNumber: 7,
            surahName: 'Al-Fatiha',
            highlightWords: ['عَلَيْهِمْ'],
            note: 'عَلَيْ (upon) + ـهِمْ (them) = "upon them".',
          },
          {
            arabic: 'فَوَسْوَسَ لَهُمَا ٱلشَّيْطَـٰنُ',
            transliteration: 'Fawaswasa lahumā ash-shayṭān',
            translation: 'Then Satan whispered to both of them.',
            surahNumber: 7,
            ayahNumber: 20,
            surahName: 'Al-A\'raf',
            highlightWords: ['لَهُمَا'],
            note: 'لَـ (to) + ـهُمَا (both of them), referring to Adam and Hawwa (peace be upon them).',
          },
        ],
        quizQuestions: [
          {
            id: 'c2_l4_q1',
            question: 'What does "عَلَيْهِمْ" mean in Surah Al-Fatiha?',
            options: ['Upon them', 'Upon us', 'Upon you', 'In it'],
            correctAnswerIndex: 0,
            explanation:
              'عَلَىٰ (upon) + ـهِمْ (them) combines into عَلَيْهِمْ ("upon them").',
          },
          {
            id: 'c2_l4_q2',
            question: 'How many entities does the pronoun "ـهُمَا" (-humā) refer to?',
            options: ['Exactly two (Dual)', 'One (Singular)', 'Three or more (Plural)', 'Infinite'],
            correctAnswerIndex: 0,
            explanation:
              'ـهُمَا is the distinct Arabic dual pronoun for two persons or things.',
          },
        ],
        reviewTakeaways: [
          'ـهُمْ = them / their (plural).',
          'ـهُمَا = both of them (dual pair).',
          'Mastering pronouns decodes who is speaking, who is addressed, and who is referred to.',
        ],
        vocabularyToSave: [
          { id: '1:7:4', arabic: 'عَلَيْهِمْ', transliteration: 'ʿalayhim', english: 'to them', surah: 1, ayah: 7, surahName: 'Al-Fatiha' },
          { id: '2:11:3', arabic: 'لَهُمْ', transliteration: 'lahum', english: 'for them', surah: 2, ayah: 11, surahName: 'Al-Baqarah' },
          { id: '7:20:2', arabic: 'لَهُمَا', transliteration: 'lahumā', english: 'to both of them', surah: 7, ayah: 20, surahName: 'Al-A\'raf' },
        ],
      },
    ],
  },

  // =========================================================================
  // COURSE 3: Particles & Prepositions (الحروف وأدوات المعاني)
  // =========================================================================
  {
    id: 'course_3_particles',
    level: 'elementary',
    levelLabel: 'Elementary • Level 3',
    order: 3,
    title: 'Particles & Prepositions',
    titleAr: 'الحروف وأدوات المعاني',
    description:
      'Learn prepositions, emphatic particles, and negation tools that give Quranic sentences their exact legal and spiritual meaning.',
    icon: 'git-commit-outline',
    lessons: [
      {
        id: 'c3_l1_core_prepositions',
        courseId: 'course_3_particles',
        order: 1,
        title: 'Core Prepositions: مِنْ, فِي, عَلَى, إِلَى, عَنْ',
        titleAr: 'حروف الجر الأساسية',
        summary:
          'Master the five most prolific standalone prepositions in the Holy Quran.',
        conceptPoints: [
          'مِنْ (min) means "from" or "of".',
          'فِي (fī) means "in" or "within".',
          'عَلَى (ʿalā) means "upon" or "on".',
          'إِلَى (ilā) means "to" or "towards".',
          'عَنْ (ʿan) means "about" or "away from".',
          'Grammar effect: Any noun following a preposition enters the genitive case (majrūr), typically marked by a kasrah (-i).',
        ],
        demonstrations: [
          {
            arabic: 'هُوَ ٱلَّذِى خَلَقَ لَكُم مَّا فِى ٱلْأَرْضِ جَمِيعًۭا',
            transliteration: 'Huwa alladhī khalaqa lakum mā fī al-arḍi jamīʿā',
            translation: 'It is He who created for you all of that which is on the earth.',
            surahNumber: 2,
            ayahNumber: 29,
            surahName: 'Al-Baqarah',
            highlightWords: ['فِى ٱلْأَرْضِ'],
            note: 'فِى governs ٱلْأَرْضِ, putting it in the genitive case with a kasrah: al-arḍi.',
          },
          {
            arabic: 'أُو۟لَـٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ',
            transliteration: 'Ulāʾika ʿalā hudan min rabbihim',
            translation: 'Those are upon guidance from their Lord.',
            surahNumber: 2,
            ayahNumber: 5,
            surahName: 'Al-Baqarah',
            highlightWords: ['عَلَىٰ', 'مِّن'],
            note: 'Shows both عَلَىٰ (upon) and مِنْ (from) in a single verse.',
          },
        ],
        quizQuestions: [
          {
            id: 'c3_l1_q1',
            question: 'What vowel ending does a noun normally receive immediately after a preposition like "مِن" or "فِى"?',
            options: ['Kasrah (-i / genitive case)', 'Dammah (-u / nominative)', 'Fathah (-a / accusative)', 'Sukūn'],
            correctAnswerIndex: 0,
            explanation:
              'Prepositions are "ḥurūf al-jarr", requiring the following noun to take a genitive kasrah (-i).',
          },
          {
            id: 'c3_l1_q2',
            question: 'What does "عَلَىٰ هُدًۭى" mean in Surah Al-Baqarah 2:5?',
            options: ['Upon guidance', 'From darkness', 'In the earth', 'To the fire'],
            correctAnswerIndex: 0,
            explanation:
              'عَلَىٰ means "upon" or "on".',
          },
        ],
        reviewTakeaways: [
          'مِنْ = from, فِي = in, عَلَى = upon, إِلَى = to, عَنْ = about/from.',
          'They place the following noun in the genitive case (-i).',
        ],
        vocabularyToSave: [
          { id: '2:10:1', arabic: 'فِى', transliteration: 'fī', english: 'in', surah: 2, ayah: 10, surahName: 'Al-Baqarah' },
          { id: '2:4:8', arabic: 'مِن', transliteration: 'min', english: 'from', surah: 2, ayah: 4, surahName: 'Al-Baqarah' },
          { id: '2:5:2', arabic: 'عَلَىٰ', transliteration: 'ʿalā', english: 'on', surah: 2, ayah: 5, surahName: 'Al-Baqarah' },
        ],
      },
      {
        id: 'c3_l2_attached_prepositions',
        courseId: 'course_3_particles',
        order: 2,
        title: 'Attached Prepositions: بِـ (With/In) & لِـ (For/To)',
        titleAr: 'حروف الجر المتصلة: الباء واللام',
        summary:
          'Learn single-letter prepositions that attach directly to nouns: Bismillāh, Lillāh, and Lakum.',
        conceptPoints: [
          'بِـ (bi-) means "with", "by", or "in". It is famously the very first letter of the Quran in بِسْمِ (in the name of).',
          'لِـ (li-) means "for", "to", or "belonging to" (e.g. لِلَّهِ "belonging to Allah", لَكُمْ "for you").',
          'Before attached pronouns, لِـ usually takes a fathah: لَكَ (for you), لَهُ (for him), لَهُمْ (for them), except with first person: لِي (for me).',
        ],
        demonstrations: [
          {
            arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
            transliteration: 'Bismi Allāhi al-Raḥmāni al-Raḥīm',
            translation: 'In the name of Allah, the Most Gracious, the Most Merciful.',
            surahNumber: 1,
            ayahNumber: 1,
            surahName: 'Al-Fatiha',
            highlightWords: ['بِسْمِ'],
            note: 'بِـ (with/in) + اسْم (name) = بِسْمِ.',
          },
          {
            arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
            transliteration: 'Al-ḥamdu lillāhi Rabbi al-ʿālamīn',
            translation: 'All praise is [due] to Allah, Lord of the worlds.',
            surahNumber: 1,
            ayahNumber: 2,
            surahName: 'Al-Fatiha',
            highlightWords: ['لِلَّهِ'],
            note: 'لِـ (for/belonging to) + ٱللَّه = لِلَّهِ.',
          },
        ],
        quizQuestions: [
          {
            id: 'c3_l2_q1',
            question: 'What two elements make up the word "بِسْمِ" in the Basmalah?',
            options: [
              'The preposition بِـ (in/with) and the noun اسْم (name)',
              'The pronoun and a verb',
              'A past tense verb',
              'An adjective',
            ],
            correctAnswerIndex: 0,
            explanation:
              'بِـ means "with / in" and اسْم means "name". Together: "In the name of".',
          },
          {
            id: 'c3_l2_q2',
            question: 'In "لِلَّهِ", what meaning does the prefix particle "لِـ" add to "ٱللَّه"?',
            options: ['Belonging to / For Allah', 'From Allah', 'Without Allah', 'And Allah'],
            correctAnswerIndex: 0,
            explanation:
              'لِـ (li-) signifies possession, dedication, and belonging ("for / to").',
          },
        ],
        reviewTakeaways: [
          'بِـ = in / with / by.',
          'لِـ = for / to / belonging to.',
          'Both are one-letter prefixes joining directly to words.',
        ],
        vocabularyToSave: [
          { id: '1:1:1', arabic: 'بِسْمِ', transliteration: 'bis\'mi', english: 'In the name', rootAr: 'س م و', surah: 1, ayah: 1, surahName: 'Al-Fatiha' },
          { id: '1:2:2', arabic: 'لِلَّهِ', transliteration: 'lillahi', english: 'to Allah', surah: 1, ayah: 2, surahName: 'Al-Fatiha' },
          { id: '2:58:17', arabic: 'لَكُمْ', transliteration: 'lakum', english: 'for you', surah: 2, ayah: 58, surahName: 'Al-Baqarah' },
        ],
      },
      {
        id: 'c3_l3_emphasis_inna',
        courseId: 'course_3_particles',
        order: 3,
        title: 'Particles of Certainty: إِنَّ & أَنَّ (Indeed / That)',
        titleAr: 'حروف التوكيد: إنّ وأنّ',
        summary:
          'Learn the emphatic particles that affirm truth, dispel doubt, and establish divine decrees.',
        conceptPoints: [
          'إِنَّ (inna) means "Indeed", "Truly", or "Verily". It begins sentences with powerful affirmation.',
          'أَنَّ (anna) means "that", often connecting belief or knowledge (e.g. "know that..." ٱعْلَمُوا۟ أَنَّ).',
          'Pronouns combine with it seamlessly: إِنَّهُ (Indeed He), إِنَّكَ (Indeed you), إِنَّا (Indeed We), إِنَّهُمْ (Indeed they).',
        ],
        demonstrations: [
          {
            arabic: 'إِنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌ',
            transliteration: 'Inna Allāha ʿalā kulli shayʾin qadīr',
            translation: 'Indeed, Allah is over all things competent.',
            surahNumber: 2,
            ayahNumber: 20,
            surahName: 'Al-Baqarah',
            highlightWords: ['إِنَّ ٱللَّهَ'],
            note: 'إِنَّ affirms the eternal reality of Allah\'s omnipotence.',
          },
          {
            arabic: 'قَالُوٓا۟ إِنَّا مَعَكُمْ إِنَّمَا نَحْنُ مُسْتَهْزِءُونَ',
            transliteration: 'Qālū innā maʿakum innamā naḥnu mustahziʾūn',
            translation: 'They say: "Indeed, we are with you; we were only mocking."',
            surahNumber: 2,
            ayahNumber: 14,
            surahName: 'Al-Baqarah',
            highlightWords: ['إِنَّا'],
            note: 'إِنَّ + نَا = إِنَّا (Indeed we).',
          },
        ],
        quizQuestions: [
          {
            id: 'c3_l3_q1',
            question: 'What is the rhetorical function of "إِنَّ" (inna) in the Quran?',
            options: [
              'To remove doubt and affirm certainty ("Indeed / Truly")',
              'To ask a question',
              'To show negation',
              'To indicate future doubt',
            ],
            correctAnswerIndex: 0,
            explanation:
              'إِنَّ is an emphatic particle (ḥarf tawkīd) reinforcing certainty and divine authority.',
          },
          {
            id: 'c3_l3_q2',
            question: 'What does "إِنَّهُۥ" translate to?',
            options: ['Indeed, He / it', 'Indeed, We', 'Indeed, you all', 'Without him'],
            correctAnswerIndex: 0,
            explanation:
              'إِنَّ (Indeed) + ـهُ (He) = "Indeed, He".',
          },
        ],
        reviewTakeaways: [
          'إِنَّ = Indeed / Truly.',
          'أَنَّ = that.',
          'Frequently paired with attached pronouns: إِنَّهُ, إِنَّا, إِنَّكُمْ.',
        ],
        vocabularyToSave: [
          { id: '2:6:1', arabic: 'إِنَّ', transliteration: 'inna', english: 'Indeed', surah: 2, ayah: 6, surahName: 'Al-Baqarah' },
          { id: '2:37:8', arabic: 'إِنَّهُۥ', transliteration: 'innahu', english: 'Indeed, He', surah: 2, ayah: 37, surahName: 'Al-Baqarah' },
          { id: '2:14:12', arabic: 'إِنَّا', transliteration: 'innā', english: 'Indeed, we', surah: 2, ayah: 14, surahName: 'Al-Baqarah' },
        ],
      },
      {
        id: 'c3_l4_negation_particles',
        courseId: 'course_3_particles',
        order: 4,
        title: 'Quranic Negation: لَا, مَا, لَمْ, لَنْ',
        titleAr: 'أدوات النفي في القرآن',
        summary:
          'Differentiate past, present, and absolute future negation across Quranic statements.',
        conceptPoints: [
          'لَا (lā) is the standard present/general negation: "no" or "not" (e.g. لَا رَيْبَ "no doubt").',
          'مَا (mā) can mean "not" in statements of fact (e.g. وَمَا هُم بِمُؤْمِنِينَ "and they are not believers").',
          'لَمْ (lam) negates the past: "did not" or "has not" (e.g. لَمْ يَلِدْ "He neither begets").',
          'لَنْ (lan) expresses emphatic future negation: "will never" (e.g. لَن تَنَالُوا۟ "You will never attain").',
          'قَدْ (qad) before a past verb signifies completed certainty: "certainly / already".',
        ],
        demonstrations: [
          {
            arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ',
            transliteration: 'Lam yalid walam yūlad',
            translation: 'He neither begets nor is born.',
            surahNumber: 112,
            ayahNumber: 3,
            surahName: 'Al-Ikhlas',
            highlightWords: ['لَمْ يَلِدْ', 'وَلَمْ يُولَدْ'],
            note: 'لَمْ negates past occurrence with absolute perfection.',
          },
          {
            arabic: 'لَن تَنَالُوا۟ ٱلْبِرَّ حَتَّىٰ تُنفِقُوا۟ مِمَّا تُحِبُّونَ',
            transliteration: 'Lan tanālū al-birra ḥattā tunfiqū mimmā tuḥibbūn',
            translation: 'Never will you attain righteousness until you spend from that which you love.',
            surahNumber: 3,
            ayahNumber: 92,
            surahName: 'Ali Imran',
            highlightWords: ['لَن تَنَالُوا۟'],
            note: 'لَنْ firmly negates future possibility until the condition is met.',
          },
        ],
        quizQuestions: [
          {
            id: 'c3_l4_q1',
            question: 'Which negation particle specifically negates future events as "will never"?',
            options: ['لَنْ (lan)', 'لَمْ (lam)', 'مَا (mā)', 'قَدْ (qad)'],
            correctAnswerIndex: 0,
            explanation:
              'لَنْ is the future negative particle meaning "will never".',
          },
          {
            id: 'c3_l4_q2',
            question: 'In Surah Al-Ikhlas (112:3), what does "لَمْ" indicate in "لَمْ يَلِدْ"?',
            options: ['Past negation: "did not / does not"', 'Future promise', 'Command', 'Question'],
            correctAnswerIndex: 0,
            explanation:
              'لَمْ turns the following imperfect verb into a past negation ("He did not beget").',
          },
        ],
        reviewTakeaways: [
          'لَا = no / not (general).',
          'لَمْ = did not (past).',
          'لَنْ = will never (future).',
          'مَا = not / what.',
        ],
        vocabularyToSave: [
          { id: '2:2:3', arabic: 'لَا', transliteration: 'lā', english: 'not', surah: 2, ayah: 2, surahName: 'Al-Baqarah' },
          { id: '2:6:8', arabic: 'لَمْ', transliteration: 'lam', english: 'not', surah: 2, ayah: 6, surahName: 'Al-Baqarah' },
          { id: '3:90:9', arabic: 'لَّن', transliteration: 'lan', english: 'never', surah: 3, ayah: 90, surahName: 'Ali Imran' },
        ],
      },
    ],
  },

  // =========================================================================
  // COURSE 4: Word Roots & Morphology (علم الصرف وجذور الكلمات)
  // =========================================================================
  {
    id: 'course_4_roots',
    level: 'elementary',
    levelLabel: 'Elementary • Level 4',
    order: 4,
    title: 'Word Roots & Morphology',
    titleAr: 'علم الصرف وجذور الكلمات',
    description:
      'Unlock the 3-letter root system (جذر الكلمة), explore the vast families of Rahmah and Ilm, and master plural patterns.',
    icon: 'git-network-outline',
    lessons: [
      {
        id: 'c4_l1_three_letter_root_system',
        courseId: 'course_4_roots',
        order: 1,
        title: 'The 3-Letter Root System (ف - ع - ل)',
        titleAr: 'نظام الجذور الثلاثية',
        summary:
          'Learn the genius of Arabic morphology: how a 3-letter root generates nouns, verbs, and adjectives.',
        conceptPoints: [
          'Nearly all Arabic words trace back to a base 3-letter root that carries a fundamental concept.',
          'For example, the root ك - ت - ب (k-t-b) revolves around writing: كَتَبَ (he wrote), كِتَاب (a book), يَكْتُبُونَ (they write), كُتِبَ (it was prescribed).',
          'Vowels and additional letters (prefixes, infixes, suffixes) modify this root into precise shades of meaning without losing the underlying concept.',
        ],
        demonstrations: [
          {
            arabic: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ',
            transliteration: 'Yā ayyuhā alladhīna āmanū kutiba ʿalaykumu aṣ-ṣiyām',
            translation: 'O you who believe, decreed upon you is fasting.',
            surahNumber: 2,
            ayahNumber: 183,
            surahName: 'Al-Baqarah',
            highlightWords: ['كُتِبَ'],
            note: 'From root ك-ت-ب: كُتِبَ means "it was decreed/written down".',
          },
          {
            arabic: 'فَوَيْلٌۭ لِّلَّذِينَ يَكْتُبُونَ ٱلْكِتَـٰبَ بِأَيْدِيهِمْ',
            transliteration: 'Fawaylun lilladhīna yaktubūna al-kitāba bi-aydīhim',
            translation: 'So woe to those who write the book with their hands.',
            surahNumber: 2,
            ayahNumber: 79,
            surahName: 'Al-Baqarah',
            highlightWords: ['يَكْتُبُونَ', 'ٱلْكِتَـٰبَ'],
            note: 'Both يَكْتُبُونَ (they write) and ٱلْكِتَاب (the book) stem from root ك-ت-ب.',
          },
        ],
        quizQuestions: [
          {
            id: 'c4_l1_q1',
            question: 'What is the core meaning shared by all words from root ك-ت-ب (k-t-b)?',
            options: ['Writing, recording, decreeing', 'Traveling', 'Mercy', 'Praising'],
            correctAnswerIndex: 0,
            explanation:
              'Root ك-ت-ب centers on writing, books, and recording decrees.',
          },
          {
            id: 'c4_l1_q2',
            question: 'In Surah Al-Baqarah 2:183, what does "كُتِبَ عَلَيْكُمُ" mean?',
            arabicSnippet: 'كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ',
            options: [
              'Prescribed / decreed upon you is fasting',
              'You read the book of fasting',
              'They wrote about fasting',
              'Fasting is removed from you',
            ],
            correctAnswerIndex: 0,
            explanation:
              'كُتِبَ (passive verb from k-t-b) means "it is prescribed / written as an obligation".',
          },
        ],
        reviewTakeaways: [
          '3-letter roots are the DNA of the Arabic language.',
          'Recognizing a root allows you to deduce the meaning of unfamiliar words.',
        ],
        vocabularyToSave: [
          { id: '2:79:3', arabic: 'يَكْتُبُونَ', transliteration: 'yaktubūna', english: 'write', rootAr: 'ك ت ب', surah: 2, ayah: 79, surahName: 'Al-Baqarah' },
          { id: '2:183:4', arabic: 'كُتِبَ', transliteration: 'kutiba', english: 'is decreed', rootAr: 'ك ت ب', surah: 2, ayah: 183, surahName: 'Al-Baqarah' },
        ],
      },
      {
        id: 'c4_l2_mercy_knowledge_roots',
        courseId: 'course_4_roots',
        order: 2,
        title: 'Master Roots: ر-ح-م (Mercy) & ع-ل-م (Knowledge)',
        titleAr: 'جذور الرحمة والعلم',
        summary:
          'Deep dive into two of the most magnificent root families in the Quran, appearing over 1,190 times combined.',
        conceptPoints: [
          'Root ر - ح - م (r-ḥ-m) signifies womb-like, enveloping tenderness and grace: ٱلرَّحْمَٰن (all-encompassing mercy), ٱلرَّحِيم (continuous mercy), رَحْمَة (mercy).',
          'Root ع - ل - م (ʿ-l-m) signifies knowledge, awareness, and intellect: عَلِيم (All-Knowing), عَلَّمَ (He taught), يَعْلَمُونَ (they know), ٱلْعَالَمِينَ (the worlds/realms that reveal knowledge of their Maker).',
        ],
        demonstrations: [
          {
            arabic: 'وَرَحْمَتِى وَسِعَتْ كُلَّ شَىْءٍۢ',
            transliteration: 'Wa-raḥmatī wasiʿat kulla shayʾ',
            translation: 'And My mercy encompasses all things.',
            surahNumber: 7,
            ayahNumber: 156,
            surahName: 'Al-A\'raf',
            highlightWords: ['وَرَحْمَتِى'],
            note: 'رَحْمَتِي: My mercy (root ر-ح-م).',
          },
          {
            arabic: 'ٱلرَّحْمَـٰنُ ۝ عَلَّمَ ٱلْقُرْءَانَ ۝ خَلَقَ ٱلْإِنسَـٰنَ ۝ عَلَّمَهُ ٱلْبَيَانَ',
            transliteration: 'Ar-Raḥmānu ʿallama al-Qurʾān',
            translation: 'The Most Gracious taught the Quran; He created man and taught him speech.',
            surahNumber: 55,
            ayahNumber: 1,
            surahName: 'Ar-Rahman',
            highlightWords: ['ٱلرَّحْمَـٰنُ', 'عَلَّمَ', 'عَلَّمَهُ'],
            note: 'Unites both root families: ٱلرَّحْمَٰن (Mercy) with عَلَّمَ (Knowledge).',
          },
        ],
        quizQuestions: [
          {
            id: 'c4_l2_q1',
            question: 'What is the root of the word "ٱلرَّحْمَـٰن"?',
            options: ['ر - ح - م (r-ḥ-m)', 'ر - ح - ل', 'م - ر - ح', 'ح - ك - م'],
            correctAnswerIndex: 0,
            explanation:
              'ٱلرَّحْمَٰن originates from root ر-ح-م, conveying boundless divine grace.',
          },
          {
            id: 'c4_l2_q2',
            question: 'In Surah Ar-Rahman (55:2), what does "عَلَّمَ ٱلْقُرْءَانَ" mean?',
            arabicSnippet: 'عَلَّمَ ٱلْقُرْءَانَ',
            options: ['He taught the Quran', 'He read the Quran', 'He gathered the Quran', 'He preserved the Quran'],
            correctAnswerIndex: 0,
            explanation:
              'عَلَّمَ (form II verb from ʿ-l-m) means "He taught".',
          },
        ],
        reviewTakeaways: [
          'Root ر-ح-م represents the divine atmosphere of Quranic theology.',
          'Root ع-l-m underpins all Quranic epistemological calls to ponder and learn.',
        ],
        vocabularyToSave: [
          { id: '7:156:1', arabic: 'وَرَحْمَتِى', transliteration: 'waraḥmatī', english: 'And My mercy', rootAr: 'ر ح م', surah: 7, ayah: 156, surahName: 'Al-A\'raf' },
          { id: '55:2:1', arabic: 'عَلَّمَ', transliteration: 'ʿallama', english: 'He taught', rootAr: 'ع ل م', surah: 55, ayah: 2, surahName: 'Ar-Rahman' },
          { id: '2:29:12', arabic: 'عَلِيمٌۭ', transliteration: 'ʿalīmun', english: 'All-Knowing', rootAr: 'ع ل م', surah: 2, ayah: 29, surahName: 'Al-Baqarah' },
        ],
      },
      {
        id: 'c4_l3_plurals_and_feminine',
        courseId: 'course_4_roots',
        order: 3,
        title: 'Plurals & Feminine Markers (ـة and ـُونَ / ـِينَ)',
        titleAr: 'جمع المذكر السالم وتاء التأنيث',
        summary:
          'Learn the sound masculine plural endings and the feminine Tā Marbūṭah marker.',
        conceptPoints: [
          'Tā Marbūṭah (ـة / ة) marks nouns as feminine or singular instances (e.g. رَحْمَة "mercy", جَنَّة "garden", صَلَاة "prayer").',
          'Sound Masculine Plural (جمع المذكر السالم) is formed by adding: -ُونَ (-ūn) in the nominative case (e.g. مُؤْمِنُونَ "believers"), and -ِينَ (-īn) in the genitive/accusative case (e.g. مُؤْمِنِينَ).',
        ],
        demonstrations: [
          {
            arabic: 'قَدْ أَفْلَحَ ٱلْمُؤْمِنُونَ',
            transliteration: 'Qad aflaḥa al-muʾminūn',
            translation: 'Certainly will the believers have succeeded.',
            surahNumber: 23,
            ayahNumber: 1,
            surahName: 'Al-Mu\'minun',
            highlightWords: ['ٱلْمُؤْمِنُونَ'],
            note: 'ٱلْمُؤْمِنُونَ has the nominative plural ending -ūn because it is the subject of the verb.',
          },
          {
            arabic: 'وَبَشِّرِ ٱلْمُؤْمِنِينَ',
            transliteration: 'Wa-bashshiri al-muʾminīn',
            translation: 'And give glad tidings to the believers.',
            surahNumber: 2,
            ayahNumber: 223,
            surahName: 'Al-Baqarah',
            highlightWords: ['ٱلْمُؤْمِنِينَ'],
            note: 'ٱلْمُؤْمِنِينَ has the accusative plural ending -īn because it is the object of the verb.',
          },
        ],
        quizQuestions: [
          {
            id: 'c4_l3_q1',
            question: 'What do both "-ūn" (ـُونَ) and "-īn" (ـِينَ) indicate when attached to words like "مُؤْمِن"?',
            options: ['Plural people ("believers")', 'Past tense', 'Feminine singular', 'A question'],
            correctAnswerIndex: 0,
            explanation:
              '-ūn and -īn are the two case variants of the sound masculine plural.',
          },
          {
            id: 'c4_l3_q2',
            question: 'What is the role of Tā Marbūṭah (ـة) in words like "جَنَّة" and "رَحْمَة"?',
            options: ['Feminine marker', 'Plural marker', 'Past tense verb', 'Definite article'],
            correctAnswerIndex: 0,
            explanation:
              'Tā Marbūṭah is the primary grammatical marker of the feminine gender in Arabic nouns.',
          },
        ],
        reviewTakeaways: [
          'ـة = feminine ending.',
          '-ūn / -īn = plural people marker.',
        ],
        vocabularyToSave: [
          { id: '23:1:3', arabic: 'ٱلْمُؤْمِنُونَ', transliteration: 'l-mu\'minūna', english: 'the believers', rootAr: 'ا م ن', surah: 23, ayah: 1, surahName: 'Al-Mu\'minun' },
          { id: '2:223:16', arabic: 'ٱلْمُؤْمِنِينَ', transliteration: 'l-mu\'minīna', english: 'the believers', rootAr: 'ا م ن', surah: 2, ayah: 223, surahName: 'Al-Baqarah' },
          { id: '2:34:13', arabic: 'ٱلْكَـٰفِرِينَ', transliteration: 'l-kāfirīna', english: 'the disbelievers', rootAr: 'ك ف ر', surah: 2, ayah: 34, surahName: 'Al-Baqarah' },
        ],
      },
    ],
  },

  // =========================================================================
  // COURSE 5: Sentence Patterns & Verbs (الجمل والأفعال)
  // =========================================================================
  {
    id: 'course_5_sentences_verbs',
    level: 'intermediate',
    levelLabel: 'Intermediate • Level 5',
    order: 5,
    title: 'Sentence Patterns & Core Verbs',
    titleAr: 'الجمل والأنماط القرآنية',
    description:
      'Understand dialogue verbs (Qāla), the state-of-being verb (Kāna), past/present verb conjugations, and relative clauses.',
    icon: 'chatbubbles-outline',
    lessons: [
      {
        id: 'c5_l1_verb_qala',
        courseId: 'course_5_sentences_verbs',
        order: 1,
        title: 'The Speech Verb: قَالَ / قَالُوا / قُلْ',
        titleAr: 'فعل القول: قال وقالوا وقل',
        summary:
          'Learn the verb of dialogue and divine command, occurring over 1,720 times in the Quran.',
        conceptPoints: [
          'قَالَ (qāla) means "He said" (singular past).',
          'قَالُوا۟ (qālū) means "They said" (plural past).',
          'قُلْ (qul) is the imperative command "Say!" directed to the Prophet ﷺ and believers.',
          'يَقُولُونَ (yaqūlūna) means "they say" (present tense).',
        ],
        demonstrations: [
          {
            arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
            transliteration: 'Qul huwa Allāhu aḥad',
            translation: 'Say: He is Allah, [who is] One.',
            surahNumber: 112,
            ayahNumber: 1,
            surahName: 'Al-Ikhlas',
            highlightWords: ['قُلْ'],
            note: 'قُلْ: Imperative divine command initiating Surah Al-Ikhlas.',
          },
          {
            arabic: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَـٰٓئِكَةِ إِنِّى جَاعِلٌۭ فِى ٱلْأَرْضِ خَلِيفَةًۭ',
            transliteration: 'Wa-idh qāla rabbuka lil-malāʾikati',
            translation: 'And when your Lord said to the angels: Indeed, I am making on earth a successor.',
            surahNumber: 2,
            ayahNumber: 30,
            surahName: 'Al-Baqarah',
            highlightWords: ['قَالَ'],
            note: 'قَالَ: singular past verb introducing the creation dialogue.',
          },
          {
            arabic: 'قَالُوٓا۟ أَتَجْعَلُ فِيهَا مَن يُفْسِدُ فِيهَا',
            transliteration: 'Qālū atajʿalu fīhā man yufsidu fīhā',
            translation: 'They said: Will You place upon it one who causes corruption therein?',
            surahNumber: 2,
            ayahNumber: 30,
            surahName: 'Al-Baqarah',
            highlightWords: ['قَالُوٓا۟'],
            note: 'قَالُوا: plural past verb showing the angels\' inquiry.',
          },
        ],
        quizQuestions: [
          {
            id: 'c5_l1_q1',
            question: 'What is the grammatical difference between "قَالَ" and "قَالُوا۟"?',
            options: [
              'قَالَ is singular ("He said"), while قَالُوا is plural ("They said")',
              'قَالَ is present tense',
              'قَالُوا is a command',
              'قَالَ is feminine',
            ],
            correctAnswerIndex: 0,
            explanation:
              'قَالَ is the 3rd person singular past verb; adding the waw of plurality (ـُوا) makes it "They said".',
          },
          {
            id: 'c5_l1_q2',
            question: 'In Surah Al-Ikhlas (112:1), what does the opening word "قُلْ" signify?',
            options: ['An imperative command: "Say!"', 'They said', 'We said', 'He said'],
            correctAnswerIndex: 0,
            explanation:
              'قُلْ is the command form (amr) meaning "Say!".',
          },
        ],
        reviewTakeaways: [
          'قَالَ = He said.',
          'قَالُوا = They said.',
          'قُلْ = Say!',
          'يَقُولُونَ = They say.',
        ],
        vocabularyToSave: [
          { id: '2:30:2', arabic: 'قَالَ', transliteration: 'qāla', english: 'He said', rootAr: 'ق و ل', surah: 2, ayah: 30, surahName: 'Al-Baqarah' },
          { id: '2:25:19', arabic: 'قَالُوا۟', transliteration: 'qālū', english: 'They said', rootAr: 'ق و ل', surah: 2, ayah: 25, surahName: 'Al-Baqarah' },
          { id: '112:1:1', arabic: 'قُلْ', transliteration: 'qul', english: 'Say', rootAr: 'ق و ل', surah: 112, ayah: 1, surahName: 'Al-Ikhlas' },
        ],
      },
      {
        id: 'c5_l2_verb_kana',
        courseId: 'course_5_sentences_verbs',
        order: 2,
        title: 'The State-of-Being Verb: كَانَ & كَانُوا',
        titleAr: 'كان وأخواتها في القرآن',
        summary:
          'Understand how كَانَ (was/is) expresses ongoing attributes, divine realities, and historical habits.',
        conceptPoints: [
          'كَانَ (kāna) means "was" or "is eternally" when describing divine attributes (e.g. وَكَانَ ٱللَّهُ عَلِيمًا "And Allah is ever All-Knowing").',
          'كَانُوا۟ (kānū) means "they were" or "they used to do" when combined with another verb to express repeated past habits.',
          'Its negative form is often paired with negation: مَا كَانَ (it was not for...).',
        ],
        demonstrations: [
          {
            arabic: 'وَكَانَ ٱللَّهُ عَلِيمًا حَكِيمًۭا',
            transliteration: 'Wa-kāna Allāhu ʿalīman ḥakīmā',
            translation: 'And Allah is ever All-Knowing and Wise.',
            surahNumber: 4,
            ayahNumber: 17,
            surahName: 'An-Nisa',
            highlightWords: ['وَكَانَ ٱللَّهُ'],
            note: 'When applied to Allah, كَانَ signifies timeless, eternal being, not a past state that ended.',
          },
          {
            arabic: 'ذَٰلِكَ بِمَا كَانُوا۟ يَكْفُرُونَ',
            transliteration: 'Dhālika bimā kānū yakfurūn',
            translation: 'That is because they used to disbelieve.',
            surahNumber: 2,
            ayahNumber: 61,
            surahName: 'Al-Baqarah',
            highlightWords: ['كَانُوا۟ يَكْفُرُونَ'],
            note: 'كَانُوا + imperfect verb (yakfurūn) denotes continuous, repetitive past behavior.',
          },
        ],
        quizQuestions: [
          {
            id: 'c5_l2_q1',
            question: 'When "كَانَ ٱللَّهُ" is used with divine attributes, what does it mean?',
            options: [
              'Allah is ever and eternally possessing this attribute',
              'Allah possessed it in the past but no longer does',
              'A future condition',
              'A question',
            ],
            correctAnswerIndex: 0,
            explanation:
              'In Quranic theology, كَانَ with divine attributes expresses eternal, unceasing reality.',
          },
          {
            id: 'c5_l2_q2',
            question: 'What does "كَانُوا۟ يَعْلَمُونَ" express grammatically?',
            options: [
              'Continuous past action: "They used to know"',
              'A command to know',
              'They will never know',
              'We know',
            ],
            correctAnswerIndex: 0,
            explanation:
              'كَانُوا paired with an imperfect verb denotes a habitual continuous past action.',
          },
        ],
        reviewTakeaways: [
          'كَانَ = is eternally / was.',
          'كَانُوا = they used to / were.',
        ],
        vocabularyToSave: [
          { id: '2:75:6', arabic: 'كَانَ', transliteration: 'kāna', english: 'is / was', rootAr: 'ك و ن', surah: 2, ayah: 75, surahName: 'Al-Baqarah' },
          { id: '2:10:11', arabic: 'كَانُوا۟', transliteration: 'kānū', english: 'they used to', rootAr: 'ك و ن', surah: 2, ayah: 10, surahName: 'Al-Baqarah' },
        ],
      },
      {
        id: 'c5_l3_past_subject_suffixes',
        courseId: 'course_5_sentences_verbs',
        order: 3,
        title: 'Past Tense Subject Endings: ـْتُمْ, ـْنَا, ـُوا',
        titleAr: 'ضمائر الرفع المتصلة بالأفعال الماضية',
        summary:
          'Learn the verb suffixes that indicate who performed a past action: you all (-tum), we (-nā), and they (-ū).',
        conceptPoints: [
          'ـْتُمْ (-tum) attached to a past verb means "you all did" (e.g. كُنتُمْ "you were", عَلِمْتُمْ "you knew").',
          'ـْنَا (-nā) attached to a past verb means "we did" (e.g. جَعَلْنَا "we made", أَرْسَلْنَا "we sent"). Frequently used in the divine royal plural.',
          'ـُوا (-ū) attached to a past verb means "they did" (e.g. ءَامَنُوا "they believed", كَفَرُوا "they disbelieved").',
        ],
        demonstrations: [
          {
            arabic: 'وَإِذْ جَعَلْنَا ٱلْبَيْتَ مَثَابَةًۭ لِّلنَّاسِ وَأَمْنًۭا',
            transliteration: 'Wa-idh jaʿalnā al-bayta mathābatan lil-nāsi wa-amnā',
            translation: 'And when We made the House a place of return for the people and a sanctuary.',
            surahNumber: 2,
            ayahNumber: 125,
            surahName: 'Al-Baqarah',
            highlightWords: ['جَعَلْنَا'],
            note: 'جَعَلَ (he made) + ـنَا (We) = We made.',
          },
          {
            arabic: 'وَإِن كُنتُمْ فِى رَيْبٍۢ مِّمَّا نَزَّلْنَا عَلَىٰ عَبْدِنَا',
            transliteration: 'Wa-in kuntum fī raybin mimmā nazzalnā ʿalā ʿabdinā',
            translation: 'And if you are in doubt about what We have revealed upon Our servant.',
            surahNumber: 2,
            ayahNumber: 23,
            surahName: 'Al-Baqarah',
            highlightWords: ['كُنتُمْ', 'نَزَّلْنَا'],
            note: 'Shows both كُنتُمْ (you all were) and نَزَّلْنَا (We revealed).',
          },
        ],
        quizQuestions: [
          {
            id: 'c5_l3_q1',
            question: 'In the Quranic verb "جَعَلْنَا", who performed the action?',
            options: ['We ("We made")', 'They', 'You all', 'He'],
            correctAnswerIndex: 0,
            explanation:
              'The suffix ـنَا (-nā) indicates the first person plural subject ("We").',
          },
          {
            id: 'c5_l3_q2',
            question: 'What does the suffix "ـتُمْ" indicate in "كُنتُمْ"?',
            options: ['You all ("you were")', 'They', 'I', 'She'],
            correctAnswerIndex: 0,
            explanation:
              'ـْتُمْ (-tum) is the subject pronoun for second person masculine plural.',
          },
        ],
        reviewTakeaways: [
          'ـنَا = We (did).',
          'ـْتُمْ = You all (did).',
          'ـُوا = They (did).',
        ],
        vocabularyToSave: [
          { id: '2:23:2', arabic: 'كُنتُمْ', transliteration: 'kuntum', english: 'you are / were', surah: 2, ayah: 23, surahName: 'Al-Baqarah' },
          { id: '5:13:5', arabic: 'جَعَلْنَا', transliteration: 'jaʿalnā', english: 'We made', rootAr: 'ج ع ل', surah: 5, ayah: 13, surahName: 'Al-Ma\'idah' },
          { id: '2:9:1', arabic: 'ءَامَنُوا۟', transliteration: 'āmanū', english: 'they believed', rootAr: 'ا م ن', surah: 2, ayah: 9, surahName: 'Al-Baqarah' },
        ],
      },
      {
        id: 'c5_l4_relative_pronouns',
        courseId: 'course_5_sentences_verbs',
        order: 4,
        title: 'Relative Clauses: ٱلَّذِي / ٱلَّذِينَ / ٱلَّتِي',
        titleAr: 'الأسماء الموصولة: الذي والتي والذين',
        summary:
          'Learn the relative pronouns that introduce rich descriptive clauses: "those who", "the one who", and "that which".',
        conceptPoints: [
          'ٱلَّذِينَ (alladhīna) means "those who", occurring over 810 times to introduce qualities of the righteous, the hypocrites, or disbelievers.',
          'ٱلَّذِي (alladhī) means "the one who / which" (masculine singular).',
          'ٱلَّتِي (allatī) means "that which / who" (feminine singular).',
          'The sentence following a relative pronoun is called "Ṣilat al-Mawṣūl", defining who is spoken of.',
        ],
        demonstrations: [
          {
            arabic: 'ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ',
            transliteration: 'Alladhīna yuʾminūna bil-ghaybi wayuqīmūna aṣ-ṣalāh',
            translation: 'Those who believe in the unseen and establish prayer.',
            surahNumber: 2,
            ayahNumber: 3,
            surahName: 'Al-Baqarah',
            highlightWords: ['ٱلَّذِينَ'],
            note: 'ٱلَّذِينَ describes the core qualities of the God-conscious.',
          },
          {
            arabic: 'ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ',
            transliteration: 'Alladhī khalaqa al-mawta wal-ḥayāta liyabluwakum',
            translation: '[He] who created death and life to test you.',
            surahNumber: 67,
            ayahNumber: 2,
            surahName: 'Al-Mulk',
            highlightWords: ['ٱلَّذِى'],
            note: 'ٱلَّذِي introduces the sublime attribute of the Creator.',
          },
        ],
        quizQuestions: [
          {
            id: 'c5_l4_q1',
            question: 'What does the frequent Quranic relative pronoun "ٱلَّذِينَ" mean?',
            options: ['Those who', 'When', 'Because', 'Where'],
            correctAnswerIndex: 0,
            explanation:
              'ٱلَّذِينَ is the masculine plural relative pronoun meaning "those who".',
          },
          {
            id: 'c5_l4_q2',
            question: 'What is the singular equivalent of "ٱلَّذِينَ" meaning "the one who"?',
            options: ['ٱلَّذِى (alladhī)', 'ٱلَّتِى (allatī)', 'إِنَّ (inna)', 'مَا (mā)'],
            correctAnswerIndex: 0,
            explanation:
              'ٱلَّذِي is the masculine singular form meaning "the one who / which".',
          },
        ],
        reviewTakeaways: [
          'ٱلَّذِينَ = those who (plural).',
          'ٱلَّذِي = the one who (singular masculine).',
          'ٱلَّتِي = that which (singular feminine).',
        ],
        vocabularyToSave: [
          { id: '1:7:2', arabic: 'ٱلَّذِينَ', transliteration: 'alladhīna', english: 'those who', surah: 1, ayah: 7, surahName: 'Al-Fatiha' },
          { id: '2:17:3', arabic: 'ٱلَّذِى', transliteration: 'alladhī', english: 'the One Who', surah: 2, ayah: 17, surahName: 'Al-Baqarah' },
          { id: '2:24:8', arabic: 'ٱلَّتِى', transliteration: 'allatī', english: 'which', surah: 2, ayah: 24, surahName: 'Al-Baqarah' },
        ],
      },
    ],
  },
];

export function getAllCourses(): LearningCourse[] {
  return QURANIC_LEARNING_COURSES;
}

export function getCourseById(courseId: string): LearningCourse | undefined {
  return QURANIC_LEARNING_COURSES.find((c) => c.id === courseId);
}

export function getLessonById(
  courseId: string,
  lessonId: string
): { course: LearningCourse; lesson: LearningCourse['lessons'][0] } | null {
  const course = getCourseById(courseId);
  if (!course) return null;
  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  return { course, lesson };
}
