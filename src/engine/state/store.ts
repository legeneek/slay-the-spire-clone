import { create } from "zustand";
import { cloneDeep } from "lodash-es";
import { GamePhase } from "../types/enums";
import { Player } from "../entities/Player";
import type { CombatState } from "../combat/types"; // Updated import
import type { Enemy } from "../entities/Enemy";
import type { GameMap } from "../map/types";
import type { CardDefinition } from "../cards/Card";
import type { RelicDefinition } from "../relics/types";
import type { GameEvent } from "../events/types";

interface ShopInventory {
  cards: (CardDefinition & { price: number })[];
  relics: (RelicDefinition & { price: number })[];
  removeServiceCost: number;
}

interface GameState {
  phase: GamePhase;
  player: Player | null;
  // The currentCombat now holds the entire state for a battle
  currentCombat: CombatState | null;

  map: GameMap | null;
  currentMapNodeId: string | null;
  pendingRewards: any[] | null;

  currentShop: ShopInventory | null;
  activeEvent: GameEvent | null;

  // We'll add a more robust action for updating combat
  setPlayer: (player: Player | null) => void;
  setGamePhase: (phase: GamePhase) => void;
  startCombat: (player: Player, enemies: Enemy[]) => void;
  updateCombat: (newState: Partial<CombatState>) => void;
  endCombat: () => void;

  setMap: (map: GameMap) => void;
  setCurrentMapNode: (nodeId: string) => void;
}

// We will define the actions like startCombat inside the CombatManager
// and call them from the store for better organization. For now, let's
// define the store structure. The manager will handle the implementation.
export const useGameStore = create<GameState>((set, get) => ({
  phase: GamePhase.MAIN_MENU,
  player: null,
  currentCombat: null,

  map: null,
  currentMapNodeId: null,
  pendingRewards: null,

  currentShop: null,
  activeEvent: null,

  setPlayer: (player) => set({ player }),
  setGamePhase: (phase) => set({ phase }),

  setMap: (map) => set({ map }),
  setCurrentMapNode: (nodeId) => set({ currentMapNodeId: nodeId }),

  // This is a placeholder; the actual logic will be in the CombatManager
  // We expose it here so the GameController can call it.
  startCombat: () => {
    // The actual implementation will be in CombatManager.startCombat
    // For now, we just set the state.
    console.log(
      "Store action 'startCombat' should be handled by CombatManager"
    );
  },

  // A utility action to update the combat state.
  // We use cloneDeep to ensure we're not mutating the state directly.
  updateCombat: (updates) => {
    const current = get().currentCombat;
    if (current) {
      set({ currentCombat: { ...cloneDeep(current), ...updates } });
    }
  },

  endCombat: () => {
    set({ currentCombat: null, phase: GamePhase.MAP });
  },
}));
