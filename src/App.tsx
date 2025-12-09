import { GameProvider, useGame } from './context/GameProvider';
import { ThemeProvider } from './context/ThemeProvider';
import GameSetup from './components/GameSetup/GameSetup';
import PlayerSidebar from './components/PlayerSidebar/PlayerSidebar';
import GameControls from './components/GameControls/GameControls';
import GameLog from './components/GameLog/GameLog';
import WinnerModal from './components/WinnerModal/WinnerModal';
import DarkModeToggle from './components/DarkModeToggle/DarkModeToggle';
import styles from './App.module.css';

function GameBoard() {
  const { gameState } = useGame();

  if (!gameState.gameStarted) {
    return <GameSetup />;
  }

  return (
    <div className={styles.gameBoard}>
      <PlayerSidebar />
      <GameControls />
      <GameLog />
      {gameState.gameEnded && <WinnerModal />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <div className={styles.app}>
          <DarkModeToggle />
          <GameBoard />
        </div>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
