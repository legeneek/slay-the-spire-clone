import { motion } from "framer-motion";
import { type CardInstance } from "../../../engine/cards/Card";

const PowerIcon = ({ card }: { card: CardInstance }) => (
  <motion.div className="power-icon-wrapper" whileHover="hover">
    <div className="power-icon-art">{card.definition.name.charAt(0)}</div>
    <motion.div
      className="info-tooltip"
      initial={{ opacity: 0, y: 10 }}
      variants={{ hover: { opacity: 1, y: 0 } }}
    >
      <strong>{card.definition.name}</strong>
      <p>{card.definition.description({ card, combat: null })}</p>
    </motion.div>
  </motion.div>
);

export default function ActivePowersDisplay({
  powers,
}: {
  powers: CardInstance[];
}) {
  if (powers.length === 0) return null;

  return (
    <div className="active-powers-display">
      {powers.map((powerCard) => (
        <PowerIcon key={powerCard.instanceId} card={powerCard} />
      ))}
    </div>
  );
}
