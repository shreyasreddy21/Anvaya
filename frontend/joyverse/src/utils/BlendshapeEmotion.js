/**
 * BlendshapeEmotion — map MediaPipe Face Landmarker blendshapes to an emotion.
 *
 * The Face Landmarker outputs 52 ARKit-style blendshape coefficients in [0,1]
 * (mouthSmileLeft, browDownLeft, jawOpen, …). These are ML-derived and far more
 * robust across faces / lighting / pose than hand-tuned landmark geometry — yet
 * they're still produced 100% on-device, so the privacy story is unchanged.
 *
 * Returns the SAME shape as GeometricEmotion.classifyEmotion:
 *   { emotion, probabilities }  with probabilities in EMOTION_CLASSES order.
 * This keeps the EMA / hysteresis / theming pipeline in the hook untouched.
 */
import { EMOTION_CLASSES } from './GeometricEmotion';

/**
 * @param {Array<{categoryName: string, score: number}>} categories
 * @returns {{emotion: string, probabilities: number[]}|null}
 */
export function classifyFromBlendshapes(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  const b = {};
  for (const c of categories) b[c.categoryName] = c.score;
  const g = (k) => b[k] || 0;
  const avg2 = (a, c) => (g(a) + g(c)) / 2;

  // ── Existing signals ───────────────────────────────────────────────────────
  const smile       = avg2('mouthSmileLeft',   'mouthSmileRight');
  const frown       = avg2('mouthFrownLeft',   'mouthFrownRight');
  const browDown    = avg2('browDownLeft',      'browDownRight');
  const browOuterUp = avg2('browOuterUpLeft',   'browOuterUpRight');
  const browInnerUp = g('browInnerUp');
  const jawOpen     = g('jawOpen');
  const eyeWide     = avg2('eyeWideLeft',      'eyeWideRight');
  const mouthPress  = avg2('mouthPressLeft',   'mouthPressRight');
  const sneer       = avg2('noseSneerLeft',    'noseSneerRight');

  // ── Additional signals for sad / angry / surprise ──────────────────────────
  const eyeSquint    = avg2('eyeSquintLeft',    'eyeSquintRight');   // anger + sadness
  const cheekSquint  = avg2('cheekSquintLeft',  'cheekSquintRight'); // genuine smile + anger
  const mouthStretch = avg2('mouthStretchLeft', 'mouthStretchRight');// surprise / shock
  const mouthShrugLo = g('mouthShrugLower');                         // sadness / uncertainty
  const jawForward   = g('jawForward');                               // anger
  const cheekPuff    = g('cheekPuff');                               // surprise

  // Lip parting for surprise: upper lip raises while jaw drops
  const lipParting = avg2('mouthUpperUpLeft', 'mouthUpperUpRight');

  // Mouth corners pulling downward — the clearest sad/miserable signal;
  // distinct from jawOpen (which drops the whole lower jaw, not just the corners)
  const mouthCornersDown = avg2('mouthLowerDownLeft', 'mouthLowerDownRight');

  // Asymmetric squint: one eye squinting more than the other while jaw drops —
  // a reliable shock/disbelief expression that doesn't appear in other emotions
  const asymSquint = Math.abs(g('eyeSquintLeft') - g('eyeSquintRight'));

  // ── Confused-specific signals (non-overlapping) ────────────────────────────
  // Asymmetric brow: one brow raised, other neutral/lowered — strongest confused cue
  const asymBrow      = Math.abs(g('browOuterUpLeft') - g('browOuterUpRight'));
  // Pursed / "hmm" lips — not present in any other emotion
  const mouthPucker   = g('mouthPucker');
  // Lower lip roll — biting lip when uncertain
  const mouthRollLower = g('mouthRollLower');

  const smiling  = smile > 0.35;
  const negDamp  = smiling ? 0.35 : 1;

  // HAPPY — smile dominant; cheekSquint confirms a genuine (Duchenne) smile
  const happy = smile * 1.3 + cheekSquint * 0.3;

  // SURPRISE — open jaw + BOTH eyes wide + raised brows + stretched mouth + lip parting.
  // The key discriminator from confused is eyeWide (symmetric wide eyes vs one squinting).
  const surprise = (
    jawOpen      * 1.2 +
    eyeWide      * 1.8 +
    browOuterUp  * 1.2 +
    browInnerUp  * 0.5 +
    mouthStretch * 0.8 +
    lipParting   * 1.0 +
    cheekPuff    * 0.4
  ) * (smiling ? 0.6 : 1);

  // SAD — frown corners + mouth corners down + lip pout + oblique inner brow + pre-cry squint.
  // mouthCornersDown and mouthShrugLo are the two most visible child-sadness signals;
  // frown blendshape fires at low amplitude (~0.05–0.15) so it needs a high weight.
  const sad = (
    frown             * 2.2 +
    mouthCornersDown  * 1.5 +
    mouthShrugLo      * 1.3 +
    browInnerUp       * 1.0 +
    eyeSquint         * 0.4
  ) * negDamp;

  // ANGRY — brow pull-down is the strongest cue; eye squint + jaw thrust reinforce
  const angry = (
    browDown    * 1.5 +
    sneer       * 0.9 +
    eyeSquint   * 0.7 +
    mouthPress  * 0.5 +
    jawForward  * 0.4
  ) * negDamp;

  // CONFUSED — asymmetric brow + skeptical squint + half-open mouth.
  // asymSquint × jawOpen is the core signal: one eye squinting while mouth is
  // half-open is the archetypal "huh?" expression. Separated from surprise by
  // eyeWide suppression — surprised faces have BOTH eyes wide, confused faces
  // have one eye squinting (asymSquint high, eyeWide low).
  const confused = (
    asymBrow             * 2.2 +
    asymSquint           * 1.5 +
    asymSquint * jawOpen * 2.8 +   // one-eye-squint + half-open mouth = skeptical/confused
    mouthPucker          * 1.3 +
    mouthRollLower       * 0.9
  ) * (smiling ? 0.2 : 1)
    * Math.max(0, 1 - eyeWide * 2.5); // both eyes wide → surprised, not confused

  // NEUTRAL — lowered baseline so the other emotions break through more easily
  const scores = {
    Angry:    angry,
    Confused: confused,
    Happy:    happy,
    Neutral:  0.16,
    Sad:      sad,
    Surprise: surprise,
  };

  const vec = EMOTION_CLASSES.map((c) => Math.max(0, scores[c] || 0));
  const sum = vec.reduce((a, c) => a + c, 0) || 1;
  const probabilities = vec.map((v) => v / sum);

  let maxI = 0;
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[maxI]) maxI = i;
  }
  return { emotion: EMOTION_CLASSES[maxI], probabilities };
}

export default classifyFromBlendshapes;
