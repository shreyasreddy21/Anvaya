import { API_BASE } from '../config/api';

const BASE_URL = `${API_BASE}/api/phonics`;

/**
 * PhonicsContentService
 *
 * Single access point for all phonics content — no hardcoded arrays in game components.
 * All data comes from the PhonicsContent collection via /api/phonics.
 *
 * Each method returns the raw document array from the API.
 * Components pick a random item from the returned array as needed.
 */
const PhonicsContentService = {
  /**
   * Fetch letter-bridge column sets for a phonics level + difficulty.
   * Each item has: { letters: [[...],[...],[...]], validWords: [...] }
   */
  async getLetterBridgeSets(level, difficulty = 'easy') {
    const params = new URLSearchParams({ level, gameType: 'letter_bridge', difficulty });
    const res = await fetch(`${BASE_URL}?${params}`);
    if (!res.ok) throw new Error(`PhonicsContentService: letter_bridge fetch failed (${res.status})`);
    return res.json();
  },

  /**
   * Fetch word-puzzle words for a phonics level + difficulty.
   * Each item has: { word, hint, image }
   */
  async getWordPuzzleWords(level, difficulty = 'easy') {
    const params = new URLSearchParams({ level, gameType: 'word_puzzle', difficulty });
    const res = await fetch(`${BASE_URL}?${params}`);
    if (!res.ok) throw new Error(`PhonicsContentService: word_puzzle fetch failed (${res.status})`);
    return res.json();
  },

  /**
   * Fetch syllable-tap words for a phonics level + difficulty.
   * Each item has: { word, syllables, split }
   */
  async getSyllableTapWords(level, difficulty = 'easy') {
    const params = new URLSearchParams({ level, gameType: 'syllable_tap', difficulty });
    const res = await fetch(`${BASE_URL}?${params}`);
    if (!res.ok) throw new Error(`PhonicsContentService: syllable_tap fetch failed (${res.status})`);
    return res.json();
  },

  /**
   * Fetch mirror-words questions for a phonics level + difficulty.
   * Each item has: { question, options, correct }
   */
  async getMirrorWordsQuestions(level, difficulty = 'easy') {
    const params = new URLSearchParams({ level, gameType: 'mirror_words', difficulty });
    const res = await fetch(`${BASE_URL}?${params}`);
    if (!res.ok) throw new Error(`PhonicsContentService: mirror_words fetch failed (${res.status})`);
    return res.json();
  },

  /**
   * Fetch which phonics levels have seeded content for a given game type.
   * Useful for dynamically building level-selector dropdowns.
   */
  async getAvailableLevels(gameType) {
    const params = new URLSearchParams({ gameType });
    const res = await fetch(`${BASE_URL}/levels?${params}`);
    if (!res.ok) throw new Error(`PhonicsContentService: levels fetch failed (${res.status})`);
    return res.json();
  },
};

export default PhonicsContentService;
