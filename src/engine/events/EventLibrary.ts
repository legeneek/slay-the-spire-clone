import type { GameEvent } from "./types";
import { CardFactory } from "../cards/Card";
import { CardLibrary } from "../cards/CardLibrary";

export const EventLibrary: Record<string, GameEvent> = {
  golden_shrine: {
    id: "golden_shrine",
    title: "Golden Shrine",
    description:
      "You find a shrine to a forgotten deity. It glitters with gold.",
    options: [
      {
        text: "Pray (Gain 100 Gold)",
        consequence: (player) => {
          player.gold += 100;
        },
      },
      {
        text: "Desecrate (Become Cursed)",
        consequence: (player) => {
          // We need to define a 'regret' curse card
          const curse = CardLibrary["regret"];
          if (curse) {
            player.deck.push(CardFactory.createInstance(curse));
          }
        },
      },
      {
        text: "Leave",
        consequence: () => {
          /* Do nothing */
        },
      },
    ],
  },
  // ... more events
};
