import { useState } from 'react';
import { useGame } from '../../context/GameProvider';
import PlayerItem from './PlayerItem';
import ScoreEditor from '../ScoreEditor/ScoreEditor';
import PlayerNameEditor from '../PlayerNameEditor/PlayerNameEditor';
import styles from './PlayerSidebar.module.css';

type EditorMode = 'score' | 'add' | null;

const PlayerSidebar = () => {
  const { gameState, actions } = useGame();
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);

  const handlePlayerClick = (playerId: string) => {
    setEditingPlayerId(playerId);
    setEditorMode('score');
  };

  const handleRename = (playerId: string, newName: string) => {
    actions.renamePlayer(playerId, newName);
  };

  const handleAddPlayer = () => {
    setEditorMode('add');
  };

  const handleCloseEditor = () => {
    setEditorMode(null);
    setEditingPlayerId(null);
  };

  const handleSaveScore = (newScore: number) => {
    if (editingPlayerId) {
      actions.editPlayerScore(editingPlayerId, newScore);
      handleCloseEditor();
    }
  };

  const handleSaveName = (newName: string) => {
    actions.addPlayer(newName);
    handleCloseEditor();
  };

  const handleDragStart = (playerId: string) => {
    setDraggedPlayerId(playerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (!draggedPlayerId) return;

    const draggedIndex = gameState.players.findIndex(p => p.id === draggedPlayerId);

    if (draggedIndex === targetIndex) return;

    // Calculate how many moves needed
    const direction = draggedIndex < targetIndex ? 'down' : 'up';
    const moves = Math.abs(targetIndex - draggedIndex);

    // Perform the moves
    let currentPlayerId = draggedPlayerId;
    for (let i = 0; i < moves; i++) {
      actions.movePlayer(currentPlayerId, direction);
    }

    setDraggedPlayerId(null);
  };

  const handleDragEnd = () => {
    setDraggedPlayerId(null);
  };

  const editingPlayer = gameState.players.find(p => p.id === editingPlayerId);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Players</h2>
      </div>

      <div className={styles.playerList}>
        {gameState.players.map((player, index) => (
          <PlayerItem
            key={player.id}
            player={player}
            onClick={() => handlePlayerClick(player.id)}
            onRename={(newName) => handleRename(player.id, newName)}
            onDragStart={() => handleDragStart(player.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            isDragging={draggedPlayerId === player.id}
          />
        ))}
      </div>

      <div className={styles.actions}>
        {gameState.gameStarted && (
          <button onClick={handleAddPlayer} className={styles.addButton}>
            Add Player
          </button>
        )}
        <button onClick={actions.resetGame} className={styles.resetButton}>
          New Game
        </button>
      </div>

      {editorMode === 'score' && editingPlayer && (
        <ScoreEditor
          player={editingPlayer}
          onSave={handleSaveScore}
          onCancel={handleCloseEditor}
        />
      )}

      {editorMode === 'add' && (
        <PlayerNameEditor
          title="Add New Player"
          onSave={handleSaveName}
          onCancel={handleCloseEditor}
        />
      )}
    </div>
  );
};

export default PlayerSidebar;
