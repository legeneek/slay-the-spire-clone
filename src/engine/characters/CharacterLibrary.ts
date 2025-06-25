import type { CharacterDefinition } from "./types";
import { CardColor } from "../types/enums";

export const CharacterLibrary: Record<string, CharacterDefinition> = {
  ironclad: {
    id: "ironclad",
    name: "The Ironclad",
    title: "The sole remaining soldier of the Ironclads.",
    color: CardColor.RED,
    maxHp: 80,
    startingRelicId: "burning_blood",
    startingDeck: [
      "strike",
      "strike",
      "strike",
      "strike",
      "strike",
      "defend",
      "defend",
      "defend",
      "defend",
      "bash",
    ],
  },
  // We can now easily add a second character
  // silent: {
  //   id: "silent",
  //   name: "The Silent",
  //   title: "A deadly huntress from the foglands.",
  //   color: CardColor.GREEN,
  //   maxHp: 70,
  //   startingRelicId: "ring_of_the_snake", // We'd need to define this relic
  //   startingDeck: [
  //     // We'd need to define these cards with CardColor.GREEN
  //     "silent_strike",
  //     "silent_strike",
  //     "silent_strike",
  //     "silent_strike",
  //     "silent_strike",
  //     "silent_defend",
  //     "silent_defend",
  //     "silent_defend",
  //     "silent_defend",
  //     "silent_defend",
  //     "neutralize",
  //     "survivor",
  //   ],
  // },
};
