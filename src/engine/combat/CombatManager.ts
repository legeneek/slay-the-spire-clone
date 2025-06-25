import { cloneDeep, shuffle } from "lodash-es";
import { useGameStore } from "../state/store";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { type CombatState, TurnPhase } from "./types";
import { CardType, GamePhase } from "../types/enums";
import { Entity } from "../entities/Entity";
import type { RelicHookContext, RelicDefinition } from "../relics/types";
import type { Reward } from "../rewards/types";
import { RelicLibrary } from "../relics/RelicLibrary"; // for example
import { sample } from "lodash-es";
import { EncounterType } from "../encounters/types";

// Helper function to get the current combat state, ensures it's not null.
function getRequiredCombatState(): CombatState {
  const combatState = useGameStore.getState().currentCombat;
  if (!combatState) {
    throw new Error("Attempted to access combat state when not in combat.");
  }
  return cloneDeep(combatState); // Return a deep copy to prevent direct mutation
}

// --- Private Helper Functions ---
function _processEndOfTurnStatusEffects(entity: Entity) {
  // Handle special cases first
  const tempStrength = entity.statusEffects.find(
    (se) => se.definition.id === "temp_strength"
  );
  if (tempStrength) {
    // Reduce strength by the amount of temp_strength
    const strength = entity.statusEffects.find(
      (se) => se.definition.id === "strength"
    );
    if (strength) {
      strength.amount -= tempStrength.amount;
    }
  }

  // Process all status effects
  for (const effect of entity.statusEffects) {
    switch (effect.definition.endOfTurnBehavior) {
      case "DECREMENT_DURATION":
        if (effect.duration) {
          effect.duration -= 1;
        }
        break;
      case "DECREMENT_AMOUNT":
        // Poison is handled at the START of the turn in Slay the Spire.
        // Let's adjust our logic for that later. For now, we'll just decrement.
        // We'll add poison damage logic in the turn start.
        break;
    }
  }

  // Clean up expired effects
  entity.statusEffects = entity.statusEffects.filter((effect) => {
    // Remove temp_strength
    if (effect.definition.id === "temp_strength") return false;
    // Remove effects with 0 duration
    if (effect.duration !== undefined && effect.duration <= 0) return false;
    // Remove effects with 0 amount (unless they are duration-based)
    if (effect.amount <= 0 && effect.duration === undefined) return false;
    return true;
  });
}

function _processStartOfTurnStatusEffects(entity: Entity) {
  const poison = entity.statusEffects.find(
    (se) => se.definition.id === "poison"
  );
  if (poison) {
    entity.takeDamage(poison.amount); // Poison ignores block
    poison.amount -= 1;
  }

  const demonForm = entity.statusEffects.find(
    (se) => se.definition.id === "demon_form_power"
  );
  if (demonForm) {
    entity.applyStatusEffect("strength", demonForm.amount);
  }

  const brutality = entity.statusEffects.find(
    (se) => se.definition.id === "brutality_power"
  );
  if (brutality && entity instanceof Player) {
    // Player takes 1 direct HP loss, ignoring block
    entity.hp = Math.max(0, entity.hp - 1);
    // Draw cards
    _drawCards(entity, brutality.amount);
  }
}

function _drawCards(player: Player, amount: number): Player {
  for (let i = 0; i < amount; i++) {
    if (player.drawPile.length === 0) {
      // Reshuffle discard pile into draw pile if needed
      if (player.discardPile.length === 0) {
        break; // No cards left to draw
      }
      player.drawPile = shuffle(player.discardPile);
      player.discardPile = [];
    }
    const cardToDraw = player.drawPile.pop();
    if (cardToDraw) {
      player.hand.push(cardToDraw);
    }
  }
  return player;
}

function _triggerRelicHooks(
  hookName: keyof RelicDefinition,
  context: RelicHookContext
) {
  for (const relic of context.player.relics) {
    if (relic.definition[hookName]) {
      // @ts-ignore - We know the hook exists, TS needs a little help here.
      relic.definition[hookName](context);
    }
  }
}

function _triggerOnCardPlayedHooks(context: RelicHookContext) {
  // 1. Trigger Relic hooks (we might have done this already)
  _triggerRelicHooks("onCardPlayed", context); // If not already present

  // 2. Trigger Status Effect hooks
  const { combat, cardPlayed } = context;
  if (!combat || !cardPlayed) return;

  for (const enemy of combat.enemies) {
    const nobRage = enemy.getStatusEffectAmount("nob_rage");
    if (nobRage > 0 && cardPlayed.definition.type === "SKILL") {
      enemy.applyStatusEffect("strength", nobRage);
    }
  }
}

// --- Public API for Combat Management ---

export const CombatManager = {
  startCombat(player: Player, enemies: Enemy[], encounterType: EncounterType) {
    const freshPlayer = cloneDeep(player);

    // Prepare the player for combat
    freshPlayer.drawPile = shuffle([...freshPlayer.deck]);
    freshPlayer.hand = [];
    freshPlayer.discardPile = [];
    freshPlayer.exhaustPile = [];
    freshPlayer.block = 0;

    const initialState: CombatState = {
      player: freshPlayer,
      enemies,
      turn: 1,
      phase: TurnPhase.PLAYER_TURN,
      encounterType: encounterType,
    };

    _triggerRelicHooks("onCombatStart", {
      player: initialState.player,
      combat: initialState,
    });

    // Set initial combat state in the store
    useGameStore.setState({
      currentCombat: initialState,
      phase: GamePhase.COMBAT,
    });

    // Start the first turn
    this.startPlayerTurn();
  },

  startPlayerTurn() {
    const combatState = getRequiredCombatState();
    _triggerRelicHooks("onTurnStart", {
      player: combatState.player,
      combat: combatState,
    });
    _processStartOfTurnStatusEffects(combatState.player);

    // Reset player stats for the turn
    combatState.player.energy = combatState.player.maxEnergy;

    if (combatState.player.getStatusEffectAmount("barricade_power") === 0) {
      combatState.player.block = 0;
    }

    // Draw cards
    _drawCards(combatState.player, 5); // Standard 5-card draw

    // Enemies determine their intent for the turn
    combatState.enemies.forEach((enemy) =>
      enemy.determineNextMove(combatState.player)
    );

    useGameStore.getState().updateCombat(combatState);
    this.checkCombatEnd();
  },

  playCard(cardInstanceId: string, targetId?: string) {
    const combatState = getRequiredCombatState();
    const { player, enemies } = combatState;

    if (combatState.phase !== TurnPhase.PLAYER_TURN) {
      console.warn("Cannot play card outside of player's turn.");
      return;
    }

    const cardIndex = player.hand.findIndex(
      (c) => c.instanceId === cardInstanceId
    );
    if (cardIndex === -1) {
      console.error(`Card with id ${cardInstanceId} not found in hand.`);
      return;
    }

    const card = player.hand[cardIndex];

    if (player.energy < card.currentCost) {
      console.warn(`Not enough energy to play ${card.definition.name}.`);
      return;
    }

    // Find target
    let target: Player | Enemy | undefined;
    if (targetId) {
      target =
        enemies.find((e) => e.id === targetId) ||
        (player.id === targetId ? player : undefined);
    } else if (card.definition.targetType === "SELF") {
      target = player;
    }

    // TODO: Add more robust target validation logic here

    // Pay energy cost
    player.energy -= card.currentCost;

    // Execute the card's effect
    card.definition.effect({
      caster: player,
      target: target,
      card: card,
      combat: combatState,
      manager: this,
    });

    _triggerOnCardPlayedHooks({
      player,
      combat: combatState,
      cardPlayed: card,
    });

    const [playedCard] = player.hand.splice(cardIndex, 1);

    if (playedCard.definition.type === CardType.POWER) {
      // Move Power cards to the new powersInPlay pile
      player.powersInPlay.push(playedCard);
    } else if (playedCard.definition.tags?.includes("exhaust")) {
      // Move Exhaust cards to the exhaust pile
      player.exhaustPile.push(playedCard);
    } else {
      // Move all other cards (Attacks, Skills) to the discard pile
      player.discardPile.push(playedCard);
    }

    // Update the state
    useGameStore.getState().updateCombat(combatState);

    // Check for combat end after playing a card (e.g., all enemies defeated)
    this.checkCombatEnd();
  },

  drawCards(combatState: CombatState, amount: number) {
    // We directly call the helper function.
    // This method is now the official way for any external system (like a card effect)
    // to make the player draw cards.
    _drawCards(combatState.player, amount);

    // We don't call updateCombat here. The calling context (playCard) will
    // be responsible for updating the state once all effects are resolved.
  },

  exhaustCard(player: Player, cardInstanceId: string) {
    const cardIndex = player.hand.findIndex(
      (c) => c.instanceId === cardInstanceId
    );
    if (cardIndex > -1) {
      const [cardToExhaust] = player.hand.splice(cardIndex, 1);
      player.exhaustPile.push(cardToExhaust);
    }
    // This could be expanded to exhaust from draw/discard piles too.
  },

  endPlayerTurn() {
    const combatState = getRequiredCombatState();

    if (combatState.phase !== TurnPhase.PLAYER_TURN) return;

    _processEndOfTurnStatusEffects(combatState.player);

    const burnsInHand = combatState.player.hand.filter(
      (c) => c.definition.id === "burn"
    );
    if (burnsInHand.length > 0) {
      // Player takes 2 damage for each Burn card. This damage ignores block.
      const burnDamage = burnsInHand.length * 2;
      combatState.player.hp = Math.max(0, combatState.player.hp - burnDamage);
      // Optional: Add floating text for burn damage
      // useCombatUIStore.getState().addFloatingText(player.id, burnDamage, 'damage');
    }

    // NEW: Handle Ethereal cards
    const etherealCardsInHand = combatState.player.hand.filter((c) =>
      c.definition.tags?.includes("ethereal")
    );
    for (const card of etherealCardsInHand) {
      // We'll need a new method to handle exhaust
      this.exhaustCard(combatState.player, card.instanceId);
    }
    // Update hand to remove the exhausted cards
    combatState.player.hand = combatState.player.hand.filter(
      (c) => !etherealCardsInHand.some((ec) => ec.instanceId === c.instanceId)
    );

    // Discard hand
    combatState.player.discardPile.push(...combatState.player.hand);
    combatState.player.hand = [];

    // Change phase
    combatState.phase = TurnPhase.ENEMY_TURN;
    useGameStore.getState().updateCombat(combatState);

    // Trigger enemy turn execution
    this.executeEnemyTurns();
  },

  executeEnemyTurns() {
    const combatState = getRequiredCombatState();
    if (combatState.phase !== TurnPhase.ENEMY_TURN) return;

    // In a real game, you might want to sequence these with delays for animation.
    // For now, we execute them instantly.
    combatState.enemies.forEach((enemy) => {
      if (enemy.isAlive()) {
        // Process start-of-turn effects for the enemy
        _processStartOfTurnStatusEffects(enemy);

        // If enemy is still alive after poison, they act
        if (enemy.isAlive() && enemy.intent) {
          enemy.intent.move.execute(enemy, combatState.player);
        }

        // Process end-of-turn effects for the enemy
        _processEndOfTurnStatusEffects(enemy);
      }
    });

    useGameStore.getState().updateCombat(combatState);

    // Check for combat end after enemy attacks (e.g., player defeated)
    if (!this.checkCombatEnd()) {
      // If combat is not over, start the next player turn
      this.endEnemyTurn();
    }
  },

  endEnemyTurn() {
    const combatState = getRequiredCombatState();
    if (combatState.phase !== TurnPhase.ENEMY_TURN) return;

    // Increment turn counter, set phase to player turn
    combatState.turn++;
    combatState.phase = TurnPhase.PLAYER_TURN;
    useGameStore.getState().updateCombat(combatState);

    // Start the new player turn
    this.startPlayerTurn();
  },

  checkCombatEnd(): boolean {
    const combatState = getRequiredCombatState();

    const allEnemiesDefeated = combatState.enemies.every((e) => !e.isAlive());
    const playerDefeated = !combatState.player.isAlive();

    if (allEnemiesDefeated) {
      console.log("COMBAT WON!");
      combatState.phase = TurnPhase.COMBAT_OVER;

      const rewards: Reward[] = [];
      // 1. Gold Reward
      const goldAmount = Math.floor(Math.random() * 15) + 10; // 10-24 gold
      rewards.push({ type: "GOLD", amount: goldAmount });
      // 2. Card Reward
      rewards.push({ type: "CARD_CHOICE" });

      if (
        combatState.encounterType === EncounterType.ELITE ||
        combatState.encounterType === EncounterType.BOSS
      ) {
        // Find a random relic the player doesn't already have.
        const currentPlayerRelicIds =
          useGameStore.getState().player?.relics.map((r) => r.definition.id) ||
          [];
        const availableRelics = Object.values(RelicLibrary).filter(
          (r) => !currentPlayerRelicIds.includes(r.id)
        );

        if (availableRelics.length > 0) {
          const relicReward = sample(availableRelics)!;
          rewards.push({ type: "RELIC", relic: relicReward });
        }
      }

      useGameStore.setState({
        pendingRewards: rewards,
        phase: GamePhase.REWARD,
      });

      this.endCombat(combatState, "VICTORY");

      return true;
    }

    if (playerDefeated) {
      this.endCombat(combatState, "DEFEAT");
      return true;
    }

    return false;
  },

  endCombat(finalCombatState: CombatState, result: "VICTORY" | "DEFEAT") {
    if (result === "VICTORY") {
      // 1. Get the player state after the fight.
      let playerAfterCombat = cloneDeep(finalCombatState.player);

      // 2. Apply any end-of-combat relic hooks (like Burning Blood healing).
      // This happens before we clear status effects, in case a relic needs to check them.
      _triggerRelicHooks("onCombatEnd", { player: playerAfterCombat });

      // 3. Clean up the player object for the map view.
      playerAfterCombat.hand = [];
      playerAfterCombat.drawPile = [];
      playerAfterCombat.discardPile = [];
      playerAfterCombat.exhaustPile = [];
      playerAfterCombat.powersInPlay = [];
      playerAfterCombat.block = 0;
      playerAfterCombat.energy = playerAfterCombat.maxEnergy;

      // --- THE FIX ---
      // Clear all status effects. They do not persist between battles.
      playerAfterCombat.statusEffects = [];
      // --- END OF FIX ---

      // 4. Update the global player state with the reconciled object.
      useGameStore.getState().setPlayer(playerAfterCombat);

      // 5. Signal the engine to nullify the combat session.
      useGameStore.setState({ currentCombat: null });
    } else if (result === "DEFEAT") {
      console.log("COMBAT LOST! GAME OVER.");
      // For a loss, we transition to the main menu and clear the run.
      useGameStore.getState().setGamePhase(GamePhase.MAIN_MENU);
      useGameStore.getState().setPlayer(null);
      useGameStore.setState({ currentCombat: null, map: null }); // Clear all run-specific state
    }
  },
};
