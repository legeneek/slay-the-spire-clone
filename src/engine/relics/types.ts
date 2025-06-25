import type { CombatState } from "../combat/types";
import { Player } from "../entities/Player";
import type { CardInstance } from "../cards/Card";

// This context object will be passed to every relic hook.
// We can add more properties as needed for different hooks.
export interface RelicHookContext {
  player: Player;
  combat?: CombatState;
  cardPlayed?: CardInstance;
  // ... future properties like 'damageDealt', 'enemyKilled', etc.
}

// The static definition of a Relic.
export interface RelicDefinition {
  id: string; // e.g., 'burning_blood'
  name: string;
  description: string;

  // Hooks for various game events. We will add more as needed.
  // A relic can implement any number of these.
  onCombatStart?: (context: RelicHookContext) => void;
  onTurnStart?: (context: RelicHookContext) => void;
  onCombatEnd?: (context: RelicHookContext) => void;
  onCardPlayed?: (context: RelicHookContext) => void;
}

export interface RelicInstance {
  definition: RelicDefinition;
  // A place for any state the relic needs, like counters.
  instanceState: Record<string, any>;
}
