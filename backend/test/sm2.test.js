import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applySM2, DAY_MS } from '../utils/sm2.js';

const FIXED_NOW = 1_700_000_000_000;

test('failed recall (quality < 3) resets streak and reviews tomorrow', () => {
  const r = applySM2(1, { easeFactor: 2.6, interval: 30, repetitions: 7 }, FIXED_NOW);
  assert.equal(r.repetitions, 0);
  assert.equal(r.interval, 1);
  assert.equal(r.nextReview.getTime(), FIXED_NOW + DAY_MS);
});

test('first successful recall → interval 1 day, repetitions 1', () => {
  const r = applySM2(4, { easeFactor: 2.5, interval: 1, repetitions: 0 }, FIXED_NOW);
  assert.equal(r.repetitions, 1);
  assert.equal(r.interval, 1);
});

test('second successful recall → interval 6 days', () => {
  const r = applySM2(4, { easeFactor: 2.5, interval: 1, repetitions: 1 }, FIXED_NOW);
  assert.equal(r.repetitions, 2);
  assert.equal(r.interval, 6);
});

test('third successful recall → interval grows by ease factor', () => {
  const r = applySM2(5, { easeFactor: 2.5, interval: 6, repetitions: 2 }, FIXED_NOW);
  assert.equal(r.repetitions, 3);
  assert.equal(r.interval, Math.round(6 * 2.5)); // 15
});

test('ease factor never drops below the 1.3 floor', () => {
  let state = { easeFactor: 1.3, interval: 10, repetitions: 5 };
  // Repeated "hard" (q=3) passes push EF down; it must clamp at 1.3.
  for (let i = 0; i < 5; i++) state = applySM2(3, state, FIXED_NOW);
  assert.ok(state.easeFactor >= 1.3, `ease factor ${state.easeFactor} below floor`);
});

test('higher quality yields a higher (or equal) ease factor than lower quality', () => {
  const easy = applySM2(5, { easeFactor: 2.5, interval: 6, repetitions: 2 }, FIXED_NOW);
  const hard = applySM2(3, { easeFactor: 2.5, interval: 6, repetitions: 2 }, FIXED_NOW);
  assert.ok(easy.easeFactor > hard.easeFactor);
});

test('uses sensible defaults when no prior state is given', () => {
  const r = applySM2(4, {}, FIXED_NOW);
  assert.equal(r.repetitions, 1);
  assert.equal(r.interval, 1);
});
