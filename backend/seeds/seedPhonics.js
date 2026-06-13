/**
 * seedPhonics.js
 *
 * Populates the PhonicsContent collection with content for all 5 phonics levels
 * across all 4 game types.  Safe to rerun — drops existing PhonicsContent docs first.
 *
 * Usage:
 *   node --experimental-vm-modules backend/seeds/seedPhonics.js
 * or with dotenv:
 *   MONGO_URI=mongodb+srv://... node backend/seeds/seedPhonics.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhonicsContent from '../models/PhonicsContent.js';

dotenv.config();

const SEED = [
  // ══════════════════════════════════════════════════════════════════════
  // LETTER BRIDGE — 2D column arrays + validWords
  // ══════════════════════════════════════════════════════════════════════

  // Level 1: CVC
  {
    level: 'CVC', gameType: 'letter_bridge', difficulty: 'easy',
    letters: [['h','s','l','b'], ['a','i','o'], ['t','x']],
    validWords: ['bat','bit','box','hat','hit','hot','lit','lot','sat','sit','six'],
  },
  {
    level: 'CVC', gameType: 'letter_bridge', difficulty: 'easy',
    letters: [['c','r','p'], ['a','e','o'], ['t','n','d']],
    validWords: ['cad','can','cat','cod','con','cot','pad','pan','pat','pen','pet','pod','pot','ran','rat','red','rod','rot'],
  },
  {
    level: 'CVC', gameType: 'letter_bridge', difficulty: 'medium',
    letters: [['d','f','m'], ['a','i','o'], ['t','g','p']],
    validWords: ['dig','dip','dog','dot','fat','fig','fit','fog','mag','map','mat','mop'],
  },
  {
    level: 'CVC', gameType: 'letter_bridge', difficulty: 'medium',
    letters: [['g','h','j'], ['a','e','o'], ['r','t','p']],
    validWords: ['gap','get','got','hat','her','hop','hot','jar','jet','jot'],
  },
  {
    level: 'CVC', gameType: 'letter_bridge', difficulty: 'hard',
    letters: [['b','n','t'], ['u','a','e'], ['g','n','b']],
    validWords: ['bag','ban','beg','bug','bun','nag','nun','tab','tag','tan','ten','tub','tug'],
  },

  // Level 2: Blends
  {
    level: 'Blends', gameType: 'letter_bridge', difficulty: 'easy',
    letters: [['fl','cl','sl'], ['a','o','e'], ['g','p','d']],
    validWords: ['clad','clap','clod','clog','flag','flap','fled','flop','slap','sled','slop'],
  },
  {
    level: 'Blends', gameType: 'letter_bridge', difficulty: 'medium',
    letters: [['st','sw','sn'], ['a','i','e'], ['p','m','g']],
    validWords: ['snag','snap','snip','stag','stem','step','swam','swap','swig','swim'],
  },
  {
    level: 'Blends', gameType: 'letter_bridge', difficulty: 'hard',
    letters: [['bl','br','dr'], ['a','e','i'], ['g','d','p']],
    validWords: ['bled','blip','brad','brag','bred','brig','drag','drip'],
  },

  // Level 3: Digraphs
  {
    level: 'Digraphs', gameType: 'letter_bridge', difficulty: 'easy',
    letters: [['ch','sh','th'], ['a','i','o'], ['t','p','n']],
    validWords: ['chat','chin','chip','chop','shin','ship','shop','shot','than','that','thin'],
  },
  {
    level: 'Digraphs', gameType: 'letter_bridge', difficulty: 'medium',
    letters: [['ch','sh','wh'], ['e','i','a'], ['n','p','t']],
    validWords: ['chap','chat','chin','chip','shin','ship','what','when','whip'],
  },

  // Level 4: Vowel Patterns
  {
    level: 'VowelPatterns', gameType: 'letter_bridge', difficulty: 'medium',
    letters: [['r','b','s'], ['ai','oa','ea'], ['n','t','d']],
    validWords: ['bait','bead','bean','beat','boat','raid','rain','read','road','said','seat'],
  },

  // Level 5: Advanced Patterns
  {
    level: 'AdvancedPatterns', gameType: 'letter_bridge', difficulty: 'hard',
    letters: [['l','n','t'], ['igh','ough','augh'], ['t','ter','']],
    validWords: ['laugh','laughter','light','lighter','naught','night','nought','taught','tight','tighter','tough'],
  },

  // ══════════════════════════════════════════════════════════════════════
  // WORD PUZZLE — word, hint, image
  // ══════════════════════════════════════════════════════════════════════

  // Level 1: CVC
  { level: 'CVC', gameType: 'word_puzzle', difficulty: 'easy', word: 'cat',  hint: 'A furry pet that purrs',         image: '' },
  { level: 'CVC', gameType: 'word_puzzle', difficulty: 'easy', word: 'dog',  hint: 'A loyal four-legged friend',     image: '' },
  { level: 'CVC', gameType: 'word_puzzle', difficulty: 'easy', word: 'sit',  hint: 'You do this on a chair',         image: '' },
  { level: 'CVC', gameType: 'word_puzzle', difficulty: 'easy', word: 'hop',  hint: 'Rabbits move like this',         image: '' },
  { level: 'CVC', gameType: 'word_puzzle', difficulty: 'easy', word: 'run',  hint: 'Move fast on your feet',         image: '' },
  { level: 'CVC', gameType: 'word_puzzle', difficulty: 'easy', word: 'big',  hint: 'Very large in size',             image: '' },
  { level: 'CVC', gameType: 'word_puzzle', difficulty: 'easy', word: 'sun',  hint: 'Bright star in the sky',         image: '' },
  { level: 'CVC', gameType: 'word_puzzle', difficulty: 'medium', word: 'frog', hint: 'Green animal by the pond',     image: '' },
  { level: 'CVC', gameType: 'word_puzzle', difficulty: 'medium', word: 'drum', hint: 'You hit it to make music',     image: '' },

  // Level 2: Blends
  { level: 'Blends', gameType: 'word_puzzle', difficulty: 'easy',   word: 'flag',  hint: 'Flies on a pole',              image: '' },
  { level: 'Blends', gameType: 'word_puzzle', difficulty: 'easy',   word: 'step',  hint: 'One stair going up',            image: '' },
  { level: 'Blends', gameType: 'word_puzzle', difficulty: 'easy',   word: 'crop',  hint: 'Farmers grow this',             image: '' },
  { level: 'Blends', gameType: 'word_puzzle', difficulty: 'easy',   word: 'swim',  hint: 'Move through water',            image: '' },
  { level: 'Blends', gameType: 'word_puzzle', difficulty: 'medium', word: 'blast', hint: 'A sudden loud explosion',       image: '' },
  { level: 'Blends', gameType: 'word_puzzle', difficulty: 'medium', word: 'crust', hint: 'The hard outside of bread',     image: '' },
  { level: 'Blends', gameType: 'word_puzzle', difficulty: 'medium', word: 'swift', hint: 'Very fast and quick',           image: '' },

  // Level 3: Digraphs
  { level: 'Digraphs', gameType: 'word_puzzle', difficulty: 'easy',   word: 'chat',  hint: 'Talk in a friendly way',       image: '' },
  { level: 'Digraphs', gameType: 'word_puzzle', difficulty: 'easy',   word: 'ship',  hint: 'Large boat that sails oceans', image: '' },
  { level: 'Digraphs', gameType: 'word_puzzle', difficulty: 'easy',   word: 'chin',  hint: 'The bottom part of your face', image: '' },
  { level: 'Digraphs', gameType: 'word_puzzle', difficulty: 'easy',   word: 'when',  hint: 'Asks about the time',          image: '' },
  { level: 'Digraphs', gameType: 'word_puzzle', difficulty: 'medium', word: 'photo', hint: 'A picture taken by a camera',  image: '' },
  { level: 'Digraphs', gameType: 'word_puzzle', difficulty: 'medium', word: 'thick', hint: 'Not thin; wide',               image: '' },
  { level: 'Digraphs', gameType: 'word_puzzle', difficulty: 'hard',   word: 'thread',hint: 'String used for sewing',       image: '' },

  // Level 4: Vowel Patterns
  { level: 'VowelPatterns', gameType: 'word_puzzle', difficulty: 'easy',   word: 'rain',  hint: 'Water that falls from clouds',   image: '' },
  { level: 'VowelPatterns', gameType: 'word_puzzle', difficulty: 'easy',   word: 'boat',  hint: 'Floats on water',                image: '' },
  { level: 'VowelPatterns', gameType: 'word_puzzle', difficulty: 'easy',   word: 'feet',  hint: 'Walk on these every day',        image: '' },
  { level: 'VowelPatterns', gameType: 'word_puzzle', difficulty: 'easy',   word: 'bike',  hint: 'Two wheels, you pedal it',       image: '' },
  { level: 'VowelPatterns', gameType: 'word_puzzle', difficulty: 'medium', word: 'dream', hint: 'Happens in your sleep',          image: '' },
  { level: 'VowelPatterns', gameType: 'word_puzzle', difficulty: 'medium', word: 'stone', hint: 'Hard rock on the ground',        image: '' },
  { level: 'VowelPatterns', gameType: 'word_puzzle', difficulty: 'hard',   word: 'strain',hint: 'Pull or stretch too hard',       image: '' },

  // Level 5: Advanced Patterns
  { level: 'AdvancedPatterns', gameType: 'word_puzzle', difficulty: 'medium', word: 'light',   hint: 'Opposite of dark',              image: '' },
  { level: 'AdvancedPatterns', gameType: 'word_puzzle', difficulty: 'medium', word: 'caught',  hint: 'Past tense of catch',           image: '' },
  { level: 'AdvancedPatterns', gameType: 'word_puzzle', difficulty: 'hard',   word: 'knight',  hint: 'Armoured warrior on horseback', image: '' },
  { level: 'AdvancedPatterns', gameType: 'word_puzzle', difficulty: 'hard',   word: 'through', hint: 'From one side to the other',    image: '' },
  { level: 'AdvancedPatterns', gameType: 'word_puzzle', difficulty: 'hard',   word: 'wrench',  hint: 'A tool for turning bolts',      image: '' },

  // ══════════════════════════════════════════════════════════════════════
  // SYLLABLE TAP — word, syllables count, split array
  // ══════════════════════════════════════════════════════════════════════

  // Level 1: CVC (all 1 syllable)
  { level: 'CVC', gameType: 'syllable_tap', difficulty: 'easy',   word: 'cat',       syllables: 1, split: ['cat']          },
  { level: 'CVC', gameType: 'syllable_tap', difficulty: 'easy',   word: 'dog',       syllables: 1, split: ['dog']          },
  { level: 'CVC', gameType: 'syllable_tap', difficulty: 'easy',   word: 'bed',       syllables: 1, split: ['bed']          },
  { level: 'CVC', gameType: 'syllable_tap', difficulty: 'easy',   word: 'cup',       syllables: 1, split: ['cup']          },
  { level: 'CVC', gameType: 'syllable_tap', difficulty: 'easy',   word: 'hat',       syllables: 1, split: ['hat']          },
  { level: 'CVC', gameType: 'syllable_tap', difficulty: 'medium', word: 'rabbit',    syllables: 2, split: ['rab','bit']     },
  { level: 'CVC', gameType: 'syllable_tap', difficulty: 'medium', word: 'button',    syllables: 2, split: ['but','ton']     },

  // Level 2: Blends
  { level: 'Blends', gameType: 'syllable_tap', difficulty: 'easy',   word: 'flag',      syllables: 1, split: ['flag']         },
  { level: 'Blends', gameType: 'syllable_tap', difficulty: 'easy',   word: 'stamp',     syllables: 1, split: ['stamp']        },
  { level: 'Blends', gameType: 'syllable_tap', difficulty: 'easy',   word: 'clap',      syllables: 1, split: ['clap']         },
  { level: 'Blends', gameType: 'syllable_tap', difficulty: 'medium', word: 'blanket',   syllables: 2, split: ['blan','ket']   },
  { level: 'Blends', gameType: 'syllable_tap', difficulty: 'medium', word: 'plastic',   syllables: 2, split: ['plas','tic']   },
  { level: 'Blends', gameType: 'syllable_tap', difficulty: 'hard',   word: 'breakfast', syllables: 2, split: ['break','fast'] },

  // Level 3: Digraphs
  { level: 'Digraphs', gameType: 'syllable_tap', difficulty: 'easy',   word: 'ship',      syllables: 1, split: ['ship']           },
  { level: 'Digraphs', gameType: 'syllable_tap', difficulty: 'easy',   word: 'chat',      syllables: 1, split: ['chat']           },
  { level: 'Digraphs', gameType: 'syllable_tap', difficulty: 'medium', word: 'channel',   syllables: 2, split: ['chan','nel']      },
  { level: 'Digraphs', gameType: 'syllable_tap', difficulty: 'medium', word: 'chapter',   syllables: 2, split: ['chap','ter']     },
  { level: 'Digraphs', gameType: 'syllable_tap', difficulty: 'hard',   word: 'photograph',syllables: 3, split: ['pho','to','graph']},

  // Level 4: Vowel Patterns
  { level: 'VowelPatterns', gameType: 'syllable_tap', difficulty: 'easy',   word: 'rain',     syllables: 1, split: ['rain']           },
  { level: 'VowelPatterns', gameType: 'syllable_tap', difficulty: 'medium', word: 'rainy',    syllables: 2, split: ['rain','y']        },
  { level: 'VowelPatterns', gameType: 'syllable_tap', difficulty: 'medium', word: 'boating',  syllables: 2, split: ['boat','ing']      },
  { level: 'VowelPatterns', gameType: 'syllable_tap', difficulty: 'hard',   word: 'steamboat',syllables: 2, split: ['steam','boat']    },

  // Level 5: Advanced Patterns
  { level: 'AdvancedPatterns', gameType: 'syllable_tap', difficulty: 'medium', word: 'frightened',  syllables: 2, split: ['fright','ened']    },
  { level: 'AdvancedPatterns', gameType: 'syllable_tap', difficulty: 'hard',   word: 'thoroughly',  syllables: 3, split: ['thor','ough','ly']  },
  { level: 'AdvancedPatterns', gameType: 'syllable_tap', difficulty: 'hard',   word: 'knighthood',  syllables: 2, split: ['knight','hood']     },

  // ══════════════════════════════════════════════════════════════════════
  // MIRROR WORDS — b/d/p/q reversal multiple-choice questions
  // ══════════════════════════════════════════════════════════════════════

  // Level 1: CVC
  {
    level: 'CVC', gameType: 'mirror_words', difficulty: 'easy',
    question: 'Which word says "bad"?',
    options: ['bad','dad','gad','pad'],
    correct: 'bad',
  },
  {
    level: 'CVC', gameType: 'mirror_words', difficulty: 'easy',
    question: 'Which word says "dog"?',
    options: ['bog','dog','pog','qog'],
    correct: 'dog',
  },
  {
    level: 'CVC', gameType: 'mirror_words', difficulty: 'easy',
    question: 'Which word says "bed"?',
    options: ['ded','bed','ped','peb'],
    correct: 'bed',
  },
  {
    level: 'CVC', gameType: 'mirror_words', difficulty: 'easy',
    question: 'Which word says "dip"?',
    options: ['bip','dip','pip','qip'],
    correct: 'dip',
  },
  {
    level: 'CVC', gameType: 'mirror_words', difficulty: 'medium',
    question: 'Which word says "pub"?',
    options: ['dub','bup','pub','qub'],
    correct: 'pub',
  },

  // Level 2: Blends
  {
    level: 'Blends', gameType: 'mirror_words', difficulty: 'easy',
    question: 'Which word says "drip"?',
    options: ['drip','brip','prip','grip'],
    correct: 'drip',
  },
  {
    level: 'Blends', gameType: 'mirror_words', difficulty: 'medium',
    question: 'Which word says "bread"?',
    options: ['dread','preat','bread','grean'],
    correct: 'bread',
  },

  // Level 3: Digraphs
  {
    level: 'Digraphs', gameType: 'mirror_words', difficulty: 'easy',
    question: 'Which word says "ship"?',
    options: ['ship','dhip','bhip','chap'],
    correct: 'ship',
  },
  {
    level: 'Digraphs', gameType: 'mirror_words', difficulty: 'medium',
    question: 'Which word says "chip"?',
    options: ['dhip','phip','chip','bhip'],
    correct: 'chip',
  },

  // Level 4: Vowel Patterns
  {
    level: 'VowelPatterns', gameType: 'mirror_words', difficulty: 'medium',
    question: 'Which word says "paid"?',
    options: ['baid','paid','qaid','daid'],
    correct: 'paid',
  },
  {
    level: 'VowelPatterns', gameType: 'mirror_words', difficulty: 'medium',
    question: 'Which word says "boat"?',
    options: ['doat','poat','boat','qoat'],
    correct: 'boat',
  },

  // Level 5: Advanced Patterns
  {
    level: 'AdvancedPatterns', gameType: 'mirror_words', difficulty: 'hard',
    question: 'Which word says "bought"?',
    options: ['dought','pought','bought','qought'],
    correct: 'bought',
  },
  {
    level: 'AdvancedPatterns', gameType: 'mirror_words', difficulty: 'hard',
    question: 'Which word says "knight"?',
    options: ['dniqht','knight','pnight','bniqht'],
    correct: 'knight',
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHONEME TAP — word + phonemeCount (syllables field) + phonemes (split field)
  // Child hears the word, taps once per sound.
  // CVC words = 3 phonemes; blends = 4; digraphs = 3 (digraph is 1 sound).
  // ══════════════════════════════════════════════════════════════════════

  // Level 1: CVC (3 phonemes each)
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'cat',  syllables: 3, split: ['k','a','t']   },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'dog',  syllables: 3, split: ['d','o','g']   },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'sit',  syllables: 3, split: ['s','i','t']   },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'hop',  syllables: 3, split: ['h','o','p']   },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'run',  syllables: 3, split: ['r','u','n']   },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'big',  syllables: 3, split: ['b','i','g']   },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'sun',  syllables: 3, split: ['s','u','n']   },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'map',  syllables: 3, split: ['m','a','p']   },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'pin',  syllables: 3, split: ['p','i','n']   },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'medium', word: 'frog', syllables: 4, split: ['f','r','o','g'] },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'medium', word: 'drum', syllables: 4, split: ['d','r','u','m'] },
  { level: 'CVC', gameType: 'phoneme_tap', difficulty: 'medium', word: 'slip', syllables: 4, split: ['s','l','i','p'] },

  // Level 2: Blends (4 phonemes)
  { level: 'Blends', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'flag', syllables: 4, split: ['f','l','a','g']  },
  { level: 'Blends', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'step', syllables: 4, split: ['s','t','e','p']  },
  { level: 'Blends', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'clap', syllables: 4, split: ['k','l','a','p']  },
  { level: 'Blends', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'drip', syllables: 4, split: ['d','r','i','p']  },
  { level: 'Blends', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'swim', syllables: 4, split: ['s','w','i','m']  },
  { level: 'Blends', gameType: 'phoneme_tap', difficulty: 'medium', word: 'blast',syllables: 5, split: ['b','l','a','s','t'] },
  { level: 'Blends', gameType: 'phoneme_tap', difficulty: 'medium', word: 'crust',syllables: 5, split: ['k','r','u','s','t'] },

  // Level 3: Digraphs — digraph = 1 phoneme → 3 total for CVC-shaped words
  { level: 'Digraphs', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'chat', syllables: 3, split: ['ch','a','t']  },
  { level: 'Digraphs', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'ship', syllables: 3, split: ['sh','i','p']  },
  { level: 'Digraphs', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'thin', syllables: 3, split: ['th','i','n']  },
  { level: 'Digraphs', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'when', syllables: 3, split: ['wh','e','n']  },
  { level: 'Digraphs', gameType: 'phoneme_tap', difficulty: 'medium', word: 'chip', syllables: 3, split: ['ch','i','p']  },
  { level: 'Digraphs', gameType: 'phoneme_tap', difficulty: 'medium', word: 'shop', syllables: 3, split: ['sh','o','p']  },

  // Level 4: Vowel Patterns (vowel team = 1 phoneme)
  { level: 'VowelPatterns', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'rain',  syllables: 3, split: ['r','ai','n']   },
  { level: 'VowelPatterns', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'boat',  syllables: 3, split: ['b','oa','t']   },
  { level: 'VowelPatterns', gameType: 'phoneme_tap', difficulty: 'easy',   word: 'feet',  syllables: 3, split: ['f','ee','t']   },
  { level: 'VowelPatterns', gameType: 'phoneme_tap', difficulty: 'medium', word: 'dream', syllables: 4, split: ['d','r','ea','m'] },
  { level: 'VowelPatterns', gameType: 'phoneme_tap', difficulty: 'medium', word: 'train', syllables: 4, split: ['t','r','ai','n'] },

  // Level 5: Advanced (complex spelling = 1 phoneme)
  { level: 'AdvancedPatterns', gameType: 'phoneme_tap', difficulty: 'medium', word: 'light',  syllables: 3, split: ['l','igh','t']  },
  { level: 'AdvancedPatterns', gameType: 'phoneme_tap', difficulty: 'medium', word: 'caught', syllables: 3, split: ['k','augh','t'] },
  { level: 'AdvancedPatterns', gameType: 'phoneme_tap', difficulty: 'hard',   word: 'knight', syllables: 3, split: ['n','igh','t']  },
  { level: 'AdvancedPatterns', gameType: 'phoneme_tap', difficulty: 'hard',   word: 'gnome',  syllables: 3, split: ['n','o','m']   },

  // ══════════════════════════════════════════════════════════════════════
  // LETTER SOUND — letter/digraph shown; child picks the matching word.
  // question = letter or digraph; options = 4 words; correct = matching word.
  // ══════════════════════════════════════════════════════════════════════

  // Level 1: CVC consonants
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 'b', options: ['bat','cat','rat','sat'], correct: 'bat' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 'c', options: ['cat','bat','mat','pat'], correct: 'cat' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 'd', options: ['dog','log','fog','bog'], correct: 'dog' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 'f', options: ['fig','big','dig','pig'], correct: 'fig' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 'g', options: ['gap','map','tap','cap'], correct: 'gap' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 'h', options: ['hat','bat','cat','mat'], correct: 'hat' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 'm', options: ['map','cap','gap','lap'], correct: 'map' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 'p', options: ['pin','bin','fin','tin'], correct: 'pin' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 'r', options: ['run','sun','fun','bun'], correct: 'run' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 's', options: ['sit','bit','fit','hit'], correct: 'sit' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'easy', question: 't', options: ['tap','cap','gap','map'], correct: 'tap' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'medium', question: 'j', options: ['jet','bet','get','set'],  correct: 'jet' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'medium', question: 'n', options: ['nap','cap','gap','lap'],  correct: 'nap' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'medium', question: 'v', options: ['van','ban','can','fan'],  correct: 'van' },
  { level: 'CVC', gameType: 'letter_sound', difficulty: 'medium', question: 'w', options: ['wet','bet','get','set'],  correct: 'wet' },

  // Level 2: Blends
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'easy',   question: 'fl', options: ['flag','clap','slap','trap'],  correct: 'flag' },
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'easy',   question: 'cl', options: ['clap','flap','slap','snap'],  correct: 'clap' },
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'easy',   question: 'st', options: ['step','clap','drip','flag'],  correct: 'step' },
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'easy',   question: 'sw', options: ['swim','clap','flag','step'],  correct: 'swim' },
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'easy',   question: 'dr', options: ['drip','grip','flip','chip'],  correct: 'drip' },
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'medium', question: 'bl', options: ['blob','clob','flob','slob'],  correct: 'blob' },
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'medium', question: 'cr', options: ['crop','drop','flop','prop'],  correct: 'crop' },
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'medium', question: 'tr', options: ['trap','clap','flap','slap'],  correct: 'trap' },
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'medium', question: 'sn', options: ['snap','clap','flap','trap'],  correct: 'snap' },
  { level: 'Blends', gameType: 'letter_sound', difficulty: 'medium', question: 'sp', options: ['spin','bin','fin','tin'],     correct: 'spin' },

  // Level 3: Digraphs
  { level: 'Digraphs', gameType: 'letter_sound', difficulty: 'easy',   question: 'ch', options: ['chat','bat','flag','drum'],  correct: 'chat' },
  { level: 'Digraphs', gameType: 'letter_sound', difficulty: 'easy',   question: 'sh', options: ['ship','tip','flip','snap'],  correct: 'ship' },
  { level: 'Digraphs', gameType: 'letter_sound', difficulty: 'easy',   question: 'th', options: ['thin','bin','flip','snap'],  correct: 'thin' },
  { level: 'Digraphs', gameType: 'letter_sound', difficulty: 'easy',   question: 'wh', options: ['when','then','flag','ship'], correct: 'when' },
  { level: 'Digraphs', gameType: 'letter_sound', difficulty: 'medium', question: 'ph', options: ['photo','video','audio','radio'], correct: 'photo' },
  { level: 'Digraphs', gameType: 'letter_sound', difficulty: 'medium', question: 'ch', options: ['chip','drip','grip','trip'], correct: 'chip'  },
  { level: 'Digraphs', gameType: 'letter_sound', difficulty: 'medium', question: 'sh', options: ['shop','crop','drop','prop'], correct: 'shop'  },

  // Level 4: Vowel Patterns
  { level: 'VowelPatterns', gameType: 'letter_sound', difficulty: 'easy',   question: 'ai', options: ['rain','run','rip','rap'],   correct: 'rain'  },
  { level: 'VowelPatterns', gameType: 'letter_sound', difficulty: 'easy',   question: 'oa', options: ['boat','bit','bat','but'],   correct: 'boat'  },
  { level: 'VowelPatterns', gameType: 'letter_sound', difficulty: 'easy',   question: 'ee', options: ['feet','fit','fat','fun'],   correct: 'feet'  },
  { level: 'VowelPatterns', gameType: 'letter_sound', difficulty: 'medium', question: 'ea', options: ['dream','grim','trim','slim'], correct: 'dream' },
  { level: 'VowelPatterns', gameType: 'letter_sound', difficulty: 'medium', question: 'i_e',options: ['bike','back','beck','buck'], correct: 'bike'  },
  { level: 'VowelPatterns', gameType: 'letter_sound', difficulty: 'medium', question: 'ou', options: ['loud','load','lead','lied'], correct: 'loud'  },

  // Level 5: Advanced Patterns
  { level: 'AdvancedPatterns', gameType: 'letter_sound', difficulty: 'medium', question: 'igh', options: ['light','list','lint','lift'],     correct: 'light'  },
  { level: 'AdvancedPatterns', gameType: 'letter_sound', difficulty: 'medium', question: 'augh',options: ['caught','cost','cast','colt'],    correct: 'caught' },
  { level: 'AdvancedPatterns', gameType: 'letter_sound', difficulty: 'hard',   question: 'kn',  options: ['knight','night','might','tight'],  correct: 'knight' },
  { level: 'AdvancedPatterns', gameType: 'letter_sound', difficulty: 'hard',   question: 'wr',  options: ['wrench','bench','french','trench'],correct: 'wrench' },
  { level: 'AdvancedPatterns', gameType: 'letter_sound', difficulty: 'hard',   question: 'ough',options: ['through','cough','rough','tough'],  correct: 'through'},
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI environment variable is not set.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  await PhonicsContent.deleteMany({});
  console.log('Cleared existing PhonicsContent documents.');

  const result = await PhonicsContent.insertMany(SEED);
  console.log(`Seeded ${result.length} PhonicsContent documents.`);

  const counts = {};
  for (const doc of SEED) {
    const k = `${doc.level}/${doc.gameType}`;
    counts[k] = (counts[k] || 0) + 1;
  }
  for (const [k, n] of Object.entries(counts).sort()) {
    console.log(`  ${k}: ${n}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
