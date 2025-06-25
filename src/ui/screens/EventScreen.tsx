import { motion } from "framer-motion";
import { useGameEngine } from "../hooks/useGameEngine";
import { GameController } from "../../engine/GameController";

export default function EventScreen() {
  const { player, activeEvent } = useGameEngine();

  if (!activeEvent || !player) return <div>Loading Event...</div>;

  return (
    <motion.div
      className="event-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2>{activeEvent.title}</h2>
      <p className="event-description">{activeEvent.description}</p>
      <div className="event-options">
        {activeEvent.options.map((option, index) => {
          const isVisible = option.condition ? option.condition(player) : true;
          if (!isVisible) return null;

          return (
            <motion.button
              key={index}
              onClick={() => GameController.resolveEventOption(index)}
              whileHover={{ scale: 1.05 }}
            >
              {option.text}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
