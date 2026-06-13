/**
 * SM-2 spaced-repetition scheduler — pure function, no I/O.
 *
 * Given a recall-quality rating (0–5) and the current scheduling state,
 * returns the updated state plus the next review date. Extracted from the
 * sight-words route so the algorithm can be unit-tested in isolation.
 *
 * Quality scale: 0–2 = failed recall, 3 = hard, 4 = good, 5 = easy.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * @param {number} quality 0–5 recall rating
 * @param {object} state   { easeFactor, interval, repetitions }
 * @param {number} [now=Date.now()] injectable clock for deterministic tests
 * @returns {{ easeFactor:number, interval:number, repetitions:number, nextReview:Date }}
 */
export function applySM2(quality, { easeFactor = 2.5, interval = 1, repetitions = 0 } = {}, now = Date.now()) {
  let ef = easeFactor;
  let iv = interval;
  let reps = repetitions;

  if (quality < 3) {
    // Failed recall — reset the streak, review again tomorrow.
    reps = 0;
    iv = 1;
  } else {
    reps += 1;
    if (reps === 1)      iv = 1;
    else if (reps === 2) iv = 6;
    else                 iv = Math.round(iv * ef);

    // Update ease factor (after interval calc, matching classic SM-2).
    const newEF = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ef = Math.max(1.3, newEF);
  }

  return {
    easeFactor: ef,
    interval: iv,
    repetitions: reps,
    nextReview: new Date(now + iv * DAY_MS),
  };
}

export { DAY_MS };
