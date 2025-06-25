import { v4 as uuidv4 } from "uuid";
import { CardColor, CardType, TargetType } from "../types/enums";
import { Entity } from "../entities/Entity";
import type { CombatState } from "../combat/types"; // Will define soon
import type { CombatManager } from "../combat/CombatManager";
// Will define soon

// The static blueprint of a card
export interface CardDefinition {
  tags?: any;
  id: string; // e.g., 'strike', 'defend'
  name: string;
  cost: number;
  color: CardColor;
  type: CardType;
  targetType: TargetType;
  description: (state: {
    card: CardInstance;
    combat?: CombatState | null;
  }) => string;
  effect: (context: {
    caster: Entity;
    target?: Entity;
    card: CardInstance;
    combat: CombatState;
    manager: typeof CombatManager;
  }) => void;
  upgradedId?: string; // e.g., 'strike_plus'
}

// A unique instance of a card in the game (in a deck, hand, etc.)
export interface CardInstance {
  instanceId: string; // Unique ID for this specific copy
  definition: CardDefinition;
  isUpgraded: boolean;
  // other mutable properties, e.g., cost reduction for this combat
  currentCost: number;
}

// A factory to create new instances from definitions
export class CardFactory {
  static createInstance(definition: CardDefinition): CardInstance {
    return {
      instanceId: uuidv4(),
      definition,
      isUpgraded: false,
      currentCost: definition.cost,
    };
  }
}
