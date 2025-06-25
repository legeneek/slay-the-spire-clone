import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameController } from "../../../engine/GameController";
import { type CardDefinition } from "../../../engine/cards/Card";
import { CardFactory } from "../../../engine/cards/Card"; // Import the factory
import CardComponent from "../CardComponent"; // The one true CardComponent

export default function CardChoiceReward() {
  const [cardChoices, setCardChoices] = useState<CardDefinition[]>([]);
  const [hasBeenChosen, setHasBeenChosen] = useState(false);
  useEffect(() => {
    // Generate the choices only once.
    if (cardChoices.length === 0) {
      setCardChoices(GameController.generateCardChoices());
    }
  }, [cardChoices]);

  if (hasBeenChosen) return null;

  const handleCardSelect = (cardId: string) => {
    if (hasBeenChosen) return; // Prevent multiple clicks

    GameController.claimCardReward(cardId);
    setHasBeenChosen(true); // Mark that a choice has been made
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15, // A nice stagger effect for the cards appearing
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="card-choice-container">
      <h3>Choose a Card</h3>
      <motion.div
        className="card-choices"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {cardChoices.map((cardDef) => (
            <motion.div key={cardDef.id} variants={itemVariants}>
              <CardComponent
                // We need to create a temporary CardInstance for the component
                card={CardFactory.createInstance(cardDef)}
                context={{
                  type: "reward",
                  onSelect: () => handleCardSelect(cardDef.id),
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
