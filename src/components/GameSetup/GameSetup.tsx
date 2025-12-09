import { useState } from 'react';
import { useGame } from '../../context/GameProvider';
import styles from './GameSetup.module.css';

const GameSetup = () => {
  const { actions } = useGame();
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [error, setError] = useState<string>('');

  const addPlayer = () => {
    setPlayerNames([...playerNames, '']);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
    setError('');
  };

  const handleStartGame = () => {
    const validNames = playerNames.filter(name => name.trim() !== '');

    if (validNames.length < 2) {
      setError('Please enter at least 2 player names');
      return;
    }

    actions.startGame(validNames);
  };

  return (
    <div className={styles.container}>
      <div className={styles.setupCard}>
        <h1 className={styles.title}>Point Oink</h1>
        <p className={styles.subtitle}>Enter player names to start</p>

        <div className={styles.playerInputs}>
          {playerNames.map((name, index) => (
            <div key={index} className={styles.inputRow}>
              <input
                type="text"
                value={name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className={styles.input}
              />
              {playerNames.length > 2 && (
                <button
                  onClick={() => removePlayer(index)}
                  className={styles.removeButton}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button onClick={addPlayer} className={styles.addButton}>
            + Add Player
          </button>
          <button onClick={handleStartGame} className={styles.startButton}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
