import { type Encounter, EncounterType } from "./types";

export const EncounterLibrary: Record<string, Encounter> = {
  // --- Normal Encounters ---
  cultist_solo: {
    id: "cultist_solo",
    type: EncounterType.NORMAL,
    enemies: ["cultist"],
  },
  jaw_worm_solo: {
    id: "jaw_worm_solo",
    type: EncounterType.NORMAL,
    enemies: ["jaw_worm"],
  },
  two_slavers: {
    id: "two_slavers",
    type: EncounterType.NORMAL,
    enemies: ["red_slaver", "red_slaver"],
  }, // Using red for simplicity

  // --- Elite Encounters ---
  gremlin_nob_elite: {
    id: "gremlin_nob_elite",
    type: EncounterType.ELITE,
    enemies: ["gremlin_nob"],
  },
  lagavulin_elite: {
    id: "lagavulin_elite",
    type: EncounterType.ELITE,
    enemies: ["lagavulin"],
  },
  sentries_elite: {
    id: "sentries_elite",
    type: EncounterType.ELITE,
    enemies: ["sentries", "sentries", "sentries"],
  },

  // --- Boss Encounters ---
  guardian_boss: {
    id: "guardian_boss",
    type: EncounterType.BOSS,
    enemies: ["the_guardian"],
  },
  hexaghost_boss: {
    id: "hexaghost_boss",
    type: EncounterType.BOSS,
    enemies: ["hexaghost"],
  },
};
