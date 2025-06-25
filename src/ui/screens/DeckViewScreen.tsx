import { motion } from "framer-motion";
import CardComponent from "../components/CardComponent";
import { type CardInstance } from "../../engine/cards/Card";

interface DeckViewScreenProps {
  title: string;
  cards: CardInstance[];
  onClose: () => void;
}

export default function DeckViewScreen({
  title,
  cards,
  onClose,
}: DeckViewScreenProps) {
  return (
    <motion.div
      className="deck-view-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Allow closing by clicking the background
    >
      <motion.div
        className="deck-view-content"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the modal
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <div className="deck-view-header">
          <h2>
            {title} ({cards.length})
          </h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {cards.length > 0 ? (
          <div className="deck-grid">
            {cards.map((card) => (
              <CardComponent
                key={card.instanceId}
                card={card}
                context={{
                  type: "deck-view",
                  onSelect: () => {},
                  isSelectable: false,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-pile-message">This pile is empty.</div>
        )}
      </motion.div>
    </motion.div>
  );
}
