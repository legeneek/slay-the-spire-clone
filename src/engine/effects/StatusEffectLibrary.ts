import type { StatusEffectDefinition } from "./types";

export const StatusEffectLibrary: Record<string, StatusEffectDefinition> = {
  strength: {
    id: "strength",
    name: "Strength",
    description: (instance) =>
      `Deal ${instance.amount} additional damage with Attacks.`,
    type: "BUFF",
    endOfTurnBehavior: "NONE",
  },
  vulnerable: {
    id: "vulnerable",
    name: "Vulnerable",
    description: (instance) =>
      `Take 50% more damage from Attacks for ${instance.duration} turn(s).`,
    type: "DEBUFF",
    endOfTurnBehavior: "DECREMENT_DURATION",
  },
  poison: {
    id: "poison",
    name: "Poison",
    description: (instance) =>
      `At the start of your turn, take ${instance.amount} damage.`,
    type: "DEBUFF",
    endOfTurnBehavior: "DECREMENT_AMOUNT",
  },
  // This is a special, "hidden" status used by cards like Flex.
  temp_strength: {
    id: "temp_strength",
    name: "Temporary Strength",
    description: (instance) =>
      `Loses ${instance.amount} Strength at the end of the turn.`,
    type: "DEBUFF", // It's a debuff because it's a pending negative effect
    endOfTurnBehavior: "NONE", // Special handling will remove it.
  },
  // We also need a status effect for our Akabeko relic from earlier
  akabeko_charge: {
    id: "akabeko_charge",
    name: "Akabeko",
    description: () => `Your next Attack deals 8 additional damage.`,
    type: "BUFF",
    endOfTurnBehavior: "NONE", // It's removed manually
  },
  nob_rage: {
    id: "nob_rage",
    name: "Anger",
    description: (instance) =>
      `Gains ${instance.amount} Strength whenever you play a Skill card.`,
    type: "BUFF",
    endOfTurnBehavior: "NONE",
  },
  asleep: {
    id: "asleep",
    name: "Asleep",
    description: () =>
      "This creature is asleep. Taking unblocked attack damage wakes it up.",
    type: "DEBUFF",
    endOfTurnBehavior: "NONE",
  },
  entangled: {
    id: "entangled",
    name: "Entangled",
    description: () => "You cannot play Attack cards this turn.",
    type: "DEBUFF",
    endOfTurnBehavior: "DECREMENT_DURATION",
  },
  barricade_power: {
    id: "barricade_power",
    name: "Barricade",
    description: () => `Block is not removed at the start of your turn.`,
    type: "BUFF",
    endOfTurnBehavior: "NONE",
  },
  demon_form_power: {
    id: "demon_form_power",
    name: "Demon Form",
    description: (instance) =>
      `At the start of your turn, gain ${instance.amount} Strength.`,
    type: "BUFF",
    endOfTurnBehavior: "NONE",
  },
  brutality_power: {
    id: "brutality_power",
    name: "Brutality",
    description: (instance) =>
      `At the start of your turn, lose 1 HP and draw ${instance.amount} card(s).`,
    type: "BUFF",
    endOfTurnBehavior: "NONE",
  },
  weak: {
    id: "weak",
    name: "Weak",
    description: (instance) =>
      `Deal 25% less damage with Attacks for ${instance.duration} turn(s).`,
    type: "DEBUFF",
    // Like Vulnerable, its duration decreases each turn.
    endOfTurnBehavior: "DECREMENT_DURATION",
  },
};
