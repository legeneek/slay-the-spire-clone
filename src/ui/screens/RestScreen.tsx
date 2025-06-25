import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameEngine } from "../hooks/useGameEngine";
import { GameController } from "../../engine/GameController";
import CardComponent from "../components/CardComponent";

export default function RestScreen() {
  const { player } = useGameEngine();
  // 'CHOICE' | 'SMITHING'
  const [view, setView] = useState<"CHOICE" | "SMITHING">("CHOICE");

  if (!player) return null;

  const renderChoiceView = () => (
    <motion.div
      key="choice"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rest-choices"
    >
      <div className="rest-option" onClick={() => GameController.rest()}>
        <h3>Rest</h3>
        <p>Heal for 30% of your max HP.</p>
      </div>
      <div className="rest-option" onClick={() => setView("SMITHING")}>
        <h3>Smith</h3>
        <p>Upgrade a card in your deck.</p>
      </div>
    </motion.div>
  );

  const renderSmithView = () => (
    <motion.div
      key="smith"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="smithing-view"
    >
      <h2>Select a Card to Upgrade</h2>
      <div className="deck-grid">
        {player.deck.map((card) => {
          const canUpgrade = !card.isUpgraded && !!card.definition.upgradedId;

          return (
            <CardComponent
              key={card.instanceId}
              card={card}
              context={{
                type: "deck-view",
                onSelect: () => {
                  if (canUpgrade) {
                    GameController.smith(card.instanceId);
                  }
                },
                isSelectable: canUpgrade,
              }}
            />
          );
        })}
      </div>
      <button onClick={() => setView("CHOICE")}>Back</button>
    </motion.div>
  );

  return (
    <div className="rest-screen">
      <AnimatePresence mode="wait">
        {view === "CHOICE" ? renderChoiceView() : renderSmithView()}
      </AnimatePresence>
    </div>
  );
}
