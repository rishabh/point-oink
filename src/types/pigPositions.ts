export type PigPosition =
  | 'SIDER'
  | 'RAZORBACK'
  | 'TROTTER'
  | 'SNOUTER'
  | 'LEANING_JOWLER'
  | 'DOUBLE_RAZORBACK'
  | 'DOUBLE_TROTTER'
  | 'DOUBLE_SNOUTER'
  | 'DOUBLE_LEANING_JOWLER'
  | 'RAZORBACK_TROTTER'
  | 'RAZORBACK_SNOUTER'
  | 'RAZORBACK_JOWLER'
  | 'TROTTER_SNOUTER'
  | 'TROTTER_JOWLER'
  | 'SNOUTER_JOWLER'
  | 'PIG_OUT'
  | 'OINKER'
  | 'PIGGYBACK'
  | 'MIXED_COMBO';

export interface PigPositionConfig {
  id: PigPosition;
  label: string;
  points: number;
  isPigOut: boolean;
  isSpecial?: boolean;
  description?: string;
}
