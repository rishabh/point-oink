import { useState } from 'react';
import { Player } from '../../types/game';
import styles from './ScoreEditor.module.css';

interface ScoreEditorProps {
  player: Player;
  onSave: (newScore: number) => void;
  onCancel: () => void;
}

const ScoreEditor: React.FC<ScoreEditorProps> = ({ player, onSave, onCancel }) => {
  const [score, setScore] = useState(player.cumulativeScore.toString());
  const [error, setError] = useState('');

  const handleSave = () => {
    const newScore = parseInt(score, 10);

    if (isNaN(newScore)) {
      setError('Please enter a valid number');
      return;
    }

    if (newScore < 0) {
      setError('Score cannot be negative');
      return;
    }

    onSave(newScore);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Edit Score: {player.name}</h3>

        <input
          type="number"
          value={score}
          onChange={(e) => {
            setScore(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          className={styles.input}
          autoFocus
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreEditor;
