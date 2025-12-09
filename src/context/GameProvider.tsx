import React, { createContext, useContext, ReactNode } from 'react';
import { GameState, Player } from '../types/game';
import { PigPosition } from '../types/pigPositions';
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';

interface GameContextType {
  gameState: GameState;
  actions: {
    startGame: (playerNames: string[]) => void;
    recordRoll: (position: PigPosition) => void;
    bankPoints: () => void;
    undoLastAction: () => void;
    editPlayerScore: (playerId: string, newScore: number) => void;
    resetGame: () => void;
    addPlayer: (name: string) => void;
    movePlayer: (playerId: string, direction: 'up' | 'down') => void;
    renamePlayer: (playerId: string, newName: string) => void;
  };
  computed: {
    currentPlayer: Player | null;
    canUndo: boolean;
  };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useGameState();
  const actions = useGameActions(gameState, setGameState);

  const computed = {
    currentPlayer: gameState.currentTurn
      ? gameState.players.find(p => p.id === gameState.currentTurn!.playerId) || null
      : null,
    canUndo: gameState.history.length > 0 &&
             gameState.history[gameState.history.length - 1]?.type !== 'START_GAME'
  };

  return (
    <GameContext.Provider value={{ gameState, actions, computed }}>
      {children}
    </GameContext.Provider>
  );
};
