import { CardType } from "../types/enums";
import type { RelicDefinition } from "./types";

export const RelicLibrary: Record<string, RelicDefinition> = {
  burning_blood: {
    id: "burning_blood",
    name: "Burning Blood",
    description: "At the end of combat, heal 6 HP.",
    onCombatEnd: (context) => {
      // Heal for 6, but not beyond max HP
      context.player.hp = Math.min(context.player.maxHp, context.player.hp + 6);
    },
  },
  vajra: {
    id: "vajra",
    name: "Vajra",
    description: "At the start of each combat, gain 1 Strength.",
    onCombatStart: (context) => {
      context.player.applyStatusEffect("strength", 1);
    },
  },
  pen_nib: {
    id: "pen_nib",
    name: "Pen Nib",
    description: "Every 10th Attack you play deals double damage.",
    onCombatStart: (context) => {
      // Find the specific instance of this relic on the player
      const penNibInstance = context.player.relics.find(
        (r) => r.definition.id === "pen_nib"
      );
      if (penNibInstance) {
        // Initialize its counter at the start of combat
        penNibInstance.instanceState.attackCounter = 0;
      }
    },
    onCardPlayed: (context) => {
      const penNibInstance = context.player.relics.find(
        (r) => r.definition.id === "pen_nib"
      );
      if (
        penNibInstance &&
        context.cardPlayed?.definition.type === CardType.ATTACK
      ) {
        penNibInstance.instanceState.attackCounter =
          (penNibInstance.instanceState.attackCounter || 0) + 1;
      }
    },
  },
  akabeko: {
    id: "akabeko",
    name: "Akabeko",
    description: "Your first Attack each combat deals 8 additional damage.",
    onCombatStart: (context) => {
      // We can model this with a temporary status effect.
      context.player.applyStatusEffect("akabeko_charge", 1);
    },
    onCardPlayed: (context) => {
      if (context.cardPlayed?.definition.type === "ATTACK") {
        // Find and remove the charge effect
        const chargeIndex = context.player.statusEffects.findIndex(
          (se) => se.definition.id === "akabeko_charge"
        );
        if (chargeIndex > -1) {
          context.player.statusEffects.splice(chargeIndex, 1);
        }
      }
    },
  },
};
