import { useGame } from '../../context/GameProvider';
import { PIG_POSITIONS } from '../../constants/pigPositions';
import { GameAction } from '../../types/game';
import styles from './GameLog.module.css';

const GameLog = () => {
  const { gameState } = useGame();

  const getPlayerName = (playerId: string): string => {
    const player = gameState.players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown';
  };

  const getPositionLabel = (positionId: string): string => {
    const position = PIG_POSITIONS.find(p => p.id === positionId);
    return position ? position.label : positionId;
  };

  const getActionPlayerId = (action: GameAction): string | null => {
    switch (action.type) {
      case 'ROLL':
        return action.data.playerId || null;
      case 'BANK':
      case 'EDIT_SCORE':
        return action.data.playerId;
      case 'END_GAME':
        return action.data.winnerId;
      default:
        return null;
    }
  };

  const formatLogEntry = (action: GameAction) => {
    switch (action.type) {
      case 'START_GAME':
        return {
          text: `Game started with ${action.data.playerNames.join(', ')}`,
          icon: '🎮',
          type: 'game'
        };

      case 'ROLL': {
        const roll = action.data.roll;
        const position = PIG_POSITIONS.find(p => p.id === roll.position);

        if (!position) return null;

        if (position.isPigOut) {
          return {
            text: `Pig Out! Lost turn`,
            icon: '❌',
            type: 'pigout'
          };
        }

        if (position.isSpecial) {
          if (roll.position === 'OINKER') {
            return {
              text: `Oinker! Score reset to 0`,
              icon: '💥',
              type: 'special'
            };
          }
          if (roll.position === 'PIGGYBACK') {
            return {
              text: 'Piggyback! Eliminated from game',
              icon: '🚫',
              type: 'special'
            };
          }
        }

        return {
          text: `${getPositionLabel(roll.position)} (+${roll.points} pts)`,
          icon: '🎲',
          type: 'roll'
        };
      }

      case 'BANK': {
        return {
          text: `Banked ${action.data.pointsBanked} pts → ${action.data.newScore} total`,
          icon: '💰',
          type: 'bank'
        };
      }

      case 'EDIT_SCORE': {
        return {
          text: `Score edited to ${action.data.newScore}`,
          icon: '✏️',
          type: 'edit'
        };
      }

      case 'END_GAME': {
        const winnerName = getPlayerName(action.data.winnerId);
        return {
          text: `${winnerName} wins the game!`,
          icon: '🏆',
          type: 'game'
        };
      }

      default:
        return null;
    }
  };

  // Group actions by player turns
  const groupActionsByPlayer = (history: GameAction[]) => {
    const groups: { playerId: string | null; actions: GameAction[] }[] = [];
    let currentGroup: GameAction[] = [];
    let currentPlayerId: string | null = null;

    for (const action of history) {
      const actionPlayerId = getActionPlayerId(action);

      // START_GAME actions are standalone
      if (action.type === 'START_GAME') {
        if (currentGroup.length > 0) {
          groups.push({ playerId: currentPlayerId, actions: currentGroup });
          currentGroup = [];
        }
        groups.push({ playerId: null, actions: [action] });
        currentPlayerId = null;
        continue;
      }

      // END_GAME actions are standalone
      if (action.type === 'END_GAME') {
        if (currentGroup.length > 0) {
          groups.push({ playerId: currentPlayerId, actions: currentGroup });
          currentGroup = [];
        }
        groups.push({ playerId: null, actions: [action] });
        currentPlayerId = null;
        continue;
      }

      // Group consecutive actions by same player
      if (actionPlayerId !== currentPlayerId) {
        if (currentGroup.length > 0) {
          groups.push({ playerId: currentPlayerId, actions: currentGroup });
        }
        currentGroup = [action];
        currentPlayerId = actionPlayerId;
      } else {
        currentGroup.push(action);
      }
    }

    // Push remaining group
    if (currentGroup.length > 0) {
      groups.push({ playerId: currentPlayerId, actions: currentGroup });
    }

    return groups.reverse(); // Show newest first
  };

  if (gameState.history.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Game Log</h3>
        <p className={styles.empty}>No actions yet</p>
      </div>
    );
  }

  const groupedActions = groupActionsByPlayer(gameState.history);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Game Log</h3>
      <div className={styles.logList}>
        {groupedActions.map((group, groupIndex) => {
          const isPlayerGroup = group.playerId !== null;
          const turnNumber = group.actions[0]?.turnNumber;

          return (
            <div key={groupIndex} className={styles.playerGroup}>
              {isPlayerGroup && (
                <div className={styles.playerHeader}>
                  <span className={styles.playerName}>{getPlayerName(group.playerId!)}</span>
                  <span className={styles.turnNumber}>Turn {turnNumber}</span>
                </div>
              )}
              {group.actions.map((action) => {
                const entry = formatLogEntry(action);
                if (!entry) return null;

                return (
                  <div
                    key={action.id}
                    className={`${styles.logEntry} ${styles[entry.type]}`}
                  >
                    <span className={styles.icon}>{entry.icon}</span>
                    <span className={styles.text}>{entry.text}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameLog;
