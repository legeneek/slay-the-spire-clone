import PlayerStats from "./infobar/PlayerStats";
import RelicDisplay from "./infobar/RelicDisplay";
import { useCombatUIStore } from "../state/uiState";
import { useGameEngine } from "../hooks/useGameEngine";
import DeckInfo from "./infobar/DeckInfo";
import { motion } from "framer-motion";

export default function PlayerInfoBar() {
  const gameState = useGameEngine();
  const { openDeckView } = useCombatUIStore();

  const playerToDisplay = gameState.currentCombat?.player || gameState.player;

  if (!playerToDisplay) return null;

  return (
    <div className="player-info-bar-refactored">
      <PlayerStats player={playerToDisplay} />
      <RelicDisplay relics={playerToDisplay.relics} />

      {useGameEngine().phase === "COMBAT" ? (
        <DeckInfo
          drawPile={playerToDisplay.drawPile}
          discardPile={playerToDisplay.discardPile}
        />
      ) : (
        <div className="deck-info-group">
          <motion.div
            className="deck-pile-wrapper"
            onClick={() => openDeckView("DECK")}
          >
            <span>Deck: {playerToDisplay.deck.length}</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
