import { useGame } from '../../context/GameProvider';
import styles from './WinnerModal.module.css';

const WinnerModal = () => {
  const { gameState, actions } = useGame();

  const winner = gameState.players.find(p => p.id === gameState.winnerId);

  if (!winner) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Game Over!</h2>
        <p className={styles.winnerName}>{winner.name} Wins!</p>
        <p className={styles.score}>Final Score: {winner.cumulativeScore}</p>

        <div className={styles.buttons}>
          <button onClick={actions.undoLastAction} className={styles.undoButton}>
            Undo
          </button>
          <button onClick={actions.resetGame} className={styles.newGameButton}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;
