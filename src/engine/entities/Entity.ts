import { v4 as uuidv4 } from "uuid";
import type { StatusEffectInstance } from "../effects/types";
import { StatusEffectLibrary } from "../effects/StatusEffectLibrary";

// Renaming the old interface to be more specific
export type { StatusEffectInstance };

export abstract class Entity {
  public readonly id: string;
  public name: string;
  public hp: number;
  public maxHp: number;
  public block: number;
  public statusEffects: StatusEffectInstance[];

  constructor(name: string, maxHp: number) {
    this.id = uuidv4();
    this.name = name;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.block = 0;
    this.statusEffects = [];
  }

  // NEW: Method to get the total amount of a given status effect.
  getStatusEffectAmount(effectId: string): number {
    const effect = this.statusEffects.find(
      (se) => se.definition.id === effectId
    );
    return effect ? effect.amount : 0;
  }

  // NEW: Method to apply a status effect.
  applyStatusEffect(effectId: string, amount: number, duration?: number) {
    const definition = StatusEffectLibrary[effectId];
    if (!definition) {
      console.error(`Status effect with id ${effectId} not found.`);
      return;
    }

    const existingEffect = this.statusEffects.find(
      (se) => se.definition.id === effectId
    );

    if (existingEffect) {
      // Stack existing effect
      existingEffect.amount += amount;
      if (duration && existingEffect.duration) {
        existingEffect.duration += duration;
      } else if (duration) {
        existingEffect.duration = duration;
      }
    } else {
      // Add new effect
      this.statusEffects.push({
        definition,
        amount,
        duration,
      });
    }
  }

  // UPDATED: takeDamage to account for Vulnerable.
  // We'll pass the calculated damage, not the base damage.
  takeDamage(calculatedDamage: number): number {
    const damageToDeal = Math.max(0, calculatedDamage - this.block);
    this.block = Math.max(0, this.block - calculatedDamage);
    this.hp = Math.max(0, this.hp - damageToDeal);
    return damageToDeal;
  }

  addBlock(amount: number) {
    this.block += amount;
  }

  isAlive(): boolean {
    return this.hp > 0;
  }
}
