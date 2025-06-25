import { motion } from "framer-motion";
import { CharacterLibrary } from "../../engine/characters/CharacterLibrary";
import { GameController } from "../../engine/GameController";
import { GamePersistence } from "../../engine/persistence/GamePersistence";

export default function CharacterSelectionScreen() {
  const characters = Object.values(CharacterLibrary);

  const handleSelectCharacter = (characterId: string) => {
    GamePersistence.clearSave();
    // Step 1: Create all the game data in the background.
    GameController.initializeGame(characterId);
    // Step 2: Officially start the run and transition to the map.
    GameController.startGame();
    // The App.tsx router will now pick up the phase change and render the map.
  };

  return (
    <motion.div
      className="character-select-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>Choose Your Character</h2>
      <div className="character-list">
        {characters.map((char) => (
          <motion.div
            key={char.id}
            className="character-card"
            onClick={() => handleSelectCharacter(char.id)}
            whileHover={{ scale: 1.05, borderColor: "gold" }}
          >
            <h3>{char.name}</h3>
            <p className="char-title">{char.title}</p>
            <div className="char-details">
              <span>HP: {char.maxHp}</span>
              <span>
                Starting Relic: {char.startingRelicId.replace(/_/g, " ")}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
