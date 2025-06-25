import { Entity } from "./Entity";
import { DamageCalculator } from "../combat/DamageCalculator";
import type { Player } from "./Player";
import { sample } from "lodash-es";

export enum IntentType {
  ATTACK = "ATTACK",
  ATTACK_DEFEND = "ATTACK_DEFEND",
  DEFEND = "DEFEND",
  DEFEND_BUFF = "DEFEND_BUFF",
  BUFF = "BUFF",
  DEBUFF = "DEBUFF",
  UNKNOWN = "UNKNOWN",
  ATTACK_DEBUFF = "ATTACK_DEBUFF",
}

export interface EnemyMove {
  name: string;
  intentType: IntentType;
  // Base damage/block values, if applicable
  baseDamage?: number;
  baseBlock?: number;
  // Function to get the description dynamically
  description: (self: Enemy) => string;
  execute: (self: Enemy, target: Entity) => void;
}

export interface EnemyIntent {
  move: EnemyMove;
  // Calculated, final values for UI display
  displayDamage?: number;
  displayBlock?: number;
}

export class Enemy extends Entity {
  public intent: EnemyIntent | null;
  private moveset: EnemyMove[];
  public customState: Record<string, any>;

  constructor(name: string, maxHp: number, moveset: EnemyMove[]) {
    super(name, maxHp);
    this.moveset = moveset;
    this.intent = null;
    this.customState = {};
  }

  determineNextMove(player: Player) {
    // Pass the player as a potential target
    // For now, just pick a random move
    const nextMove = sample(this.moveset)!;

    let displayDamage: number | undefined;
    if (nextMove.baseDamage) {
      // Calculate the damage for the UI, including the enemy's Strength
      displayDamage = DamageCalculator.calculateAttackDamage(
        nextMove.baseDamage,
        this,
        player
      );
    }

    this.intent = {
      move: nextMove,
      displayDamage: displayDamage,
      displayBlock: nextMove.baseBlock,
    };
  }
}
