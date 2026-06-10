export const PhonicsLevel = Object.freeze({
  CVC:              'CVC',
  Blends:           'Blends',
  Digraphs:         'Digraphs',
  VowelPatterns:    'VowelPatterns',
  AdvancedPatterns: 'AdvancedPatterns',
});

export const PhonicsLevelMeta = Object.freeze({
  CVC: {
    label:       'Level 1 — CVC',
    description: 'Consonant-Vowel-Consonant words',
    examples:    ['cat', 'dog', 'sit', 'hop'],
  },
  Blends: {
    label:       'Level 2 — Blends',
    description: 'Consonant blend words',
    examples:    ['flag', 'crop', 'step', 'swim'],
  },
  Digraphs: {
    label:       'Level 3 — Digraphs',
    description: 'Two letters, one sound (ch, sh, th, wh, ph)',
    examples:    ['chat', 'ship', 'that', 'when'],
  },
  VowelPatterns: {
    label:       'Level 4 — Vowel Patterns',
    description: 'Long vowel and vowel-team patterns',
    examples:    ['rain', 'boat', 'feet', 'bike'],
  },
  AdvancedPatterns: {
    label:       'Level 5 — Advanced Patterns',
    description: 'Complex and irregular spelling patterns',
    examples:    ['light', 'caught', 'knight', 'through'],
  },
});

// Ordered progression for UI selectors and clinical sequencing
export const PHONICS_LEVEL_ORDER = [
  PhonicsLevel.CVC,
  PhonicsLevel.Blends,
  PhonicsLevel.Digraphs,
  PhonicsLevel.VowelPatterns,
  PhonicsLevel.AdvancedPatterns,
];
