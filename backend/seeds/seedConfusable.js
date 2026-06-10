/**
 * seedConfusable.js
 * Populates ConfusableContent with 64 items covering all 4 confusable pairs
 * (b/d, p/q, m/w, n/u), 2 question types, and 3 difficulty levels.
 * Idempotent — clears the collection before inserting.
 *
 * Usage:
 *   node --experimental-vm-modules backend/seeds/seedConfusable.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ConfusableContent from '../models/ConfusableContent.js';

dotenv.config();

const SEED = [
  // ═══════════════════════════════════════════════════════
  // PAIR: b/d — LETTER IDENTIFICATION
  // ═══════════════════════════════════════════════════════
  // easy: 2 options (same pair only)
  { pair:'bd', type:'letter_id', difficulty:'easy', question:'b', options:['b','d'], correct:'b', hint:'b has its bump on the right side' },
  { pair:'bd', type:'letter_id', difficulty:'easy', question:'d', options:['b','d'], correct:'d', hint:'d has its bump on the left side' },
  // medium: 4 options (both confusable pairs mixed)
  { pair:'bd', type:'letter_id', difficulty:'medium', question:'b', options:['b','d','p','q'], correct:'b', hint:'' },
  { pair:'bd', type:'letter_id', difficulty:'medium', question:'d', options:['b','d','p','q'], correct:'d', hint:'' },
  // hard: all 8 confusable letters
  { pair:'bd', type:'letter_id', difficulty:'hard', question:'b', options:['b','d','p','q','n','u','m','w'], correct:'b', hint:'' },
  { pair:'bd', type:'letter_id', difficulty:'hard', question:'d', options:['b','d','p','q','n','u','m','w'], correct:'d', hint:'' },

  // ═══════════════════════════════════════════════════════
  // PAIR: b/d — WORD CONTEXT
  // ═══════════════════════════════════════════════════════
  // easy: blank at start of short CVC word, 2 options
  { pair:'bd', type:'word_context', difficulty:'easy', question:'_og',  options:['b','d'], correct:'d', hint:'dog — starts with d' },
  { pair:'bd', type:'word_context', difficulty:'easy', question:'_at',  options:['b','d'], correct:'b', hint:'bat — starts with b' },
  { pair:'bd', type:'word_context', difficulty:'easy', question:'_ed',  options:['b','d'], correct:'b', hint:'bed — starts with b' },
  { pair:'bd', type:'word_context', difficulty:'easy', question:'_ig',  options:['b','d'], correct:'b', hint:'big — starts with b' },
  // medium: longer words, blank at start
  { pair:'bd', type:'word_context', difficulty:'medium', question:'_ive',   options:['b','d'], correct:'d', hint:'dive — starts with d' },
  { pair:'bd', type:'word_context', difficulty:'medium', question:'_ragon', options:['b','d'], correct:'d', hint:'dragon — starts with d' },
  { pair:'bd', type:'word_context', difficulty:'medium', question:'_ridge', options:['b','d'], correct:'b', hint:'bridge — starts with b' },
  { pair:'bd', type:'word_context', difficulty:'medium', question:'_anana', options:['b','d'], correct:'b', hint:'banana — starts with b' },
  // hard: blank at end or inside, 4 options
  { pair:'bd', type:'word_context', difficulty:'hard', question:'ba_',      options:['b','d','p','q'], correct:'d', hint:'bad — ends with d' },
  { pair:'bd', type:'word_context', difficulty:'hard', question:'_ro_',     options:['b','d','p','q'], correct:'b', hint:'drop → first letter is d, but "bro_" → b+d' },
  { pair:'bd', type:'word_context', difficulty:'hard', question:'_irth_ay', options:['b','d','p','q'], correct:'b', hint:'birthday — both blanks are b and d' },
  { pair:'bd', type:'word_context', difficulty:'hard', question:'brea_',    options:['b','d','p','q'], correct:'d', hint:'bread — ends with d' },

  // ═══════════════════════════════════════════════════════
  // PAIR: p/q — LETTER IDENTIFICATION
  // ═══════════════════════════════════════════════════════
  { pair:'pq', type:'letter_id', difficulty:'easy', question:'p', options:['p','q'], correct:'p', hint:'p tail hangs down on the right' },
  { pair:'pq', type:'letter_id', difficulty:'easy', question:'q', options:['p','q'], correct:'q', hint:'q tail hangs down on the left' },
  { pair:'pq', type:'letter_id', difficulty:'medium', question:'p', options:['b','d','p','q'], correct:'p', hint:'' },
  { pair:'pq', type:'letter_id', difficulty:'medium', question:'q', options:['b','d','p','q'], correct:'q', hint:'' },
  { pair:'pq', type:'letter_id', difficulty:'hard', question:'p', options:['b','d','p','q','n','u','m','w'], correct:'p', hint:'' },
  { pair:'pq', type:'letter_id', difficulty:'hard', question:'q', options:['b','d','p','q','n','u','m','w'], correct:'q', hint:'' },

  // ═══════════════════════════════════════════════════════
  // PAIR: p/q — WORD CONTEXT
  // ═══════════════════════════════════════════════════════
  { pair:'pq', type:'word_context', difficulty:'easy', question:'_ig',    options:['p','q'], correct:'p', hint:'pig — starts with p' },
  { pair:'pq', type:'word_context', difficulty:'easy', question:'_en',    options:['p','q'], correct:'p', hint:'pen — starts with p' },
  { pair:'pq', type:'word_context', difficulty:'easy', question:'_uiet',  options:['p','q'], correct:'q', hint:'quiet — starts with q' },
  { pair:'pq', type:'word_context', difficulty:'easy', question:'_ot',    options:['p','q'], correct:'p', hint:'pot — starts with p' },
  { pair:'pq', type:'word_context', difficulty:'medium', question:'_ueen',  options:['p','q'], correct:'q', hint:'queen — starts with q' },
  { pair:'pq', type:'word_context', difficulty:'medium', question:'_izza',  options:['p','q'], correct:'p', hint:'pizza — starts with p' },
  { pair:'pq', type:'word_context', difficulty:'medium', question:'_uick',  options:['p','q'], correct:'q', hint:'quick — starts with q' },
  { pair:'pq', type:'word_context', difficulty:'medium', question:'_lant',  options:['p','q'], correct:'p', hint:'plant — starts with p' },
  { pair:'pq', type:'word_context', difficulty:'hard', question:'_ickle',       options:['b','d','p','q'], correct:'p', hint:'pickle — starts with p' },
  { pair:'pq', type:'word_context', difficulty:'hard', question:'_uicksand',    options:['b','d','p','q'], correct:'q', hint:'quicksand — starts with q' },
  { pair:'pq', type:'word_context', difficulty:'hard', question:'_rin_ess',     options:['b','d','p','q'], correct:'p', hint:'princess — both blanks are p' },
  { pair:'pq', type:'word_context', difficulty:'hard', question:'_ackage',      options:['b','d','p','q'], correct:'p', hint:'package — starts with p' },

  // ═══════════════════════════════════════════════════════
  // PAIR: m/w — LETTER IDENTIFICATION
  // ═══════════════════════════════════════════════════════
  { pair:'mw', type:'letter_id', difficulty:'easy', question:'m', options:['m','w'], correct:'m', hint:'m has two humps on top' },
  { pair:'mw', type:'letter_id', difficulty:'easy', question:'w', options:['m','w'], correct:'w', hint:'w has two valleys at the top' },
  { pair:'mw', type:'letter_id', difficulty:'medium', question:'m', options:['m','w','n','u'], correct:'m', hint:'' },
  { pair:'mw', type:'letter_id', difficulty:'medium', question:'w', options:['m','w','n','u'], correct:'w', hint:'' },
  { pair:'mw', type:'letter_id', difficulty:'hard', question:'m', options:['b','d','p','q','n','u','m','w'], correct:'m', hint:'' },
  { pair:'mw', type:'letter_id', difficulty:'hard', question:'w', options:['b','d','p','q','n','u','m','w'], correct:'w', hint:'' },

  // ═══════════════════════════════════════════════════════
  // PAIR: m/w — WORD CONTEXT
  // ═══════════════════════════════════════════════════════
  { pair:'mw', type:'word_context', difficulty:'easy', question:'_oon',   options:['m','w'], correct:'m', hint:'moon — starts with m' },
  { pair:'mw', type:'word_context', difficulty:'easy', question:'_ater',  options:['m','w'], correct:'w', hint:'water — starts with w' },
  { pair:'mw', type:'word_context', difficulty:'easy', question:'_ap',    options:['m','w'], correct:'m', hint:'map — starts with m' },
  { pair:'mw', type:'word_context', difficulty:'easy', question:'_eb',    options:['m','w'], correct:'w', hint:'web — starts with w' },
  { pair:'mw', type:'word_context', difficulty:'medium', question:'_indo_',   options:['m','w'], correct:'w', hint:'window — both blanks are w' },
  { pair:'mw', type:'word_context', difficulty:'medium', question:'_irror',   options:['m','w'], correct:'m', hint:'mirror — starts with m' },
  { pair:'mw', type:'word_context', difficulty:'medium', question:'_or_',     options:['m','w'], correct:'w', hint:'worm — both w' },
  { pair:'mw', type:'word_context', difficulty:'medium', question:'_usicla_', options:['m','w'], correct:'m', hint:'musical — both blanks are m' },
  { pair:'mw', type:'word_context', difficulty:'hard', question:'_orning',  options:['m','w','n','u'], correct:'m', hint:'morning — starts with m' },
  { pair:'mw', type:'word_context', difficulty:'hard', question:'_eather',  options:['m','w','n','u'], correct:'w', hint:'weather — starts with w' },
  { pair:'mw', type:'word_context', difficulty:'hard', question:'_elco_e',  options:['m','w','n','u'], correct:'w', hint:'welcome — both blanks are w and m' },
  { pair:'mw', type:'word_context', difficulty:'hard', question:'_ag_et',   options:['m','w','n','u'], correct:'m', hint:'magnet — both blanks are m' },

  // ═══════════════════════════════════════════════════════
  // PAIR: n/u — LETTER IDENTIFICATION
  // ═══════════════════════════════════════════════════════
  { pair:'nu', type:'letter_id', difficulty:'easy', question:'n', options:['n','u'], correct:'n', hint:'n has one hump, open at the bottom' },
  { pair:'nu', type:'letter_id', difficulty:'easy', question:'u', options:['n','u'], correct:'u', hint:'u is a cup shape, open at the top' },
  { pair:'nu', type:'letter_id', difficulty:'medium', question:'n', options:['m','w','n','u'], correct:'n', hint:'' },
  { pair:'nu', type:'letter_id', difficulty:'medium', question:'u', options:['m','w','n','u'], correct:'u', hint:'' },
  { pair:'nu', type:'letter_id', difficulty:'hard', question:'n', options:['b','d','p','q','n','u','m','w'], correct:'n', hint:'' },
  { pair:'nu', type:'letter_id', difficulty:'hard', question:'u', options:['b','d','p','q','n','u','m','w'], correct:'u', hint:'' },

  // ═══════════════════════════════════════════════════════
  // PAIR: n/u — WORD CONTEXT
  // ═══════════════════════════════════════════════════════
  { pair:'nu', type:'word_context', difficulty:'easy', question:'_ight',  options:['n','u'], correct:'n', hint:'night — starts with n' },
  { pair:'nu', type:'word_context', difficulty:'easy', question:'_nder',  options:['n','u'], correct:'u', hint:'under — starts with u' },
  { pair:'nu', type:'word_context', difficulty:'easy', question:'_ose',   options:['n','u'], correct:'n', hint:'nose — starts with n' },
  { pair:'nu', type:'word_context', difficulty:'easy', question:'_p',     options:['n','u'], correct:'u', hint:'up — starts with u' },
  { pair:'nu', type:'word_context', difficulty:'medium', question:'_nicorn',  options:['n','u'], correct:'u', hint:'unicorn — starts with u' },
  { pair:'nu', type:'word_context', difficulty:'medium', question:'_umber',   options:['n','u'], correct:'n', hint:'number — starts with n' },
  { pair:'nu', type:'word_context', difficulty:'medium', question:'_mbrella', options:['n','u'], correct:'u', hint:'umbrella — starts with u' },
  { pair:'nu', type:'word_context', difficulty:'medium', question:'_eedle',   options:['n','u'], correct:'n', hint:'needle — starts with n' },
  { pair:'nu', type:'word_context', difficulty:'hard', question:'_ight _nder', options:['m','w','n','u'], correct:'n', hint:'night under — first word starts with n' },
  { pair:'nu', type:'word_context', difficulty:'hard', question:'_nlock',     options:['m','w','n','u'], correct:'u', hint:'unlock — starts with u' },
  { pair:'nu', type:'word_context', difficulty:'hard', question:'_ewspaper',  options:['m','w','n','u'], correct:'n', hint:'newspaper — starts with n' },
  { pair:'nu', type:'word_context', difficulty:'hard', question:'_niverse',   options:['m','w','n','u'], correct:'u', hint:'universe — starts with u' },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await ConfusableContent.deleteMany({});
  console.log('Cleared existing ConfusableContent');

  await ConfusableContent.insertMany(SEED);
  console.log(`Inserted ${SEED.length} confusable-letter content items`);

  await mongoose.disconnect();
  console.log('Done');
};

run().catch(err => { console.error(err); process.exit(1); });
