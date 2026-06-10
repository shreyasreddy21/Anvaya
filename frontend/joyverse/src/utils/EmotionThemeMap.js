/**
 * Central emotion → visual theme mapping.
 * All game pages and the emotion detection hook consume this single source
 * of truth instead of duplicating inline style objects.
 *
 * Structure per emotion:
 *   backgroundImage  — CSS background-image value for full-page background
 *   backgroundColor  — solid colour fallback / card background
 *   cssVars          — CSS custom properties to set on :root
 *   cardStyle        — inline React style object used by game cards
 */

export const EmotionThemeMap = {
  Happy: {
    backgroundImage: "url('/gameBackgrounds/happy.jpg')",
    backgroundColor: '#fffde7',
    cssVars: {
      '--card-color': '#F8FD89',
      '--button-bg': '#EDD1B0',
      '--button-hover-bg': '#e2c0a0',
      '--button-text': '#333333',
      '--text-color': '#333333',
      '--score-color': '#EDD1B0',
    },
    cardStyle: { backgroundColor: '#F8FD89', color: '#333333' },
  },
  Sad: {
    backgroundImage: "url('/gameBackgrounds/sad.jpg')",
    backgroundColor: '#e8f5e9',
    cssVars: {
      '--card-color': '#D8FAD2',
      '--button-bg': '#CDE8B0',
      '--button-hover-bg': '#b9d9a2',
      '--button-text': '#3B2F2F',
      '--text-color': '#3B2F2F',
      '--score-color': '#CDE8B0',
    },
    cardStyle: { backgroundColor: '#D8FAD2', color: '#3B2F2F' },
  },
  Angry: {
    backgroundImage: "url('/gameBackgrounds/angry.jpg')",
    backgroundColor: '#e0f7fa',
    cssVars: {
      '--card-color': '#A5F7E1',
      '--button-bg': '#96ADFC',
      '--button-hover-bg': '#8198f0',
      '--button-text': '#223344',
      '--text-color': '#223344',
      '--score-color': '#96ADFC',
    },
    cardStyle: { backgroundColor: '#A5F7E1', color: '#223344' },
  },
  Neutral: {
    backgroundImage: "url('/gameBackgrounds/neutral.jpg')",
    backgroundColor: '#fafafa',
    cssVars: {
      '--card-color': '#F9F9F3',
      '--button-bg': '#E6E6FA',
      '--button-hover-bg': '#d8d8ef',
      '--button-text': '#2C2C2C',
      '--text-color': '#2C2C2C',
      '--score-color': '#E6E6FA',
    },
    cardStyle: { backgroundColor: '#F9F9F3', color: '#2C2C2C' },
  },
  Surprise: {
    backgroundImage: "url('/gameBackgrounds/surprise.jpg')",
    backgroundColor: '#fff3e0',
    cssVars: {
      '--card-color': '#FFDAB9',
      '--button-bg': '#FFFACD',
      '--button-hover-bg': '#f2eebf',
      '--button-text': '#4B0082',
      '--text-color': '#4B0082',
      '--score-color': '#FFFACD',
    },
    cardStyle: { backgroundColor: '#FFDAB9', color: '#4B0082' },
  },
};

/** Returns the card inline style for a given emotion label (case-sensitive). */
export function getCardStyle(emotion) {
  return EmotionThemeMap[emotion]?.cardStyle ?? EmotionThemeMap.Neutral.cardStyle;
}

/**
 * Applies an emotion theme to the document:
 * - Sets background image + size/position on body
 * - Sets all CSS custom variables on :root
 * Background-color transitions smoothly via the `transition` rule on body
 * in global.css; background-image cannot be transitioned natively.
 */
export function applyEmotionTheme(emotion) {
  const theme = EmotionThemeMap[emotion];
  if (!theme) return;

  const body = document.body;
  body.style.setProperty('background-image', theme.backgroundImage, 'important');
  body.style.setProperty('background-size', 'cover', 'important');
  body.style.setProperty('background-position', 'center', 'important');
  body.style.setProperty('background-repeat', 'no-repeat', 'important');
  body.style.setProperty('width', '100%');
  body.style.setProperty('height', '100%');

  const root = document.documentElement;
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
