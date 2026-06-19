import { createContext, useContext } from 'react';

/**
 * BuddyContext — lets any game signal the shared "learning buddy" that GameShell
 * renders once, so the companion is consistent across every game.
 *
 * Default is a no-op setter, so a <FeedbackGif> rendered outside a GameShell
 * (should never happen, but safe) simply does nothing rather than crashing.
 */
export const BuddyContext = createContext({ setResult: () => {} });

export const useBuddy = () => useContext(BuddyContext);
