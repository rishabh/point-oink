import { GameState, StoredGameState } from '../types/game';
import { STORAGE_KEY } from '../constants/pigPositions';

export const saveGameState = (state: GameState): void => {
  try {
    const storedState: StoredGameState = {
      version: '1.0.0',
      savedAt: Date.now(),
      gameState: state
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

export const loadGameState = (): GameState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: StoredGameState = JSON.parse(stored);
    // Add version checking/migration logic here in the future
    return parsed.gameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

export const clearGameState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
