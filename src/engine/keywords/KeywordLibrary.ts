export interface KeywordDefinition {
  id: string; // e.g., 'vulnerable'
  name: string; // e.g., 'Vulnerable'
  description: string;
}

export const KeywordLibrary: Record<string, KeywordDefinition> = {
  strength: {
    id: "strength",
    name: "Strength",
    description: "Increases Attack damage by this amount.",
  },
  vulnerable: {
    id: "vulnerable",
    name: "Vulnerable",
    description: "Target takes 50% more damage from Attacks.",
  },
  block: {
    id: "block",
    name: "Block",
    description:
      "Prevents damage from the next Attack(s). Removed at the start of your turn.",
  },
  exhaust: {
    id: "exhaust",
    name: "Exhaust",
    description:
      "This card is removed from your deck for the rest of the combat.",
  },
  ethereal: {
    id: "ethereal",
    name: "Ethereal",
    description:
      "If this card is in your hand at the end of your turn, Exhaust it.",
  },
  barricade: {
    id: "barricade",
    name: "Barricade",
    description: "Block is not removed at the start of your turn.",
  },
  demon_form: {
    id: "demon_form",
    name: "Demon Form",
    description: "At the start of your turn, gain Strength.",
  },
  unplayable: {
    id: "unplayable",
    name: "Unplayable",
    description: "Cannot be played from your hand.",
  },
  brutality: {
    id: "brutality",
    name: "Brutality",
    description: "At the start of your turn, lose 1 HP and draw 1 card.",
  },
  immolate: {
    id: "immolate",
    name: "Immolate",
    description: "Deal damage to ALL enemies. Add a Burn to your discard pile.",
  },
  weak: {
    id: "weak",
    name: "Weak",
    description: "Attacks deal 25% less damage.",
  },
};
