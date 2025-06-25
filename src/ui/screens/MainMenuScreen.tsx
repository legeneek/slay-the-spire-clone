import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GamePersistence } from "../../engine/persistence/GamePersistence";
import { useGameStore } from "../../engine/state/store";
import { GamePhase } from "../../engine/types/enums";

export default function MainMenuScreen() {
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setHasSave(GamePersistence.hasSaveFile());
  }, []);

  const handleContinue = () => {
    if (GamePersistence.loadGame()) {
      // The game state will update via the hook, and App.tsx will switch screens
    }
  };

  const handleNewRun = () => {
    useGameStore.getState().setGamePhase(GamePhase.CHARACTER_SELECT);
  };

  return (
    <motion.div
      className="main-menu-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1 } }}
    >
      <h1>Slay the Spire Clone</h1>
      <div className="menu-options">
        {hasSave && (
          <button className="menu-button" onClick={handleContinue}>
            Continue Run
          </button>
        )}
        <button className="menu-button" onClick={handleNewRun}>
          New Run
        </button>
      </div>
    </motion.div>
  );
}
