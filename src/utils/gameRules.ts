import { Player, TurnState } from '../types/game';

export const getNextPlayer = (
  players: Player[],
  currentPlayerId: string
): Player => {
  const currentIndex = players.findIndex(p => p.id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex];
};

export const createPlayer = (name: string, index: number): Player => {
  return {
    id: crypto.randomUUID(),
    name,
    cumulativeScore: 0,
    isActive: index === 0
  };
};

export const initializeTurn = (playerId: string): TurnState => {
  return {
    playerId,
    accumulatedPoints: 0,
    rolls: []
  };
};
