import { motion } from "framer-motion";
import { type CardDefinition } from "../../engine/cards/Card";

interface DisplayCardProps {
  card: CardDefinition;
  onClick?: () => void;
}

export default function DisplayCard({ card, onClick }: DisplayCardProps) {
  return (
    <motion.div
      className="card"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      whileHover={
        onClick
          ? { scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }
          : {}
      }
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div>{card.name}</div>
      <p>{card.description({} as any)}</p>{" "}
      {/* Note: Description may need context, simplify for now */}
    </motion.div>
  );
}
