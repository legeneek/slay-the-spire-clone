import { motion } from "framer-motion";

export type FloatingTextColor = "damage" | "block" | "heal" | "poison";

interface FloatingTextProps {
  text: string | number;
  color: FloatingTextColor;
  // This ID is used by AnimatePresence to track the element
  id: string;
}

export default function FloatingText({ text, color, id }: FloatingTextProps) {
  return (
    <motion.div
      key={id}
      className={`floating-text ${color}`}
      initial={{ y: -20, opacity: 1, scale: 1.8 }}
      animate={{ y: -100, opacity: 0, scale: 1 }}
      exit={{ opacity: 0 }} // AnimatePresence handles the removal
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {/* Prepend icon for block */}
      {color === "block" && "🛡️"}
      {text}
    </motion.div>
  );
}
