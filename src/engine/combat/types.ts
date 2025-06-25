import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import type { EncounterType } from "../encounters/types";

export enum TurnPhase {
  PLAYER_TURN,
  ENEMY_TURN,
  COMBAT_OVER,
}

export interface CombatState {
  player: Player;
  enemies: Enemy[];
  turn: number; // Starts at 1
  phase: TurnPhase;
  encounterType: EncounterType;
}
