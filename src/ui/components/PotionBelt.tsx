import { motion } from "framer-motion";
import { type PotionDefinition } from "../../engine/potions/types";

interface PotionIconProps {
  potion: PotionDefinition;
  onSelect: () => void;
}

const PotionIcon = ({ potion, onSelect }: PotionIconProps) => (
  <motion.div
    className="potion-icon"
    onClick={onSelect}
    whileHover={{ scale: 1.1 }}
  >
    {/* Placeholder for potion image */}
    <div className="potion-icon-img">{potion.name.charAt(0)}</div>
  </motion.div>
);

export default function PotionBelt({
  potions,
  onPotionSelect,
}: {
  potions: PotionDefinition[];
  onPotionSelect: (potion: PotionDefinition) => void;
}) {
  return (
    <div className="potion-belt">
      {potions.map((potion, index) => (
        <PotionIcon
          key={`${potion.id}-${index}`}
          potion={potion}
          onSelect={() => onPotionSelect(potion)}
        />
      ))}
    </div>
  );
}
