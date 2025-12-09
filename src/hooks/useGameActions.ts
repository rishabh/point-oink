import { GameState, GameAction } from '../types/game';
import { PigPosition } from '../types/pigPositions';
import { createPlayer, getNextPlayer, initializeTurn } from '../utils/gameRules';
import { calculateRollPoints, isPigOut, hasPlayerWon } from '../utils/scoreCalculator';
import { clearGameState } from '../utils/storage';

export const useGameActions = (
  gameState: GameState,
  setGameState: (state: GameState) => void
) => {
  const startGame = (playerNames: string[]) => {
    const players = playerNames.map((name, index) => createPlayer(name, index));
    const firstPlayer = players[0];

    const newState: GameState = {
      players,
      currentTurn: initializeTurn(firstPlayer.id),
      turnNumber: 1,
      gameStarted: true,
      gameEnded: false,
      winnerId: null,
      history: [{
        id: crypto.randomUUID(),
        type: 'START_GAME',
        timestamp: Date.now(),
        turnNumber: 0,
        data: { playerNames }
      }]
    };

    setGameState(newState);
  };

  const recordRoll = (position: PigPosition) => {
    if (!gameState.currentTurn || gameState.gameEnded) return;

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn!.playerId);
    if (!currentPlayer) return;

    const points = calculateRollPoints(position);
    const roll = {
      id: crypto.randomUUID(),
      position,
      points,
      timestamp: Date.now()
    };

    const action: GameAction = {
      id: crypto.randomUUID(),
      type: 'ROLL',
      timestamp: Date.now(),
      turnNumber: gameState.turnNumber,
      data: { roll, playerId: currentPlayer.id }
    };

    // Handle special positions
    if (position === 'OINKER') {
      // Oinker - reset player's entire game score to 0, advance to next player
      // Store state for undo
      action.data = {
        ...action.data,
        previousScore: currentPlayer.cumulativeScore,
        turnState: gameState.currentTurn,
        previousPlayers: gameState.players
      };

      const updatedPlayers = gameState.players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, cumulativeScore: 0, isActive: false }
          : { ...p, isActive: false }
      );

      const nextPlayer = getNextPlayer(updatedPlayers, currentPlayer.id);
      const finalPlayers = updatedPlayers.map(p => ({
        ...p,
        isActive: p.id === nextPlayer.id
      }));

      setGameState({
        ...gameState,
        players: finalPlayers,
        currentTurn: initializeTurn(nextPlayer.id),
        turnNumber: gameState.turnNumber + 1,
        history: [...gameState.history, action]
      });
      return;
    }

    if (position === 'PIGGYBACK') {
      // Piggyback - eliminate player from game
      // Store eliminated player's state for undo
      const eliminatedPlayerState = {
        player: currentPlayer,
        turnState: gameState.currentTurn,
        allPlayers: gameState.players
      };

      // Update action data to include eliminated player info
      action.data = {
        ...action.data,
        eliminatedPlayer: eliminatedPlayerState
      };

      // Filter out eliminated player and find next active player
      const remainingPlayers = gameState.players.filter(p => p.id !== currentPlayer.id);

      if (remainingPlayers.length === 1) {
        // Only one player left, they win
        setGameState({
          ...gameState,
          players: remainingPlayers.map(p => ({ ...p, isActive: false })),
          currentTurn: null,
          gameEnded: true,
          winnerId: remainingPlayers[0].id,
          history: [...gameState.history, action, {
            id: crypto.randomUUID(),
            type: 'END_GAME',
            timestamp: Date.now(),
            turnNumber: gameState.turnNumber,
            data: { winnerId: remainingPlayers[0].id }
          }]
        });
      } else {
        // More players remaining, continue game
        const currentIndex = gameState.players.findIndex(p => p.id === currentPlayer.id);
        const nextIndex = currentIndex % remainingPlayers.length;
        const nextPlayer = remainingPlayers[nextIndex];

        const finalPlayers = remainingPlayers.map(p => ({
          ...p,
          isActive: p.id === nextPlayer.id
        }));

        setGameState({
          ...gameState,
          players: finalPlayers,
          currentTurn: initializeTurn(nextPlayer.id),
          turnNumber: gameState.turnNumber + 1,
          history: [...gameState.history, action]
        });
      }
      return;
    }

    // Check if it's a pig out
    if (isPigOut(position)) {
      // Pig out - lose all turn points and advance to next player
      // Store state for undo
      action.data = {
        ...action.data,
        turnState: gameState.currentTurn,
        previousPlayers: gameState.players
      };

      const nextPlayer = getNextPlayer(gameState.players, gameState.currentTurn.playerId);

      const updatedPlayers = gameState.players.map(p => ({
        ...p,
        isActive: p.id === nextPlayer.id
      }));

      setGameState({
        ...gameState,
        players: updatedPlayers,
        currentTurn: initializeTurn(nextPlayer.id),
        turnNumber: gameState.turnNumber + 1,
        history: [...gameState.history, action]
      });
    } else {
      // Normal roll - add points to turn
      const updatedTurn = {
        ...gameState.currentTurn,
        accumulatedPoints: gameState.currentTurn.accumulatedPoints + points,
        rolls: [...gameState.currentTurn.rolls, roll]
      };

      setGameState({
        ...gameState,
        currentTurn: updatedTurn,
        history: [...gameState.history, action]
      });
    }
  };

  const bankPoints = () => {
    if (!gameState.currentTurn || gameState.gameEnded) return;

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn!.playerId);
    if (!currentPlayer) return;

    const newScore = currentPlayer.cumulativeScore + gameState.currentTurn.accumulatedPoints;
    const playerWon = hasPlayerWon(newScore);

    const updatedPlayers = gameState.players.map(p =>
      p.id === currentPlayer.id
        ? { ...p, cumulativeScore: newScore }
        : p
    );

    const action: GameAction = {
      id: crypto.randomUUID(),
      type: 'BANK',
      timestamp: Date.now(),
      turnNumber: gameState.turnNumber,
      data: {
        playerId: currentPlayer.id,
        pointsBanked: gameState.currentTurn.accumulatedPoints,
        newScore,
        previousScore: currentPlayer.cumulativeScore,
        turnState: gameState.currentTurn,
        previousPlayers: gameState.players
      }
    };

    if (playerWon) {
      // Game over - player won
      setGameState({
        ...gameState,
        players: updatedPlayers.map(p => ({ ...p, isActive: false })),
        currentTurn: null,
        gameEnded: true,
        winnerId: currentPlayer.id,
        history: [...gameState.history, action, {
          id: crypto.randomUUID(),
          type: 'END_GAME',
          timestamp: Date.now(),
          turnNumber: gameState.turnNumber,
          data: { winnerId: currentPlayer.id }
        }]
      });
    } else {
      // Continue game - move to next player
      const nextPlayer = getNextPlayer(updatedPlayers, currentPlayer.id);
      const nextPlayers = updatedPlayers.map(p => ({
        ...p,
        isActive: p.id === nextPlayer.id
      }));

      setGameState({
        ...gameState,
        players: nextPlayers,
        currentTurn: initializeTurn(nextPlayer.id),
        turnNumber: gameState.turnNumber + 1,
        history: [...gameState.history, action]
      });
    }
  };

  const undoLastAction = () => {
    if (gameState.history.length === 0) return;

    const lastAction = gameState.history[gameState.history.length - 1];

    // Cannot undo game start
    if (lastAction.type === 'START_GAME') return;

    // Handle END_GAME caused by elimination or winning
    if (lastAction.type === 'END_GAME' && gameState.history.length >= 2) {
      const secondLastAction = gameState.history[gameState.history.length - 2];

      // Check if game ended due to Piggyback elimination
      if (secondLastAction.type === 'ROLL' &&
          secondLastAction.data.roll.position === 'PIGGYBACK' &&
          secondLastAction.data.eliminatedPlayer) {
        // Restore eliminated player and undo both actions
        const { player, turnState, allPlayers } = secondLastAction.data.eliminatedPlayer;

        setGameState({
          ...gameState,
          players: allPlayers.map((p: any) => ({
            ...p,
            isActive: p.id === player.id
          })),
          currentTurn: turnState,
          turnNumber: gameState.turnNumber - 1,
          gameEnded: false,
          winnerId: null,
          history: gameState.history.slice(0, -2) // Remove both END_GAME and PIGGYBACK
        });
        return;
      }

      // Check if game ended due to banking winning points
      if (secondLastAction.type === 'BANK' && secondLastAction.data.previousScore !== undefined) {
        // Restore player's score and turn state before banking
        const { playerId, previousScore, turnState, previousPlayers } = secondLastAction.data;

        setGameState({
          ...gameState,
          players: previousPlayers.map((p: any) => ({
            ...p,
            isActive: p.id === playerId,
            cumulativeScore: p.id === playerId ? previousScore : p.cumulativeScore
          })),
          currentTurn: turnState,
          turnNumber: gameState.turnNumber - 1,
          gameEnded: false,
          winnerId: null,
          history: gameState.history.slice(0, -2) // Remove both END_GAME and BANK
        });
        return;
      }

      // Check if game ended due to editing score
      if (secondLastAction.type === 'EDIT_SCORE') {
        // Cannot easily undo score edit that caused win - would need previous score
        // For now, just undo the END_GAME and let user manually fix
        return;
      }

      // Otherwise, cannot undo END_GAME
      return;
    }

    // Undo ROLL actions
    if (lastAction.type === 'ROLL') {
      const roll = lastAction.data.roll;
      const position = roll.position;

      // Check if this was a turn-ending roll (Pig Out, Oinker, Piggyback)
      if (position === 'PIGGYBACK' && lastAction.data.eliminatedPlayer) {
        // Restore eliminated player
        const { player, turnState, allPlayers } = lastAction.data.eliminatedPlayer;

        setGameState({
          ...gameState,
          players: allPlayers.map((p: any) => ({
            ...p,
            isActive: p.id === player.id
          })),
          currentTurn: turnState,
          turnNumber: gameState.turnNumber - 1,
          history: gameState.history.slice(0, -1)
        });
      } else if (position === 'OINKER' && lastAction.data.previousScore !== undefined) {
        // Restore player's score and turn
        const { playerId, previousScore, turnState, previousPlayers } = lastAction.data;

        setGameState({
          ...gameState,
          players: previousPlayers.map((p: any) => ({
            ...p,
            isActive: p.id === playerId,
            cumulativeScore: p.id === playerId ? previousScore : p.cumulativeScore
          })),
          currentTurn: turnState,
          turnNumber: gameState.turnNumber - 1,
          history: gameState.history.slice(0, -1)
        });
      } else if (lastAction.data.turnState && lastAction.data.previousPlayers) {
        // Pig Out - restore turn state
        const { turnState, previousPlayers, playerId } = lastAction.data;

        setGameState({
          ...gameState,
          players: previousPlayers.map((p: any) => ({
            ...p,
            isActive: p.id === playerId
          })),
          currentTurn: turnState,
          turnNumber: gameState.turnNumber - 1,
          history: gameState.history.slice(0, -1)
        });
      } else if (gameState.currentTurn && gameState.currentTurn.rolls.length > 0) {
        // Normal roll within current turn
        const updatedRolls = gameState.currentTurn.rolls.slice(0, -1);
        const accumulatedPoints = updatedRolls.reduce((sum, roll) => sum + roll.points, 0);

        setGameState({
          ...gameState,
          currentTurn: {
            ...gameState.currentTurn,
            rolls: updatedRolls,
            accumulatedPoints
          },
          history: gameState.history.slice(0, -1)
        });
      }
    }

    // Undo BANK actions
    if (lastAction.type === 'BANK' && lastAction.data.previousScore !== undefined) {
      const { playerId, previousScore, turnState, previousPlayers } = lastAction.data;

      setGameState({
        ...gameState,
        players: previousPlayers.map((p: any) => ({
          ...p,
          isActive: p.id === playerId,
          cumulativeScore: p.id === playerId ? previousScore : p.cumulativeScore
        })),
        currentTurn: turnState,
        turnNumber: gameState.turnNumber - 1,
        history: gameState.history.slice(0, -1)
      });
    }
  };

  const editPlayerScore = (playerId: string, newScore: number) => {
    const updatedPlayers = gameState.players.map(p =>
      p.id === playerId ? { ...p, cumulativeScore: newScore } : p
    );

    const action: GameAction = {
      id: crypto.randomUUID(),
      type: 'EDIT_SCORE',
      timestamp: Date.now(),
      turnNumber: gameState.turnNumber,
      data: { playerId, newScore }
    };

    // Check if edited score causes a win
    const editedPlayer = updatedPlayers.find(p => p.id === playerId);
    if (editedPlayer && hasPlayerWon(editedPlayer.cumulativeScore)) {
      setGameState({
        ...gameState,
        players: updatedPlayers.map(p => ({ ...p, isActive: false })),
        currentTurn: null,
        gameEnded: true,
        winnerId: playerId,
        history: [...gameState.history, action, {
          id: crypto.randomUUID(),
          type: 'END_GAME',
          timestamp: Date.now(),
          turnNumber: gameState.turnNumber,
          data: { winnerId: playerId }
        }]
      });
    } else {
      setGameState({
        ...gameState,
        players: updatedPlayers,
        history: [...gameState.history, action]
      });
    }
  };

  const resetGame = () => {
    clearGameState();
    setGameState({
      players: [],
      currentTurn: null,
      turnNumber: 0,
      gameStarted: false,
      gameEnded: false,
      winnerId: null,
      history: []
    });
  };

  const addPlayer = (name: string) => {
    // Create new player (not active, will join turn order)
    const newPlayer = createPlayer(name, gameState.players.length);
    const updatedPlayers = [...gameState.players, { ...newPlayer, isActive: false }];

    const action: GameAction = {
      id: crypto.randomUUID(),
      type: 'ADD_PLAYER',
      timestamp: Date.now(),
      turnNumber: gameState.turnNumber,
      data: { playerId: newPlayer.id, playerName: name }
    };

    setGameState({
      ...gameState,
      players: updatedPlayers,
      history: [...gameState.history, action]
    });
  };

  const movePlayer = (playerId: string, direction: 'up' | 'down') => {
    const currentIndex = gameState.players.findIndex(p => p.id === playerId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= gameState.players.length) return;

    // Swap players
    const updatedPlayers = [...gameState.players];
    [updatedPlayers[currentIndex], updatedPlayers[newIndex]] =
      [updatedPlayers[newIndex], updatedPlayers[currentIndex]];

    const action: GameAction = {
      id: crypto.randomUUID(),
      type: 'MOVE_PLAYER',
      timestamp: Date.now(),
      turnNumber: gameState.turnNumber,
      data: {
        playerId,
        direction,
        fromIndex: currentIndex,
        toIndex: newIndex
      }
    };

    setGameState({
      ...gameState,
      players: updatedPlayers,
      history: [...gameState.history, action]
    });
  };

  const renamePlayer = (playerId: string, newName: string) => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    const updatedPlayers = gameState.players.map(p =>
      p.id === playerId ? { ...p, name: newName } : p
    );

    const action: GameAction = {
      id: crypto.randomUUID(),
      type: 'RENAME_PLAYER',
      timestamp: Date.now(),
      turnNumber: gameState.turnNumber,
      data: {
        playerId,
        oldName: player.name,
        newName
      }
    };

    setGameState({
      ...gameState,
      players: updatedPlayers,
      history: [...gameState.history, action]
    });
  };

  return {
    startGame,
    recordRoll,
    bankPoints,
    undoLastAction,
    editPlayerScore,
    resetGame,
    addPlayer,
    movePlayer,
    renamePlayer
  };
};
