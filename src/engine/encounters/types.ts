export enum EncounterType {
  NORMAL = "NORMAL",
  ELITE = "ELITE",
  BOSS = "BOSS",
}

// Defines a group of enemies for a specific fight.
export interface Encounter {
  id: string;
  type: EncounterType;
  // An array of enemy factory functions or IDs that will be used to create the enemies.
  enemies: string[]; // e.g., ['louse', 'jaw_worm']
}
