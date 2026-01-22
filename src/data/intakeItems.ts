import type { LetterSoundItem, PhonemeBlendItem, PhonemeSegmentItem, WordItem, ComprehensionQuestion } from '@/types/intake';

// Slide 2: Letter-Sound items
export const letterSoundItems: LetterSoundItem[] = [
  { id: 'ls_01', prompt: 'Tap the letter that makes the /b/ sound.', targetSound: 'b', options: ['b', 'd', 'p', 'q'], correctAnswer: 'b', difficulty: 1 },
  { id: 'ls_02', prompt: 'Tap the letter that makes the /d/ sound.', targetSound: 'd', options: ['b', 'd', 'p', 'q'], correctAnswer: 'd', difficulty: 1 },
  { id: 'ls_03', prompt: 'Tap the letter that makes the /m/ sound.', targetSound: 'm', options: ['m', 'n', 'w', 'u'], correctAnswer: 'm', difficulty: 1 },
  { id: 'ls_04', prompt: 'Tap the letter that makes the /n/ sound.', targetSound: 'n', options: ['m', 'n', 'h', 'r'], correctAnswer: 'n', difficulty: 2 },
  { id: 'ls_05', prompt: 'Tap the letter that makes the short /a/ sound.', targetSound: 'a', options: ['a', 'e', 'o', 'u'], correctAnswer: 'a', difficulty: 2 },
  { id: 'ls_06', prompt: 'Tap the letter that makes the short /e/ sound.', targetSound: 'e', options: ['a', 'e', 'i', 'o'], correctAnswer: 'e', difficulty: 2 },
];

// Slide 3: Phoneme Blending items - with audioText for TTS
export const phonemeBlendItems: PhonemeBlendItem[] = [
  { id: 'pb_01', prompt: 'Listen to the sounds and pick the word', audioText: 'c... a... t', options: ['cat', 'cot', 'cut', 'kit'], correctAnswer: 'cat', distractorType: 'vowel_confusion', difficulty: 1 },
  { id: 'pb_02', prompt: 'Listen to the sounds and pick the word', audioText: 'd... o... g', options: ['dig', 'dog', 'dug', 'bog'], correctAnswer: 'dog', distractorType: 'vowel_confusion', difficulty: 1 },
  { id: 'pb_03', prompt: 'Listen to the sounds and pick the word', audioText: 's... u... n', options: ['sun', 'sin', 'son', 'run'], correctAnswer: 'sun', distractorType: 'vowel_confusion', difficulty: 2 },
  { id: 'pb_04', prompt: 'Listen to the sounds and pick the word', audioText: 'p... i... g', options: ['peg', 'pig', 'big', 'bag'], correctAnswer: 'pig', distractorType: 'consonant_confusion', difficulty: 2 },
  { id: 'pb_05', prompt: 'Listen to the sounds and pick the word', audioText: 'b... e... d', options: ['bed', 'bad', 'bid', 'bud'], correctAnswer: 'bed', distractorType: 'vowel_confusion', difficulty: 2 },
  { id: 'pb_06', prompt: 'Listen to the sounds and pick the word', audioText: 'h... o... p', options: ['hip', 'hop', 'hap', 'hat'], correctAnswer: 'hop', distractorType: 'vowel_confusion', difficulty: 3 },
];

// Slide 4: Phoneme Segmentation items - with word for TTS
export const phonemeSegmentItems: PhonemeSegmentItem[] = [
  { id: 'ps_01', prompt: 'How many sounds do you hear in this word?', word: 'cat', correctCount: 3, difficulty: 1 },
  { id: 'ps_02', prompt: 'How many sounds do you hear in this word?', word: 'ship', correctCount: 3, difficulty: 2 },
  { id: 'ps_03', prompt: 'How many sounds do you hear in this word?', word: 'stop', correctCount: 4, difficulty: 2 },
  { id: 'ps_04', prompt: 'How many sounds do you hear in this word?', word: 'me', correctCount: 2, difficulty: 1 },
  { id: 'ps_05', prompt: 'How many sounds do you hear in this word?', word: 'splash', correctCount: 5, difficulty: 3 },
  { id: 'ps_06', prompt: 'How many sounds do you hear in this word?', word: 'tree', correctCount: 3, difficulty: 2 },
];

// Slide 5: RAN Grid items (4x5 = 20 items)
export const ranGridItems = [
  '3', '7', '2', '9', '4',
  '1', '5', '8', '6', '3',
  '9', '2', '7', '4', '1',
  '6', '8', '5', '3', '7',
];

// Slide 6: Real Word Reading items
export const realWordItems: WordItem[] = [
  { id: 'rw_01', word: 'jump', options: ['jump', 'jamp', 'jomp', 'jumb'], correctSpelling: 'jump', difficulty: 1 },
  { id: 'rw_02', word: 'friend', options: ['frend', 'friend', 'freind', 'frined'], correctSpelling: 'friend', difficulty: 2 },
  { id: 'rw_03', word: 'school', options: ['skool', 'shool', 'school', 'scool'], correctSpelling: 'school', difficulty: 2 },
  { id: 'rw_04', word: 'because', options: ['becuse', 'because', 'becaus', 'becase'], correctSpelling: 'because', difficulty: 3 },
  { id: 'rw_05', word: 'through', options: ['through', 'throu', 'threw', 'thrugh'], correctSpelling: 'through', difficulty: 3 },
  { id: 'rw_06', word: 'people', options: ['peple', 'pepole', 'people', 'poeple'], correctSpelling: 'people', difficulty: 2 },
  { id: 'rw_07', word: 'beautiful', options: ['beatiful', 'beautiful', 'beutiful', 'beautful'], correctSpelling: 'beautiful', difficulty: 4 },
  { id: 'rw_08', word: 'different', options: ['different', 'diffrent', 'diferent', 'diffirent'], correctSpelling: 'different', difficulty: 3 },
  { id: 'rw_09', word: 'question', options: ['questoin', 'qestion', 'question', 'queston'], correctSpelling: 'question', difficulty: 3 },
  { id: 'rw_10', word: 'important', options: ['importent', 'important', 'importnat', 'improtant'], correctSpelling: 'important', difficulty: 4 },
];

// Slide 7: Nonword Reading items
export const nonwordItems: WordItem[] = [
  { id: 'nw_01', word: 'blim', options: ['blim', 'blem', 'blom', 'blum'], correctSpelling: 'blim', difficulty: 1 },
  { id: 'nw_02', word: 'grop', options: ['grop', 'grup', 'grep', 'grip'], correctSpelling: 'grop', difficulty: 2 },
  { id: 'nw_03', word: 'strek', options: ['strak', 'strik', 'strek', 'struk'], correctSpelling: 'strek', difficulty: 2 },
  { id: 'nw_04', word: 'flonk', options: ['flank', 'flink', 'flonk', 'flunk'], correctSpelling: 'flonk', difficulty: 2 },
  { id: 'nw_05', word: 'plave', options: ['plive', 'plave', 'plove', 'pluve'], correctSpelling: 'plave', difficulty: 3 },
  { id: 'nw_06', word: 'thrumb', options: ['thramb', 'thremb', 'thrimb', 'thrumb'], correctSpelling: 'thrumb', difficulty: 3 },
  { id: 'nw_07', word: 'spling', options: ['spling', 'splang', 'splung', 'spleng'], correctSpelling: 'spling', difficulty: 3 },
  { id: 'nw_08', word: 'dwent', options: ['dwant', 'dwint', 'dwent', 'dwont'], correctSpelling: 'dwent', difficulty: 3 },
];

// Slide 8: Passage for fluency reading
export const fluencyPassage = `The sun was setting behind the old oak tree when Maya finally found the hidden path. She had been searching all afternoon, following the clues her grandmother had left in the dusty journal. The path was narrow, covered with fallen leaves that crunched softly under her feet.

As she walked deeper into the forest, Maya noticed something unusual. Small blue flowers were growing along the edges of the trail, glowing faintly in the dim light. She had never seen anything like them before. Her grandmother's journal mentioned these flowers — they only bloomed once every hundred years.

Maya's heart raced with excitement. She was close now, very close to discovering the secret her grandmother had protected for so many years. The forest grew quieter, as if holding its breath, waiting to see what Maya would do next.`;

// Word count for fluency calculation
export const fluencyPassageWordCount = fluencyPassage.split(/\s+/).length;

// Slide 9: Comprehension Questions
export const comprehensionQuestions: ComprehensionQuestion[] = [
  {
    id: 'cq_01',
    question: 'What was Maya searching for?',
    options: ['A lost pet', 'A hidden path', 'Her grandmother', 'Blue flowers'],
    correctAnswer: 'A hidden path',
    questionType: 'literal',
    difficulty: 1,
  },
  {
    id: 'cq_02',
    question: 'Where did Maya find clues about what she was looking for?',
    options: ['In a letter', 'On a map', 'In her grandmother\'s journal', 'From a friend'],
    correctAnswer: 'In her grandmother\'s journal',
    questionType: 'literal',
    difficulty: 2,
  },
  {
    id: 'cq_03',
    question: 'Why do you think the blue flowers were special?',
    options: [
      'They were very expensive',
      'They only bloomed once every hundred years',
      'Maya\'s grandmother planted them',
      'They could grant wishes'
    ],
    correctAnswer: 'They only bloomed once every hundred years',
    questionType: 'inferential',
    difficulty: 3,
  },
  {
    id: 'cq_04',
    question: 'How do you think Maya felt when she saw the flowers?',
    options: ['Scared', 'Bored', 'Excited and hopeful', 'Angry'],
    correctAnswer: 'Excited and hopeful',
    questionType: 'inferential',
    difficulty: 2,
  },
  {
    id: 'cq_05',
    question: 'What does "holding its breath" mean in this story?',
    options: [
      'The trees stopped making oxygen',
      'It became very quiet and still',
      'There was no wind',
      'Maya stopped breathing'
    ],
    correctAnswer: 'It became very quiet and still',
    questionType: 'vocab_in_context',
    difficulty: 3,
  },
];

// Self-report options
export const selfReportOptions = [
  'Mixing up letters',
  'Sounding out new words',
  'Reading speed',
  'Remembering what was read',
  'Reading aloud anxiety',
];
