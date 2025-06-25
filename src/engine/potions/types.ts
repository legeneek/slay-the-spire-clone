import { TargetType } from "../types/enums";
import { Entity } from "../entities/Entity";
import { type CombatState } from "../combat/types";

export interface PotionDefinition {
  id: string;
  name: string;
  description: string;
  targetType: TargetType;
  effect: (context: {
    caster: Entity;
    target?: Entity;
    combat: CombatState;
  }) => void;
}
