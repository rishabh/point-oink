import { useState } from 'react';
import { useGame } from '../../context/GameProvider';
import { PIG_POSITIONS } from '../../constants/pigPositions';
import { PigPosition } from '../../types/pigPositions';
import styles from './PigPositionButtons.module.css';

type BasicPosition = 'SIDE' | 'BACK' | 'FEET' | 'SNOUT' | 'EAR';

const PigPositionButtons = () => {
  const { gameState, actions } = useGame();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstPig, setFirstPig] = useState<BasicPosition | null>(null);
  const [secondPig, setSecondPig] = useState<BasicPosition | null>(null);

  const basicPositions: { id: BasicPosition; label: string; points: string }[] = [
    { id: 'SIDE', label: 'Side', points: 'Flat' },
    { id: 'BACK', label: 'Back', points: '5 pts' },
    { id: 'FEET', label: 'Feet', points: '5 pts' },
    { id: 'SNOUT', label: 'Snout', points: '10 pts' },
    { id: 'EAR', label: 'Ear', points: '15 pts' },
  ];

  const mapToPosition = (pig1: BasicPosition, pig2: BasicPosition): PigPosition | null => {
    // Both on side - default to Sider (1 pt)
    if (pig1 === 'SIDE' && pig2 === 'SIDE') {
      return 'SIDER';
    }

    // One on side, other scoring
    if (pig1 === 'SIDE') {
      const mapping: Record<string, PigPosition> = {
        BACK: 'RAZORBACK',
        FEET: 'TROTTER',
        SNOUT: 'SNOUTER',
        EAR: 'LEANING_JOWLER',
      };
      return mapping[pig2] || null;
    }

    if (pig2 === 'SIDE') {
      const mapping: Record<string, PigPosition> = {
        BACK: 'RAZORBACK',
        FEET: 'TROTTER',
        SNOUT: 'SNOUTER',
        EAR: 'LEANING_JOWLER',
      };
      return mapping[pig1] || null;
    }

    // Doubles
    if (pig1 === pig2) {
      const mapping: Record<string, PigPosition> = {
        BACK: 'DOUBLE_RAZORBACK',
        FEET: 'DOUBLE_TROTTER',
        SNOUT: 'DOUBLE_SNOUTER',
        EAR: 'DOUBLE_LEANING_JOWLER',
      };
      return mapping[pig1] || null;
    }

    // Mixed combos - order doesn't matter
    const combo = [pig1, pig2].sort().join('_');
    const mapping: Record<string, PigPosition> = {
      BACK_FEET: 'RAZORBACK_TROTTER',
      BACK_SNOUT: 'RAZORBACK_SNOUTER',
      BACK_EAR: 'RAZORBACK_JOWLER',
      FEET_SNOUT: 'TROTTER_SNOUTER',
      EAR_FEET: 'TROTTER_JOWLER',
      EAR_SNOUT: 'SNOUTER_JOWLER',
    };
    return mapping[combo] || null;
  };

  const handleFirstSelection = (position: BasicPosition) => {
    setFirstPig(position);
    setStep(2);
  };

  const handleSecondSelection = (position: BasicPosition) => {
    if (!firstPig) return;

    setSecondPig(position);

    const result = mapToPosition(firstPig, position);

    if (result) {
      // Show both selections briefly before recording
      setTimeout(() => {
        actions.recordRoll(result);
        resetSelection();
      }, 800);
    }
  };

  const getResultDisplay = () => {
    if (!firstPig || !secondPig) return null;

    const result = mapToPosition(firstPig, secondPig);
    if (!result) return null;

    const positionConfig = PIG_POSITIONS.find(p => p.id === result);
    if (!positionConfig) return null;

    return {
      label: positionConfig.label,
      points: positionConfig.points,
      isPigOut: positionConfig.isPigOut,
    };
  };

  const handleSpecialPosition = (position: PigPosition) => {
    actions.recordRoll(position);
    if (position === 'PIG_OUT') {
      resetSelection();
    }
  };

  const resetSelection = () => {
    setFirstPig(null);
    setSecondPig(null);
    setStep(1);
  };

  return (
    <div className={styles.container}>
      <button
        onClick={() => handleSpecialPosition('PIG_OUT')}
        className={styles.pigOutButton}
        disabled={gameState.gameEnded}
        title="Pig Out - Both pigs on opposite sides"
      >
        <span className={styles.pigOutArrow}>→</span>
        <span className={styles.pigOutText}>Pig Out</span>
      </button>

      <div className={styles.header}>
        <h3 className={styles.stepTitle}>
          {step === 1 ? 'Select First Pig Position:' : 'Select Second Pig Position:'}
        </h3>
      </div>

      <div className={styles.selectedPositionSpace}>
        {step === 2 && firstPig && (
          <>
            <div className={styles.selectedPositionBox}>
              <button
                onClick={resetSelection}
                className={styles.removeButton}
                aria-label="Clear selection"
              >
                ✕
              </button>
              <span className={styles.label}>
                {basicPositions.find(p => p.id === firstPig)?.label}
              </span>
              <span className={styles.points}>
                {basicPositions.find(p => p.id === firstPig)?.points}
              </span>
            </div>
            {secondPig && (
              <>
                <div className={styles.selectedPositionBox}>
                  <span className={styles.label}>
                    {basicPositions.find(p => p.id === secondPig)?.label}
                  </span>
                  <span className={styles.points}>
                    {basicPositions.find(p => p.id === secondPig)?.points}
                  </span>
                </div>
                {getResultDisplay() && (
                  <div className={`${styles.resultBox} ${getResultDisplay()?.isPigOut ? styles.pigOut : ''}`}>
                    <span className={styles.resultArrow}>→</span>
                    <div className={styles.resultContent}>
                      <span className={styles.label}>
                        {getResultDisplay()?.label}
                      </span>
                      <span className={styles.points}>
                        {getResultDisplay()?.isPigOut
                          ? 'LOSE TURN!'
                          : `${getResultDisplay()?.points} pt${getResultDisplay()?.points !== 1 ? 's' : ''}`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className={styles.positionGrid}>
        {basicPositions.map((pos) => (
          <button
            key={pos.id}
            onClick={() => step === 1 ? handleFirstSelection(pos.id) : handleSecondSelection(pos.id)}
            className={styles.positionButton}
            disabled={gameState.gameEnded}
          >
            <span className={styles.label}>{pos.label}</span>
            <span className={styles.points}>{pos.points}</span>
          </button>
        ))}
      </div>

      <div className={styles.specialSection}>
        <h4 className={styles.specialTitle}>Special:</h4>
        <div className={styles.specialGrid}>
          <button
            onClick={() => handleSpecialPosition('OINKER')}
            className={`${styles.specialButton} ${styles.special}`}
            disabled={gameState.gameEnded}
          >
            <span className={styles.label}>Oinker</span>
            <span className={styles.points}>Lose All!</span>
          </button>
          <button
            onClick={() => handleSpecialPosition('PIGGYBACK')}
            className={`${styles.specialButton} ${styles.special}`}
            disabled={gameState.gameEnded}
          >
            <span className={styles.label}>Piggyback</span>
            <span className={styles.points}>Eliminated!</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PigPositionButtons;
