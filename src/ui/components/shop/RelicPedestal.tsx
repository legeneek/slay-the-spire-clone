import { motion } from "framer-motion";
import { type RelicDefinition } from "../../../engine/relics/types";

interface RelicPedestalProps {
  relic: RelicDefinition;
  cost: number;
  canAfford: boolean;
  onPurchase: () => void;
}

export default function RelicPedestal({
  relic,
  cost,
  canAfford,
  onPurchase,
}: RelicPedestalProps) {
  return (
    <motion.div
      className={`relic-pedestal ${canAfford ? "can-afford" : "cannot-afford"}`}
      onClick={canAfford ? onPurchase : undefined}
      whileHover={canAfford ? { y: -10, scale: 1.03 } : {}}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      layout
    >
      <div className="relic-display-area">
        <div className="relic-art-placeholder">{relic.name.charAt(0)}</div>
        <div className="relic-pedestal-base"></div>
      </div>

      <div className="relic-info">
        <strong className="relic-name">{relic.name}</strong>
        <p className="relic-description">{relic.description}</p>
      </div>

      <div className="relic-cost-plaque">
        <span>{cost}g</span>
      </div>
    </motion.div>
  );
}
