import { motion } from "framer-motion";
import type { StatusEffectInstance } from "../../../engine/effects/types";

const getEffectIcon = (id: string) => {
  // In a real project, these would be actual icons (e.g., SVGs)
  const iconMap: Record<string, string> = {
    vulnerable: "💥",
    strength: "💪",
    poison: "☠️",
    barricade_power: "🛡️",
    demon_form_power: "😈",
  };
  return iconMap[id] || "?";
};

export default function StatusEffectIcon({
  effect,
}: {
  effect: StatusEffectInstance;
}) {
  return (
    <motion.div className="status-effect-icon-wrapper" whileHover="hover">
      <div
        className={`status-effect-icon ${effect.definition.type.toLowerCase()}`}
      >
        {getEffectIcon(effect.definition.id)}
        <span className="effect-amount">{effect.amount}</span>
      </div>
      <motion.div
        className="info-tooltip"
        initial={{ opacity: 0, y: 10 }}
        variants={{ hover: { opacity: 1, y: 0 } }}
      >
        <strong>{effect.definition.name}</strong>
        <p>{effect.definition.description(effect)}</p>
      </motion.div>
    </motion.div>
  );
}
