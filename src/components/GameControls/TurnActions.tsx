import { useGame } from '../../context/GameProvider';
import styles from './TurnActions.module.css';

const TurnActions = () => {
  const { gameState, actions, computed } = useGame();

  const turnPoints = gameState.currentTurn?.accumulatedPoints || 0;
  const hasPoints = turnPoints > 0;

  return (
    <div className={styles.container}>
      <div className={styles.turnInfo}>
        <span className={styles.label}>Turn Points:</span>
        <span className={styles.points}>{turnPoints}</span>
      </div>

      <div className={styles.actions}>
        <button
          onClick={actions.undoLastAction}
          disabled={!computed.canUndo}
          className={styles.undoButton}
        >
          Undo
        </button>
        <button
          onClick={actions.bankPoints}
          disabled={!hasPoints || gameState.gameEnded}
          className={styles.bankButton}
        >
          Bank Points
        </button>
      </div>
    </div>
  );
};

export default TurnActions;
