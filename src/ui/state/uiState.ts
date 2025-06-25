import { create } from "zustand";
import { type CardInstance } from "../../engine/cards/Card";
import { useGameStore } from "../../engine/state/store";
import type { FloatingTextColor } from "../components/FloatingText";
import { v4 as uuidv4 } from "uuid";

type PileType = "DRAW" | "DISCARD" | "EXHAUST" | "DECK";

interface DeckViewInfo {
  title: string;
  cards: CardInstance[];
}

interface FloatingTextInstance {
  id: string;
  text: string | number;
  color: FloatingTextColor;
  entityId: string; // The ID of the entity to position this text over
}

interface CombatUIState {
  // What are we currently targeting with?
  targetingSource: CardInstance | null;
  // Which enemy is currently being hovered over as a potential target?
  hoveredTargetId: string | null;

  setTargetingSource: (source: CardInstance | null) => void;
  setHoveredTarget: (id: string | null) => void;
  reset: () => void;

  isDeckViewOpen: boolean;
  deckViewInfo: DeckViewInfo | null;

  openDeckView: (type: PileType) => void;
  closeDeckView: () => void;
  floatingTexts: FloatingTextInstance[];
  addFloatingText: (
    entityId: string,
    text: string | number,
    color: FloatingTextColor
  ) => void;
  removeFloatingText: (id: string) => void;
}

export const useCombatUIStore = create<CombatUIState>((set, get) => ({
  floatingTexts: [],
  isDeckViewOpen: false,
  deckViewInfo: null,
  targetingSource: null,
  hoveredTargetId: null,
  setTargetingSource: (source) => set({ targetingSource: source }),
  setHoveredTarget: (id) => set({ hoveredTargetId: id }),

  addFloatingText: (entityId, text, color) => {
    const newText: FloatingTextInstance = {
      id: uuidv4(),
      entityId,
      text,
      color,
    };
    set((state) => ({ floatingTexts: [...state.floatingTexts, newText] }));
    // Automatically remove the text from state after its animation is finished
    setTimeout(() => {
      get().removeFloatingText(newText.id);
    }, 1500); // Match the animation duration in FloatingText.tsx
  },

  removeFloatingText: (idToRemove: string) => {
    set((state) => ({
      floatingTexts: state.floatingTexts.filter((ft) => ft.id !== idToRemove),
    }));
  },

  // Make sure to clear texts on reset
  reset: () =>
    set({ targetingSource: null, hoveredTargetId: null, floatingTexts: [] }),
  openDeckView: (type) => {
    const gameState = useGameStore.getState();
    const player = gameState.currentCombat?.player || gameState.player;
    if (!player) return;

    let info: DeckViewInfo | null = null;
    switch (type) {
      case "DECK":
        info = { title: "Deck", cards: player.deck };
        break;
      case "DRAW":
        info = { title: "Draw Pile", cards: player.drawPile };
        break;
      case "DISCARD":
        info = { title: "Discard Pile", cards: player.discardPile };
        break;
      case "EXHAUST":
        info = { title: "Exhaust Pile", cards: player.exhaustPile };
        break;
    }

    if (info) {
      set({ isDeckViewOpen: true, deckViewInfo: info });
    }
  },
  closeDeckView: () => set({ isDeckViewOpen: false }),
}));
