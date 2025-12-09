import { useState, useRef, useEffect } from 'react';
import { Player } from '../../types/game';
import styles from './PlayerItem.module.css';

interface PlayerItemProps {
  player: Player;
  onClick: () => void;
  onRename: (newName: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const PlayerItem: React.FC<PlayerItemProps> = ({
  player,
  onClick,
  onRename,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(player.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(player.name);
  };

  const handleSave = () => {
    const trimmedName = editValue.trim();
    if (trimmedName && trimmedName !== player.name) {
      onRename(trimmedName);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(player.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <div
      className={`${styles.playerItem} ${player.isActive ? styles.active : ''} ${isDragging ? styles.dragging : ''}`}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className={styles.mainContent} onClick={isEditing ? undefined : onClick}>
        <div className={styles.playerInfo}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className={styles.nameInput}
              maxLength={50}
            />
          ) : (
            <span
              className={styles.playerName}
              onClick={handleNameClick}
              title="Click to rename"
            >
              {player.name}
            </span>
          )}
          {player.isActive && <span className={styles.activeIndicator}>◀</span>}
        </div>
        <span className={styles.score}>{player.cumulativeScore}</span>
      </div>
    </div>
  );
};

export default PlayerItem;
