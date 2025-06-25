import { useGameStore } from "../state/store";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { CardLibrary } from "../cards/CardLibrary";
import { RelicLibrary } from "../relics/RelicLibrary";
import { StatusEffectLibrary } from "../effects/StatusEffectLibrary";

const SAVE_KEY = "slay-the-spire-clone-savefile";

// Re-links definitions from libraries after loading from JSON
function rehydrateDefinitions(state: any) {
  if (state.player) {
    state.player.deck.forEach((card: any) => {
      card.definition = CardLibrary[card.definition.id];
    });
    // Rehydrate relics
    state.player.relics = state.player.relics.map(
      (relic: any) => RelicLibrary[relic.id]
    );
  }

  if (state.currentShop) {
    state.currentShop.cards = state.currentShop.cards.map((card: any) => {
      return {
        ...CardLibrary[card.id],
        price: card.price,
      };
    });
    // Rehydrate relics
    state.currentShop.relics = state.currentShop.relics.map((relic: any) => {
      return {
        ...RelicLibrary[relic.id],
        price: relic.price,
      };
    });
  }
  if (state.currentCombat) {
    // Rehydrate cards in hand, draw, discard piles
    const piles = ["hand", "drawPile", "discardPile", "exhaustPile"];
    piles.forEach((pile) => {
      state.currentCombat.player[pile].forEach((card: any) => {
        card.definition = CardLibrary[card.definition.id];
      });
    });
    // Rehydrate status effects
    const allEntities = [
      state.currentCombat.player,
      ...state.currentCombat.enemies,
    ];
    allEntities.forEach((entity) => {
      if (entity.statusEffects) {
        entity.statusEffects.forEach((se: any) => {
          se.definition = StatusEffectLibrary[se.definition.id];
        });
      }
    });
  }
  return state;
}

// Restores class prototypes
function rehydratePrototypes(state: any) {
  // Player
  if (state.player) {
    Object.setPrototypeOf(state.player, Player.prototype);
  }
  // Combat State
  if (state.currentCombat) {
    Object.setPrototypeOf(state.currentCombat.player, Player.prototype);
    state.currentCombat.enemies.forEach((enemy: any) => {
      Object.setPrototypeOf(enemy, Enemy.prototype);
    });
  }
  return state;
}

export const GamePersistence = {
  hasSaveFile(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  },

  saveGame() {
    const state = useGameStore.getState();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      console.log("Game saved successfully.");
    } catch (e) {
      console.error("Failed to save game:", e);
    }
  },

  loadGame(): boolean {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) {
      return false;
    }
    try {
      let state = JSON.parse(savedData);
      state = rehydrateDefinitions(state);
      state = rehydratePrototypes(state);
      useGameStore.setState(state, true); // `true` replaces the entire state
      console.log("Game loaded successfully.");
      return true;
    } catch (e) {
      console.error("Failed to load or rehydrate game state:", e);
      // Clear corrupted save data
      this.clearSave();
      return false;
    }
  },

  clearSave() {
    localStorage.removeItem(SAVE_KEY);
  },
};
