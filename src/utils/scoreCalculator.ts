import { PigPosition } from '../types/pigPositions';
import { PIG_POSITIONS, WINNING_SCORE } from '../constants/pigPositions';

export const calculateRollPoints = (position: PigPosition): number => {
  const config = PIG_POSITIONS.find(p => p.id === position);
  return config?.points || 0;
};

export const isPigOut = (position: PigPosition): boolean => {
  const config = PIG_POSITIONS.find(p => p.id === position);
  return config?.isPigOut || false;
};

export const hasPlayerWon = (score: number): boolean => {
  return score >= WINNING_SCORE;
};
