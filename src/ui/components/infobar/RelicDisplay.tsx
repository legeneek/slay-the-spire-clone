import { motion, AnimatePresence } from "framer-motion";
import {
  type RelicDefinition,
  type RelicInstance,
} from "../../../engine/relics/types";

// The new, improved RelicIcon component
const RelicIcon = ({ relic }: { relic: RelicDefinition }) => {
  return (
    <motion.div
      className="relic-slot"
      whileHover="hover"
      initial={{ scale: 0, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className="relic-art">{relic.name.charAt(0)}</div>
      <motion.div
        className="info-tooltip relic-tooltip"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        variants={{
          hover: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.2, ease: "easeOut" },
          },
        }}
      >
        <strong className="tooltip-title">{relic.name}</strong>
        <p className="tooltip-description">{relic.description}</p>
      </motion.div>
    </motion.div>
  );
};

// The main display component, now handling potential overflow
export default function RelicDisplay({ relics }: { relics: RelicInstance[] }) {
  // Let's say we show a maximum of 10 relics directly for UI cleanliness
  const maxVisibleRelics = 10;
  const visibleRelics = relics.slice(0, maxVisibleRelics);
  const hiddenRelicCount = relics.length - visibleRelics.length;

  return (
    <div className="relic-display-group">
      <AnimatePresence>
        {visibleRelics.map((relic) => (
          <RelicIcon key={relic.definition.id} relic={relic.definition} />
        ))}
      </AnimatePresence>

      {hiddenRelicCount > 0 && (
        <div className="relic-slot overflow-indicator">
          +{hiddenRelicCount}
          {/* We could add a tooltip here to list the hidden relics */}
        </div>
      )}
    </div>
  );
}
