import { PigPositionConfig } from '../types/pigPositions';

export const PIG_POSITIONS: PigPositionConfig[] = [
  // One pig on side, other pig scores
  {
    id: 'RAZORBACK',
    label: 'Razorback',
    points: 5,
    isPigOut: false,
    isSpecial: false,
    description: 'One pig on side, other on back'
  },
  {
    id: 'TROTTER',
    label: 'Trotter',
    points: 5,
    isPigOut: false,
    isSpecial: false,
    description: 'One pig on side, other on all fours'
  },
  {
    id: 'SNOUTER',
    label: 'Snouter',
    points: 10,
    isPigOut: false,
    isSpecial: false,
    description: 'One pig on side, other on snout'
  },
  {
    id: 'LEANING_JOWLER',
    label: 'Leaning Jowler',
    points: 15,
    isPigOut: false,
    isSpecial: false,
    description: 'One pig on side, other on ear'
  },

  // Neither pig on side - doubles
  {
    id: 'DOUBLE_RAZORBACK',
    label: 'Double Razorback',
    points: 20,
    isPigOut: false,
    isSpecial: false,
    description: 'Both pigs on back (5+5)×2'
  },
  {
    id: 'DOUBLE_TROTTER',
    label: 'Double Trotter',
    points: 20,
    isPigOut: false,
    isSpecial: false,
    description: 'Both pigs on all fours (5+5)×2'
  },
  {
    id: 'DOUBLE_SNOUTER',
    label: 'Double Snouter',
    points: 40,
    isPigOut: false,
    isSpecial: false,
    description: 'Both pigs on snout (10+10)×2'
  },
  {
    id: 'DOUBLE_LEANING_JOWLER',
    label: 'Double Leaning Jowler',
    points: 60,
    isPigOut: false,
    isSpecial: false,
    description: 'Both pigs on ear (15+15)×2'
  },

  // Neither pig on side - mixed combos
  {
    id: 'RAZORBACK_TROTTER',
    label: 'Razorback + Trotter',
    points: 10,
    isPigOut: false,
    isSpecial: false,
    description: '5 + 5'
  },
  {
    id: 'RAZORBACK_SNOUTER',
    label: 'Razorback + Snouter',
    points: 15,
    isPigOut: false,
    isSpecial: false,
    description: '5 + 10'
  },
  {
    id: 'RAZORBACK_JOWLER',
    label: 'Razorback + Jowler',
    points: 20,
    isPigOut: false,
    isSpecial: false,
    description: '5 + 15'
  },
  {
    id: 'TROTTER_SNOUTER',
    label: 'Trotter + Snouter',
    points: 15,
    isPigOut: false,
    isSpecial: false,
    description: '5 + 10'
  },
  {
    id: 'TROTTER_JOWLER',
    label: 'Trotter + Jowler',
    points: 20,
    isPigOut: false,
    isSpecial: false,
    description: '5 + 15'
  },
  {
    id: 'SNOUTER_JOWLER',
    label: 'Snouter + Jowler',
    points: 25,
    isPigOut: false,
    isSpecial: false,
    description: '10 + 15'
  },

  // Both pigs on side
  {
    id: 'SIDER',
    label: 'Sider',
    points: 1,
    isPigOut: false,
    isSpecial: false,
    description: 'Both on same side (spot up or down)'
  },
  {
    id: 'PIG_OUT',
    label: 'Pig Out',
    points: 0,
    isPigOut: true,
    isSpecial: false,
    description: 'Both on opposite sides - Lose turn!'
  },

  // Special touching positions
  {
    id: 'OINKER',
    label: 'Oinker',
    points: 0,
    isPigOut: false,
    isSpecial: true,
    description: 'Both touching - Lose ALL game score!'
  },
  {
    id: 'PIGGYBACK',
    label: 'Piggyback',
    points: 0,
    isPigOut: false,
    isSpecial: true,
    description: 'One on top - Player eliminated!'
  }
];

export const WINNING_SCORE = 100;
export const STORAGE_KEY = 'point-oink-game-state';
