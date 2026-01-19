import type { LetterSoundItem, PhonemeBlendItem, PhonemeSegmentItem, WordItem, ComprehensionQuestion } from '@/types/intake';

// Slide 2: Letter-Sound items
export const letterSoundItems: LetterSoundItem[] = [
  { id: 'ls_01', prompt: 'Tap the letter that makes the /b/ sound.', targetSound: 'b', options: ['b', 'd', 'p', 'q'], correctAnswer: 'b' },
  { id: 'ls_02', prompt: 'Tap the letter that makes the /d/ sound.', targetSound: 'd', options: ['b', 'd', 'p', 'q'], correctAnswer: 'd' },
  { id: 'ls_03', prompt: 'Tap the letter that makes the /m/ sound.', targetSound: 'm', options: ['m', 'n', 'w', 'u'], correctAnswer: 'm' },
  { id: 'ls_04', prompt: 'Tap the letter that makes the /n/ sound.', targetSound: 'n', options: ['m', 'n', 'h', 'r'], correctAnswer: 'n' },
  { id: 'ls_05', prompt: 'Tap the letter that makes the short /a/ sound.', targetSound: 'a', options: ['a', 'e', 'o', 'u'], correctAnswer: 'a' },
  { id: 'ls_06', prompt: 'Tap the letter that makes the short /e/ sound.', targetSound: 'e', options: ['a', 'e', 'i', 'o'], correctAnswer: 'e' },
];

// Slide 3: Phoneme Blending items
export const phonemeBlendItems: PhonemeBlendItem[] = [
  { id: 'pb_01', prompt: 'Listen to the sounds and pick the word: /c/ - /a/ - /t/', audioId: 'blend_cat', options: ['cat', 'cot', 'cut', 'kit'], correctAnswer: 'cat', distractorType: 'vowel_confusion' },
  { id: 'pb_02', prompt: 'Listen to the sounds and pick the word: /d/ - /o/ - /g/', audioId: 'blend_dog', options: ['dig', 'dog', 'dug', 'bog'], correctAnswer: 'dog', distractorType: 'vowel_confusion' },
  { id: 'pb_03', prompt: 'Listen to the sounds and pick the word: /s/ - /u/ - /n/', audioId: 'blend_sun', options: ['sun', 'sin', 'son', 'run'], correctAnswer: 'sun', distractorType: 'vowel_confusion' },
  { id: 'pb_04', prompt: 'Listen to the sounds and pick the word: /p/ - /i/ - /g/', audioId: 'blend_pig', options: ['peg', 'pig', 'big', 'bag'], correctAnswer: 'pig', distractorType: 'consonant_confusion' },
  { id: 'pb_05', prompt: 'Listen to the sounds and pick the word: /b/ - /e/ - /d/', audioId: 'blend_bed', options: ['bed', 'bad', 'bid', 'bud'], correctAnswer: 'bed', distractorType: 'vowel_confusion' },
  { id: 'pb_06', prompt: 'Listen to the sounds and pick the word: /h/ - /o/ - /p/', audioId: 'blend_hop', options: ['hip', 'hop', 'hap', 'hat'], correctAnswer: 'hop', distractorType: 'vowel_confusion' },
];

// Slide 4: Phoneme Segmentation items
export const phonemeSegmentItems: PhonemeSegmentItem[] = [
  { id: 'ps_01', prompt: 'How many sounds do you hear in "cat"?', audioId: 'seg_cat', correctCount: 3 },
  { id: 'ps_02', prompt: 'How many sounds do you hear in "ship"?', audioId: 'seg_ship', correctCount: 3 },
  { id: 'ps_03', prompt: 'How many sounds do you hear in "stop"?', audioId: 'seg_stop', correctCount: 4 },
  { id: 'ps_04', prompt: 'How many sounds do you hear in "me"?', audioId: 'seg_me', correctCount: 2 },
  { id: 'ps_05', prompt: 'How many sounds do you hear in "splash"?', audioId: 'seg_splash', correctCount: 5 },
  { id: 'ps_06', prompt: 'How many sounds do you hear in "tree"?', audioId: 'seg_tree', correctCount: 3 },
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
  { id: 'rw_01', word: 'jump', audioId: 'word_jump', options: ['jump', 'jamp', 'jomp', 'jumb'], correctSpelling: 'jump' },
  { id: 'rw_02', word: 'friend', audioId: 'word_friend', options: ['frend', 'friend', 'freind', 'frined'], correctSpelling: 'friend' },
  { id: 'rw_03', word: 'school', audioId: 'word_school', options: ['skool', 'shool', 'school', 'scool'], correctSpelling: 'school' },
  { id: 'rw_04', word: 'because', audioId: 'word_because', options: ['becuse', 'because', 'becaus', 'becase'], correctSpelling: 'because' },
  { id: 'rw_05', word: 'through', audioId: 'word_through', options: ['through', 'throu', 'threw', 'thrugh'], correctSpelling: 'through' },
  { id: 'rw_06', word: 'people', audioId: 'word_people', options: ['peple', 'pepole', 'people', 'poeple'], correctSpelling: 'people' },
  { id: 'rw_07', word: 'beautiful', audioId: 'word_beautiful', options: ['beatiful', 'beautiful', 'beutiful', 'beautful'], correctSpelling: 'beautiful' },
  { id: 'rw_08', word: 'different', audioId: 'word_different', options: ['different', 'diffrent', 'diferent', 'diffirent'], correctSpelling: 'different' },
  { id: 'rw_09', word: 'question', audioId: 'word_question', options: ['questoin', 'qestion', 'question', 'queston'], correctSpelling: 'question' },
  { id: 'rw_10', word: 'important', audioId: 'word_important', options: ['importent', 'important', 'importnat', 'improtant'], correctSpelling: 'important' },
];

// Slide 7: Nonword Reading items
export const nonwordItems: WordItem[] = [
  { id: 'nw_01', word: 'blim', audioId: 'nonword_blim', options: ['blim', 'blem', 'blom', 'blum'], correctSpelling: 'blim' },
  { id: 'nw_02', word: 'grop', audioId: 'nonword_grop', options: ['grop', 'grup', 'grep', 'grip'], correctSpelling: 'grop' },
  { id: 'nw_03', word: 'strek', audioId: 'nonword_strek', options: ['strak', 'strik', 'strek', 'struk'], correctSpelling: 'strek' },
  { id: 'nw_04', word: 'flonk', audioId: 'nonword_flonk', options: ['flank', 'flink', 'flonk', 'flunk'], correctSpelling: 'flonk' },
  { id: 'nw_05', word: 'plave', audioId: 'nonword_plave', options: ['plive', 'plave', 'plove', 'pluve'], correctSpelling: 'plave' },
  { id: 'nw_06', word: 'thrumb', audioId: 'nonword_thrumb', options: ['thramb', 'thremb', 'thrimb', 'thrumb'], correctSpelling: 'thrumb' },
  { id: 'nw_07', word: 'spling', audioId: 'nonword_spling', options: ['spling', 'splang', 'splung', 'spleng'], correctSpelling: 'spling' },
  { id: 'nw_08', word: 'dwent', audioId: 'nonword_dwent', options: ['dwant', 'dwint', 'dwent', 'dwont'], correctSpelling: 'dwent' },
];

// Slide 8: Passage for fluency reading
export const fluencyPassage = `The sun was setting behind the old oak tree when Maya finally found the hidden path. She had been searching all afternoon, following the clues her grandmother had left in the dusty journal. The path was narrow, covered with fallen leaves that crunched softly under her feet.

As she walked deeper into the forest, Maya noticed something unusual. Small blue flowers were growing along the edges of the trail, glowing faintly in the dim light. She had never seen anything like them before. Her grandmother's journal mentioned these flowers — they only bloomed once every hundred years.

Maya's heart raced with excitement. She was close now, very close to discovering the secret her grandmother had protected for so many years. The forest grew quieter, as if holding its breath, waiting to see what Maya would do next.`;

// Slide 9: Comprehension Questions
export const comprehensionQuestions: ComprehensionQuestion[] = [
  {
    id: 'cq_01',
    question: 'What was Maya searching for?',
    options: ['A lost pet', 'A hidden path', 'Her grandmother', 'Blue flowers'],
    correctAnswer: 'A hidden path',
    questionType: 'literal',
  },
  {
    id: 'cq_02',
    question: 'Where did Maya find clues about what she was looking for?',
    options: ['In a letter', 'On a map', 'In her grandmother\'s journal', 'From a friend'],
    correctAnswer: 'In her grandmother\'s journal',
    questionType: 'literal',
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
  },
  {
    id: 'cq_04',
    question: 'How do you think Maya felt when she saw the flowers?',
    options: ['Scared', 'Bored', 'Excited and hopeful', 'Angry'],
    correctAnswer: 'Excited and hopeful',
    questionType: 'inferential',
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
