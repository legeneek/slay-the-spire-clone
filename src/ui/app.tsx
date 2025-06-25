import { useGameEngine } from "./hooks/useGameEngine";
import { motion, AnimatePresence } from "framer-motion";
// Screen imports
import MainMenuScreen from "./screens/MainMenuScreen";
import CharacterSelectionScreen from "./screens/CharacterSelectionScreen";
import MapScreen from "./screens/MapScreen";
import CombatScreen from "./screens/CombatScreen";
import RewardScreen from "./screens/RewardScreen";
import RestScreen from "./screens/RestScreen";
import ShopScreen from "./screens/ShopScreen";
import EventScreen from "./screens/EventScreen";
// Component imports
import PlayerInfoBar from "./components/PlayerInfoBar";
import { useCombatUIStore } from "./state/uiState";
import DeckViewScreen from "./screens/DeckViewScreen";

function App() {
  const gameState = useGameEngine();
  const { isDeckViewOpen, deckViewInfo, closeDeckView } = useCombatUIStore();

  const renderScreen = () => {
    const screenProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };

    switch (gameState.phase) {
      case "MAIN_MENU":
        return (
          <motion.div key={gameState.phase} {...screenProps}>
            <MainMenuScreen />
          </motion.div>
        );
      case "CHARACTER_SELECT":
        return (
          <motion.div key={gameState.phase} {...screenProps}>
            <CharacterSelectionScreen />
          </motion.div>
        );
      case "MAP":
        return (
          <motion.div key={gameState.phase} {...screenProps}>
            <MapScreen />
          </motion.div>
        );
      case "COMBAT":
        return (
          <motion.div key={gameState.phase} {...screenProps}>
            <CombatScreen />
          </motion.div>
        );
      case "REWARD":
        return (
          <motion.div key={gameState.phase} {...screenProps}>
            <RewardScreen />
          </motion.div>
        );
      case "REST":
        return (
          <motion.div key={gameState.phase} {...screenProps}>
            <RestScreen />
          </motion.div>
        );
      case "SHOP":
        return (
          <motion.div key={gameState.phase} {...screenProps}>
            <ShopScreen />
          </motion.div>
        );
      case "EVENT":
        return (
          <motion.div key={gameState.phase} {...screenProps}>
            <EventScreen />
          </motion.div>
        );
      default:
        return <div key="loading">Loading...</div>;
    }
  };

  const showPlayerInfo =
    gameState.phase !== "MAIN_MENU" && gameState.phase !== "CHARACTER_SELECT";

  return (
    <div className="app-container">
      {showPlayerInfo && <PlayerInfoBar />}
      <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
      <AnimatePresence>
        {isDeckViewOpen && deckViewInfo && (
          <DeckViewScreen
            title={deckViewInfo.title}
            cards={deckViewInfo.cards}
            onClose={closeDeckView}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
