import { useMemo } from "react";
import { motion } from "framer-motion";
import { type CardInstance } from "../../../engine/cards/Card";
import { useCombatUIStore } from "../../state/uiState";

const countCardTypes = (pile: CardInstance[]): Record<string, number> => {
  return pile.reduce((acc, card) => {
    const type = card.definition.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export default function DeckInfo({
  drawPile,
  discardPile,
}: {
  drawPile: CardInstance[];
  discardPile: CardInstance[];
}) {
  const { openDeckView } = useCombatUIStore();
  const drawPileCounts = useMemo(() => countCardTypes(drawPile), [drawPile]);
  const discardPileCounts = useMemo(
    () => countCardTypes(discardPile),
    [discardPile]
  );

  return (
    <div className="deck-info-group">
      <motion.div
        className="deck-pile-wrapper"
        whileHover="hover"
        onClick={() => openDeckView("DRAW")}
      >
        <span>Draw: {drawPile.length}</span>
        <motion.div
          className="info-tooltip deck-tooltip"
          initial={{ opacity: 0, y: 10 }}
          variants={{ hover: { opacity: 1, y: 0 } }}
        >
          <strong>Draw Pile</strong>
          {Object.entries(drawPileCounts).map(([type, count]) => (
            <div key={type}>
              {type}: {count}
            </div>
          ))}
          {Object.keys(drawPileCounts).length === 0 && <p>Empty</p>}
        </motion.div>
      </motion.div>
      <motion.div
        className="deck-pile-wrapper"
        whileHover="hover"
        onClick={() => openDeckView("DISCARD")}
      >
        <span>Discard: {discardPile.length}</span>
        <motion.div
          className="info-tooltip deck-tooltip"
          initial={{ opacity: 0, y: 10 }}
          variants={{ hover: { opacity: 1, y: 0 } }}
        >
          <strong>Discard Pile</strong>
          {Object.entries(discardPileCounts).map(([type, count]) => (
            <div key={type}>
              {type}: {count}
            </div>
          ))}
          {Object.keys(discardPileCounts).length === 0 && <p>Empty</p>}
        </motion.div>
      </motion.div>
    </div>
  );
}
