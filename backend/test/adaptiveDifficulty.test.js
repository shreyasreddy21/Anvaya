import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendDifficulty, frustrationFromExpressions } from '../utils/adaptiveDifficulty.js';

test('does not prompt without enough sessions', () => {
  const r = recommendDifficulty({ recentAccuracies: [95], currentDifficulty: 'easy' });
  assert.equal(r.reason, 'not_enough_data');
  assert.equal(r.shouldPrompt, false);
  assert.equal(r.recommended, 'easy');
});

test('mastery: high accuracy + low frustration suggests leveling up', () => {
  const r = recommendDifficulty({ recentAccuracies: [90, 95, 88], frustrationScore: 0.1, currentDifficulty: 'easy' });
  assert.equal(r.reason, 'mastery');
  assert.equal(r.recommended, 'medium');
  assert.equal(r.shouldPrompt, true);
});

test('frustration takes priority and eases the level down', () => {
  const r = recommendDifficulty({ recentAccuracies: [90, 92], frustrationScore: 0.6, currentDifficulty: 'medium' });
  assert.equal(r.reason, 'frustration');
  assert.equal(r.recommended, 'easy');
});

test('struggling on low accuracy eases the level down', () => {
  const r = recommendDifficulty({ recentAccuracies: [40, 35, 50], frustrationScore: 0.1, currentDifficulty: 'hard' });
  assert.equal(r.reason, 'struggling');
  assert.equal(r.recommended, 'medium');
});

test('steady mid-range performance maintains the level (no prompt)', () => {
  const r = recommendDifficulty({ recentAccuracies: [70, 65, 72], frustrationScore: 0.2, currentDifficulty: 'medium' });
  assert.equal(r.reason, 'maintain');
  assert.equal(r.shouldPrompt, false);
});

test('never recommends above hard', () => {
  const r = recommendDifficulty({ recentAccuracies: [99, 98], frustrationScore: 0, currentDifficulty: 'hard' });
  assert.equal(r.recommended, 'hard');
  assert.equal(r.shouldPrompt, false);
});

test('never recommends below easy even when struggling', () => {
  const r = recommendDifficulty({ recentAccuracies: [10, 5], frustrationScore: 0.9, currentDifficulty: 'easy' });
  assert.equal(r.recommended, 'easy');
  assert.equal(r.shouldPrompt, false);
});

test('frustration-only: eases down even without accuracy history (all-games path)', () => {
  // Games that log emotion but no per-game accuracy score still get protected.
  const r = recommendDifficulty({ recentAccuracies: [], frustrationScore: 0.7, currentDifficulty: 'medium' });
  assert.equal(r.reason, 'frustration');
  assert.equal(r.recommended, 'easy');
  assert.equal(r.shouldPrompt, true);
});

test('no affect + no accuracy = not_enough_data (unchanged)', () => {
  const r = recommendDifficulty({ recentAccuracies: [], frustrationScore: 0, currentDifficulty: 'medium' });
  assert.equal(r.reason, 'not_enough_data');
  assert.equal(r.shouldPrompt, false);
});

test('frustrationFromExpressions counts angry/sad proportionally', () => {
  assert.equal(frustrationFromExpressions([]), 0);
  assert.equal(frustrationFromExpressions(['happy', 'neutral']), 0);
  assert.equal(frustrationFromExpressions(['angry', 'sad', 'happy', 'neutral']), 0.5);
  // accepts object samples too
  assert.equal(frustrationFromExpressions([{ expression: 'Angry' }, { expression: 'happy' }]), 0.5);
});
