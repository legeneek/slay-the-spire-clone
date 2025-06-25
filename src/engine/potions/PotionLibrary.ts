import { type PotionDefinition } from "./types";
import { TargetType } from "../types/enums";

export const PotionLibrary: Record<string, PotionDefinition> = {
  healing_potion: {
    id: "healing_potion",
    name: "Healing Potion",
    description: "Heal for 10 HP.",
    targetType: TargetType.SELF,
    effect: ({ caster }) => {
      caster.hp = Math.min(caster.maxHp, caster.hp + 10);
    },
  },
  fire_potion: {
    id: "fire_potion",
    name: "Fire Potion",
    description: "Deal 20 damage to an enemy.",
    targetType: TargetType.SINGLE_ENEMY,
    effect: ({ target }) => {
      if (target) {
        target.takeDamage(20); // Potions often deal direct damage, ignoring block/buffs
      }
    },
  },
};
