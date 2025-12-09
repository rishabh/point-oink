import { useState } from 'react';
import styles from './PlayerNameEditor.module.css';

interface PlayerNameEditorProps {
  title: string;
  initialName?: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

const PlayerNameEditor: React.FC<PlayerNameEditorProps> = ({
  title,
  initialName = '',
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Player name cannot be empty');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Player name is too long (max 50 characters)');
      return;
    }

    onSave(trimmedName);
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
        <h3 className={styles.title}>{title}</h3>

        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          className={styles.input}
          placeholder="Enter player name"
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

export default PlayerNameEditor;
