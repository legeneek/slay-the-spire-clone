import type { RelicDefinition } from "../relics/types";

export interface GoldReward {
  type: "GOLD";
  amount: number;
}

export interface CardChoiceReward {
  type: "CARD_CHOICE";
  // We don't store the cards here, we generate them when the player views the reward screen
}

export interface RelicReward {
  type: "RELIC";
  relic: RelicDefinition;
}

export type Reward = GoldReward | CardChoiceReward | RelicReward;
