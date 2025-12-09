import { useGame } from '../../context/GameProvider';
import PigPositionButtons from './PigPositionButtons';
import TurnActions from './TurnActions';
import styles from './GameControls.module.css';

const GameControls = () => {
  const { computed } = useGame();

  return (
    <div className={styles.container}>
      <div className={styles.currentPlayer}>
        <h2 className={styles.playerName}>
          {computed.currentPlayer?.name || 'No active player'}
        </h2>
        <p className={styles.instruction}>Click a pig position to record the roll</p>
      </div>

      <PigPositionButtons />
      <TurnActions />
    </div>
  );
};

export default GameControls;
