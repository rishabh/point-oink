# Pass the Pigs Score Tracker - Implementation Documentation

## Project Overview

A React-based web application for tracking scores in the game "Pass the Pigs". Built with TypeScript, Vite, and CSS Modules, featuring a minimalist salmon-themed UI with full mobile responsiveness and localStorage persistence.

**Live Server**: http://localhost:3000/

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: CSS Modules with mobile-first responsive design
- **State Management**: React Context API with custom hooks
- **Persistence**: Browser localStorage
- **Package Manager**: npm

## Design Philosophy

### Core Principles
1. **Type Safety**: Full TypeScript coverage for better developer experience
2. **Component Composition**: Small, focused components with single responsibilities
3. **Centralized State**: React Context for global game state
4. **Auto-persistence**: Automatic localStorage sync on every state change
5. **Mobile-First**: Responsive design that works on all devices
6. **Minimalist UI**: Clean, text-based interface without images

### User Experience Goals
- **Simple Setup**: Quick player name entry to start playing
- **Clear Feedback**: Visual indicators for active player and turn state
- **Error Prevention**: Undo functionality for accidental clicks
- **Score Correction**: Manual score editing for mistakes
- **Persistent State**: Game survives page reloads

## Project Structure

```
point-oink/
├── src/
│   ├── components/           # React components
│   │   ├── GameSetup/        # Initial player setup screen
│   │   │   ├── GameSetup.tsx
│   │   │   └── GameSetup.module.css
│   │   ├── PlayerSidebar/    # Left sidebar with player list
│   │   │   ├── PlayerSidebar.tsx
│   │   │   ├── PlayerSidebar.module.css
│   │   │   ├── PlayerItem.tsx
│   │   │   └── PlayerItem.module.css
│   │   ├── GameControls/     # Center area with pig buttons
│   │   │   ├── GameControls.tsx
│   │   │   ├── GameControls.module.css
│   │   │   ├── PigPositionButtons.tsx
│   │   │   ├── PigPositionButtons.module.css
│   │   │   ├── TurnActions.tsx
│   │   │   └── TurnActions.module.css
│   │   ├── ScoreEditor/      # Modal for editing scores
│   │   │   ├── ScoreEditor.tsx
│   │   │   └── ScoreEditor.module.css
│   │   └── WinnerModal/      # Game end celebration
│   │       ├── WinnerModal.tsx
│   │       └── WinnerModal.module.css
│   ├── context/              # Global state management
│   │   └── GameProvider.tsx  # Context provider with state + actions
│   ├── hooks/                # Custom React hooks
│   │   ├── useLocalStorage.ts    # Generic localStorage hook
│   │   ├── useGameState.ts       # Core game state management
│   │   └── useGameActions.ts     # Game action handlers
│   ├── types/                # TypeScript type definitions
│   │   ├── game.ts           # Core game types
│   │   └── pigPositions.ts   # Pig position types
│   ├── utils/                # Utility functions
│   │   ├── storage.ts        # localStorage operations
│   │   ├── scoreCalculator.ts    # Point calculation
│   │   └── gameRules.ts      # Game logic functions
│   ├── constants/            # Configuration constants
│   │   └── pigPositions.ts   # Pig positions with point values
│   ├── App.tsx               # Root component
│   ├── App.module.css        # Global app styles
│   ├── main.tsx              # Application entry point
│   ├── index.css             # CSS reset and base styles
│   └── vite-env.d.ts         # TypeScript declarations
├── public/                   # Static assets
├── dist/                     # Build output
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── index.html                # HTML entry point
```

## Core Architecture

### Type System

#### Game State Types ([src/types/game.ts](src/types/game.ts))

```typescript
interface Player {
  id: string;              // Unique identifier
  name: string;            // Player name
  cumulativeScore: number; // Total score
  isActive: boolean;       // Currently playing?
}

interface PigRoll {
  id: string;              // Unique roll identifier
  position: PigPosition;   // What position was rolled
  points: number;          // Points for this roll
  timestamp: number;       // When roll occurred
}

interface TurnState {
  playerId: string;        // Who's playing
  accumulatedPoints: number; // Points not yet banked
  rolls: PigRoll[];        // All rolls this turn
}

interface GameState {
  players: Player[];       // All players
  currentTurn: TurnState | null; // Active turn state
  gameStarted: boolean;    // Has game begun?
  gameEnded: boolean;      // Has someone won?
  winnerId: string | null; // Winner's ID if game ended
  history: GameAction[];   // All actions for undo
}
```

#### Pig Position Types ([src/types/pigPositions.ts](src/types/pigPositions.ts))

10 possible pig positions:
- **Sider**: 0 points (Pig Out - lose turn)
- **Razorback**: 5 points
- **Trotter**: 5 points
- **Snouter**: 10 points
- **Leaning Jowler**: 15 points
- **Double Razorback**: 20 points
- **Double Trotter**: 20 points
- **Double Snouter**: 40 points
- **Double Leaning Jowler**: 60 points
- **Mixed Combo**: 1 point

### State Management Flow

```
User Action
    ↓
Component Event Handler
    ↓
GameContext Action (via useGameActions)
    ↓
State Update (via useGameState)
    ↓
Auto-save to localStorage
    ↓
React Re-render
    ↓
UI Updates
```

#### GameProvider ([src/context/GameProvider.tsx](src/context/GameProvider.tsx))

Central hub that provides:
1. **Current Game State**: All game data
2. **Actions**: Functions to modify state
3. **Computed Values**: Derived data (current player, can undo, etc.)

```typescript
const { gameState, actions, computed } = useGame();

// Actions available:
actions.startGame(playerNames)
actions.recordRoll(position)
actions.bankPoints()
actions.undoLastAction()
actions.editPlayerScore(playerId, newScore)
actions.resetGame()

// Computed values:
computed.currentPlayer  // Currently active player
computed.canUndo       // Can undo last action?
```

## Key Component Responsibilities

### [GameSetup](src/components/GameSetup/GameSetup.tsx)
- **Purpose**: Initial player name entry
- **Features**:
  - Add/remove players
  - Minimum 2 players required
  - Validation and error messages
  - Start game button

### [PlayerSidebar](src/components/PlayerSidebar/PlayerSidebar.tsx)
- **Purpose**: Display all players and their scores
- **Features**:
  - List of all players with cumulative scores
  - Active player highlight
  - Click player to edit score
  - New game button
  - Mobile: Transforms to horizontal scrollable list

### [GameControls](src/components/GameControls/GameControls.tsx)
- **Purpose**: Main game interaction area
- **Features**:
  - Display current player name
  - Pig position button grid
  - Turn actions (bank, undo)
  - Turn points display

### [PigPositionButtons](src/components/GameControls/PigPositionButtons.tsx)
- **Purpose**: Clickable buttons for each pig position
- **Features**:
  - 10 position buttons with labels and points
  - Special styling for "Pig Out" positions
  - Disabled when game ended
  - Hover effects and visual feedback

### [TurnActions](src/components/GameControls/TurnActions.tsx)
- **Purpose**: Turn management controls
- **Features**:
  - Display accumulated turn points
  - Bank button (disabled if no points)
  - Undo button (disabled if can't undo)
  - Visual feedback for button states

### [ScoreEditor](src/components/ScoreEditor/ScoreEditor.tsx)
- **Purpose**: Modal for manual score editing
- **Features**:
  - Input field pre-filled with current score
  - Validation (must be number ≥ 0)
  - Save/Cancel buttons
  - Keyboard shortcuts (Enter to save, Escape to cancel)

### [WinnerModal](src/components/WinnerModal/WinnerModal.tsx)
- **Purpose**: Celebrate game winner
- **Features**:
  - Display winner name and final score
  - New game button
  - Full-screen overlay

## Game Logic Implementation

### Starting a Game ([src/hooks/useGameActions.ts:11-30](src/hooks/useGameActions.ts))

1. Create Player objects from names
2. Set first player as active
3. Initialize turn state for first player
4. Save START_GAME action to history
5. Persist to localStorage

### Recording a Roll ([src/hooks/useGameActions.ts:32-80](src/hooks/useGameActions.ts))

1. Calculate points for position
2. Create roll record
3. **If Pig Out**:
   - Clear turn points
   - Advance to next player
   - Reset turn state
4. **If Normal Roll**:
   - Add points to turn total
   - Add roll to turn history
5. Record ROLL action
6. Persist to localStorage

### Banking Points ([src/hooks/useGameActions.ts:82-138](src/hooks/useGameActions.ts))

1. Add accumulated turn points to player's cumulative score
2. **If player reached 100+ points**:
   - Set gameEnded = true
   - Set winnerId
   - Deactivate all players
   - Clear current turn
   - Record END_GAME action
3. **If player hasn't won**:
   - Advance to next player
   - Initialize new turn
4. Record BANK action
5. Persist to localStorage

### Undo Last Action ([src/hooks/useGameActions.ts:140-160](src/hooks/useGameActions.ts))

1. Check if undo is possible (has rolls in current turn)
2. Remove last roll from turn
3. Recalculate accumulated points
4. Remove last action from history
5. Persist to localStorage

**Note**: Can only undo rolls within current turn, not across turn boundaries

### Manual Score Edit ([src/hooks/useGameActions.ts:162-197](src/hooks/useGameActions.ts))

1. Update player's cumulative score
2. Check if edit caused a win (≥ 100 points)
3. If win triggered, end game and set winner
4. Record EDIT_SCORE action
5. Persist to localStorage

### Reset Game ([src/hooks/useGameActions.ts:199-209](src/hooks/useGameActions.ts))

1. Clear localStorage
2. Reset all state to initial values
3. Return to setup screen

## Persistence Strategy

### Auto-Save Implementation ([src/hooks/useGameState.ts:14-18](src/hooks/useGameState.ts))

```typescript
useEffect(() => {
  if (gameState.gameStarted) {
    saveGameState(gameState);
  }
}, [gameState]);
```

**Trigger**: Every state change automatically persists to localStorage

### Storage Schema ([src/utils/storage.ts](src/utils/storage.ts))

```typescript
{
  version: "1.0.0",        // For future migrations
  savedAt: 1234567890,     // Timestamp
  gameState: {             // Complete game state
    players: [...],
    currentTurn: {...},
    gameStarted: true,
    gameEnded: false,
    winnerId: null,
    history: [...]
  }
}
```

**Key**: `pass-the-pigs-game-state`

### State Restoration

On app load ([src/hooks/useGameState.ts:7-10](src/hooks/useGameState.ts)):
1. Attempt to load from localStorage
2. If found, restore complete game state
3. If not found or error, use initial empty state

## Styling System

### Color Palette

```css
--color-salmon: #FA8072       /* Primary background */
--color-salmon-dark: #E9705D  /* Darker accent */
--color-salmon-light: #FFA594 /* Lighter accent */
--color-white: #FFFFFF        /* Cards and buttons */
--color-text-dark: #2C2C2C    /* Primary text */
--color-text-light: #666666   /* Secondary text */
--color-success: #4CAF50      /* Bank, save, scores */
--color-danger: #F44336       /* Pig out, delete */
--color-warning: #FF9800      /* Undo */
```

### Mobile Responsiveness

**Breakpoint**: 768px

#### Desktop (≥ 768px)
```
┌─────────────────────────────────┐
│                                 │
│  ┌──────┐  ┌────────────────┐  │
│  │      │  │                │  │
│  │ Left │  │   Center       │  │
│  │ Side │  │   Controls     │  │
│  │ bar  │  │                │  │
│  │      │  │                │  │
│  └──────┘  └────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Mobile (< 768px)
```
┌─────────────────┐
│                 │
│ ┌─────────────┐ │
│ │ Horizontal  │ │
│ │ Player List │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │             │ │
│ │   Center    │ │
│ │  Controls   │ │
│ │             │ │
│ └─────────────┘ │
│                 │
└─────────────────┘
```

**Key Changes**:
- PlayerSidebar: Width 280px → 100%, height auto, horizontal scroll
- GameControls: Full width
- Button grid: 3+ columns → 2 columns
- Touch targets: Minimum 44px for mobile usability

## Development Workflow

### Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding New Features

#### Example: Adding a New Pig Position

1. **Update Types** ([src/types/pigPositions.ts](src/types/pigPositions.ts))
   ```typescript
   export type PigPosition =
     | 'EXISTING_POSITIONS'
     | 'NEW_POSITION';
   ```

2. **Add Configuration** ([src/constants/pigPositions.ts](src/constants/pigPositions.ts))
   ```typescript
   {
     id: 'NEW_POSITION',
     label: 'New Position Name',
     points: 25,
     isPigOut: false
   }
   ```

3. **Component automatically picks it up** via `PIG_POSITIONS.map()`

#### Example: Adding Special Rules

1. **Update Game Actions** ([src/hooks/useGameActions.ts](src/hooks/useGameActions.ts))
   - Add rule logic to `recordRoll` function
   - Check for rule conditions
   - Apply special scoring or effects

2. **Update UI** as needed
   - Add indicators for special rules
   - Display rule status in GameControls

## Testing Checklist

### Complete Game Flow
- ✅ Enter player names and start game
- ✅ Click pig positions and accumulate points
- ✅ Handle "Pig Out" (Sider) correctly
- ✅ Bank points and move to next player
- ✅ Reach 100 points and trigger win modal
- ✅ Winner modal displays correct player

### Feature Testing
- ✅ Undo removes last roll
- ✅ Manual score editing works
- ✅ Edited score can trigger win
- ✅ New Game button resets state
- ✅ localStorage persists game
- ✅ Page reload restores game

### Edge Cases
- ✅ Cannot start with <2 players
- ✅ Cannot undo when no rolls
- ✅ Cannot bank when no points
- ✅ Buttons disabled when game ended
- ✅ Score editor validates input

### Mobile Testing
- ✅ Responsive layout on small screens
- ✅ Touch targets are adequate size
- ✅ Horizontal scrolling works
- ✅ Modals work on mobile

## Future Enhancement Ideas

### Gameplay Features
- **Special Rules**: Implement Oinker, Double Pig Out, etc.
- **Player Management**: Add/remove players during game
- **Custom Win Condition**: Set target score (50, 100, 200)
- **Turn Timer**: Optional time limit per turn
- **Score History**: View past turns and actions
- **Game Statistics**: Track win rates, average scores

### UI Enhancements
- **Pig Images**: Replace text with pig position illustrations
- **Animations**: Rolling animations, score counting effects
- **Sound Effects**: Audio feedback for rolls, wins, pig outs
- **Themes**: Dark mode, different color schemes
- **Leaderboard**: Track best scores across games

### Technical Improvements
- **Backend Integration**: Save games to server
- **Multiplayer**: Real-time play via WebSockets
- **PWA**: Install as mobile app
- **Accessibility**: ARIA labels, keyboard navigation
- **i18n**: Multiple language support
- **Analytics**: Track gameplay patterns

### Data Features
- **Game History**: Save and review past games
- **Export/Import**: Share game states via JSON
- **Statistics Dashboard**: Visualize player performance
- **Tournament Mode**: Bracket-style competition

## Performance Considerations

### Current Optimizations
- **CSS Modules**: Scoped styles prevent conflicts
- **Component Composition**: Small, focused components
- **Computed Values**: Memoized in context
- **Auto-save**: Efficient localStorage updates

### Potential Improvements
- **useMemo**: Cache expensive calculations
- **useCallback**: Prevent unnecessary re-renders
- **Code Splitting**: Lazy load modals
- **Virtual Scrolling**: For many players
- **Service Worker**: Offline support

## Troubleshooting

### Build Errors

**Issue**: `Cannot find module '*.module.css'`
**Solution**: Ensure [src/vite-env.d.ts](src/vite-env.d.ts) exists with CSS module declarations

**Issue**: TypeScript unused import errors
**Solution**: Remove unused imports from type files

### Runtime Issues

**Issue**: Game state not persisting
**Solution**: Check browser localStorage is enabled and not full

**Issue**: Winner modal not appearing
**Solution**: Verify WINNING_SCORE constant matches expectations

**Issue**: Undo not working
**Solution**: Check that rolls exist in current turn history

### Mobile Issues

**Issue**: Buttons too small on mobile
**Solution**: Verify min-height and padding in CSS modules

**Issue**: Sidebar not horizontal on mobile
**Solution**: Check media query breakpoint at 768px

## Contributing Guidelines

### Code Style
- Use TypeScript for all new files
- Use functional components with hooks
- Use CSS Modules for component styles
- Follow existing naming conventions
- Add types for all props and state

### Component Guidelines
- One component per file
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic to hooks
- Include CSS module for styling

### State Management
- Use context for global state only
- Keep local state in components when possible
- Actions should be pure functions
- Always persist state changes

## License & Credits

**Project**: Pass the Pigs Score Tracker
**Built with**: React, TypeScript, Vite
**Game**: Pass the Pigs by Winning Moves Games
**Created**: December 2025

---

**Documentation Version**: 1.0.0
**Last Updated**: 2025-12-06
