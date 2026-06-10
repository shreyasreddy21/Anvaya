import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

const STORAGE_KEY = 'joyverse-a11y';

export const DEFAULTS = {
  font: 'opendyslexic',   // 'opendyslexic' | 'default'
  fontSize: 'normal',     // 'normal' | 'large' | 'xl'
  letterSpacing: 'normal', // 'normal' | 'wide' | 'wider'
  lineHeight: 'normal',   // 'normal' | 'relaxed' | 'loose'
};

const fontMap = {
  opendyslexic: "OpenDyslexic, sans-serif",
  default: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
};

const fontSizeMap = {
  normal: '1rem',
  large:  '1.2rem',
  xl:     '1.5rem',
};

const letterSpacingMap = {
  normal: 'normal',
  wide:   '0.06em',
  wider:  '0.14em',
};

const lineHeightMap = {
  normal:  '1.5',
  relaxed: '1.9',
  loose:   '2.4',
};

function applyToDom(settings) {
  const root = document.documentElement;
  root.style.setProperty('--a11y-font',           fontMap[settings.font]           ?? fontMap.opendyslexic);
  root.style.setProperty('--a11y-font-size',       fontSizeMap[settings.fontSize]   ?? fontSizeMap.normal);
  root.style.setProperty('--a11y-letter-spacing',  letterSpacingMap[settings.letterSpacing] ?? letterSpacingMap.normal);
  root.style.setProperty('--a11y-line-height',     lineHeightMap[settings.lineHeight] ?? lineHeightMap.normal);
}

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const [modalOpen, setModalOpen] = useState(false);

  // Apply CSS variables and persist whenever settings change
  useEffect(() => {
    applyToDom(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage unavailable — continue without persistence
    }
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULTS);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{ settings, updateSetting, resetSettings, modalOpen, setModalOpen }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used inside <AccessibilityProvider>');
  return ctx;
}

export default AccessibilityContext;
