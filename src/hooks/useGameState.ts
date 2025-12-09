import { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { loadGameState, saveGameState } from '../utils/storage';

const initialGameState: GameState = {
  players: [],
  currentTurn: null,
  turnNumber: 0,
  gameStarted: false,
  gameEnded: false,
  winnerId: null,
  history: []
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const loaded = loadGameState();
    return loaded || initialGameState;
  });

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    if (gameState.gameStarted) {
      saveGameState(gameState);
    }
  }, [gameState]);

  return [gameState, setGameState] as const;
};
