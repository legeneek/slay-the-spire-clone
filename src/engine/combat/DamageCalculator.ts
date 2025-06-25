import { Entity } from "../entities/Entity";
import { Player } from "../entities/Player";

export const DamageCalculator = {
  calculateAttackDamage(
    baseDamage: number,
    caster: Entity,
    target: Entity
  ): number {
    let finalDamage = baseDamage;

    // 1. Apply Caster's Strength
    finalDamage += caster.getStatusEffectAmount("strength");

    const akabekoCharge = caster.getStatusEffectAmount("akabeko_charge");
    if (akabekoCharge > 0) {
      finalDamage += 8;
    }

    // 2. Apply Caster's Weak (not implemented yet, but showing where it would go)
    if (caster.getStatusEffectAmount("weak") > 0) {
      finalDamage *= 0.75;
    }

    if (caster instanceof Player) {
      // Ensure the caster is the player
      const penNib = caster.relics.find((r) => r.definition.id === "pen_nib");
      if (penNib && penNib.instanceState.attackCounter === 10) {
        finalDamage *= 2;
        // Reset the counter after it procs
        penNib.instanceState.attackCounter = 0;
      }
    }

    // 3. Apply Target's Vulnerable
    if (target.getStatusEffectAmount("vulnerable") > 0) {
      finalDamage *= 1.5;
    }

    // Return a whole number
    return Math.floor(finalDamage);
  },
};
