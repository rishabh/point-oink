import { PigPosition } from './pigPositions';

export interface Player {
  id: string;
  name: string;
  cumulativeScore: number;
  isActive: boolean;
}

export interface PigRoll {
  id: string;
  position: PigPosition;
  points: number;
  timestamp: number;
}

export interface TurnState {
  playerId: string;
  accumulatedPoints: number;
  rolls: PigRoll[];
}

export type GameActionType = 'ROLL' | 'BANK' | 'EDIT_SCORE' | 'PIG_OUT' | 'START_GAME' | 'END_GAME' | 'ADD_PLAYER' | 'MOVE_PLAYER' | 'RENAME_PLAYER';

export interface GameAction {
  id: string;
  type: GameActionType;
  timestamp: number;
  turnNumber: number;
  data: any;
}

export interface GameState {
  players: Player[];
  currentTurn: TurnState | null;
  turnNumber: number;
  gameStarted: boolean;
  gameEnded: boolean;
  winnerId: string | null;
  history: GameAction[];
}

export interface StoredGameState {
  version: string;
  savedAt: number;
  gameState: GameState;
}
