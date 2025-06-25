import { motion } from "framer-motion";
import { type CardInstance } from "../../engine/cards/Card";
import { CardType } from "../../engine/types/enums";
import DescriptionRenderer from "./DescriptionRenderer";

// Define the contexts in which a card can be displayed
type CardContext =
  | {
      type: "in-hand";
      onSelect: () => void;
      isPlayable: boolean;
      isSelected: boolean;
    }
  | { type: "deck-view"; onSelect: () => void; isSelectable: boolean }
  | { type: "reward"; onSelect: () => void }
  | { type: "shop-preview" }; // A static preview, not interactive

interface CardComponentProps {
  card: CardInstance;
  context: CardContext;
}

// Helper to get the banner color based on card type
const getBannerColor = (type: CardType) => {
  switch (type) {
    case CardType.ATTACK:
      return "#c0392b"; // Pomegranate
    case CardType.SKILL:
      return "#2980b9"; // Belize Hole
    case CardType.POWER:
      return "#8e44ad"; // Wisteria
    default:
      return "#7f8c8d"; // Asbestos
  }
};

export default function CardComponent({ card, context }: CardComponentProps) {
  const { definition } = card;
  const bannerColor = getBannerColor(definition.type);

  // Build a dynamic list of CSS classes based on the context
  const classNames = ["card-canonical"];
  if (context.type === "in-hand") {
    if (!context.isPlayable) classNames.push("is-unplayable");
    if (context.isSelected) classNames.push("is-selected");
    classNames.push("is-in-hand");
  }
  if (context.type === "deck-view" && !context.isSelectable) {
    classNames.push("is-disabled");
  }

  const motionProps =
    context.type === "in-hand"
      ? {
          whileHover: context.isPlayable
            ? { y: -20, scale: 1.08, zIndex: 100 }
            : {},
          // ... other animation props for hand context
        }
      : (context.type === "deck-view" || context.type === "reward") &&
        "onSelect" in context
      ? { whileHover: { scale: 1.05, boxShadow: "0 0 15px white" } }
      : {};

  return (
    <motion.div
      className={classNames.join(" ")}
      onClick={"onSelect" in context ? context.onSelect : undefined}
      {...motionProps}
      layout // Essential for smooth re-ordering animations
    >
      <div className="card-header" style={{ backgroundColor: bannerColor }}>
        <span className="card-cost">{definition.cost}</span>
        <span className="card-name">{definition.name}</span>
      </div>
      <div className="card-art-placeholder">
        {/* In a real game, an image would go here */}
      </div>
      <div className="card-description-box">
        <DescriptionRenderer
          text={definition.description({ card, combat: null })}
        />
      </div>
      <div
        className="card-type-banner"
        style={{ backgroundColor: bannerColor }}
      >
        {definition.type}
      </div>
    </motion.div>
  );
}
