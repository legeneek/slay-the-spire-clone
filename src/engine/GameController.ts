import { useGameStore } from "./state/store";
import { CombatManager } from "./combat/CombatManager";
import { Player } from "./entities/Player";
import { CardFactory, type CardDefinition } from "./cards/Card";
import { CardLibrary } from "./cards/CardLibrary";
import { MapGenerator } from "./map/MapGenerator";
import { cloneDeep, sample, sampleSize } from "lodash-es";
import { RelicLibrary } from "./relics/RelicLibrary";
import { CardColor, CardType, GamePhase, TargetType } from "./types/enums";
import { MapNodeType } from "./map/types";
import type { Entity } from "./entities/Entity";
import { EncounterLibrary } from "../engine/encounters/EncounterLibrary";
import { EnemyFactory } from "../engine/entities/EnemyLibrary";
import { EncounterType } from "./encounters/types";
import { EventLibrary } from "./events/EventLibrary";
import { CharacterLibrary } from "../engine/characters/CharacterLibrary";
import type { Reward } from "./rewards/types";
import { RelicFactory } from "./relics/RelicFactory";

export const GameController = {
  // --- Game Lifecycle ---
  initializeGame(characterId: string) {
    const charDef = CharacterLibrary[characterId];
    if (!charDef) {
      console.error(`Character ${characterId} not found!`);
      return;
    }

    const startingDeck = charDef.startingDeck.map((id) =>
      CardFactory.createInstance(CardLibrary[id])
    );
    const player = new Player(
      charDef.name,
      charDef.maxHp,
      startingDeck,
      charDef.color
    ); // Add color to Player

    player.relics.push(
      RelicFactory.createInstance(RelicLibrary[charDef.startingRelicId])
    );

    const map = MapGenerator.generateAct1Map();

    useGameStore.getState().setPlayer(player);
    useGameStore.getState().setMap(map);
    console.log("Game Initialized. Player and Map created.");
  },

  startGame() {
    const state = this.getGameState();
    if (state.map && state.player) {
      // We no longer set a current node. The player starts "before" the map.
      // The UI will determine selectable nodes from map.startingNodeIds.
      useGameStore.getState().setGamePhase(GamePhase.MAP);
    } else {
      console.error("Cannot start game: player or map not initialized.");
    }
  },

  selectMapNode(nodeId: string) {
    const state = this.getGameState();
    if (state.phase !== "MAP" || !state.player) return;

    useGameStore.getState().setCurrentMapNode(nodeId);
    const nextNode = state.map!.nodes[nodeId];

    switch (nextNode.type) {
      case MapNodeType.MONSTER: {
        const normalEncounters = Object.values(EncounterLibrary).filter(
          (e) => e.type === EncounterType.NORMAL
        );
        const randomEncounter = sample(normalEncounters)!;
        const enemies = randomEncounter.enemies.map((enemyId) =>
          EnemyFactory[enemyId]()
        );
        // Pass the encounter type to the combat manager
        CombatManager.startCombat(state.player, enemies, EncounterType.NORMAL);
        break;
      }

      // --- COMPLETED IMPLEMENTATION ---
      case MapNodeType.ELITE: {
        const eliteEncounters = Object.values(EncounterLibrary).filter(
          (e) => e.type === EncounterType.ELITE
        );
        const randomEncounter = sample(eliteEncounters)!;
        const enemies = randomEncounter.enemies.map((enemyId) =>
          EnemyFactory[enemyId]()
        );
        // Pass ELITE type to get better rewards
        CombatManager.startCombat(state.player, enemies, EncounterType.ELITE);
        break;
      }
      case MapNodeType.BOSS: {
        const bossEncounters = Object.values(EncounterLibrary).filter(
          (e) => e.type === EncounterType.BOSS
        );
        const randomEncounter = sample(bossEncounters)!;
        const enemies = randomEncounter.enemies.map((enemyId) =>
          EnemyFactory[enemyId]()
        );
        // Pass BOSS type for the best rewards and to signal end of act
        CombatManager.startCombat(state.player, enemies, EncounterType.BOSS);
        break;
      }
      // --- END OF COMPLETED IMPLEMENTATION ---

      case MapNodeType.EVENT: {
        const randomEvent = sample(Object.values(EventLibrary))!;
        useGameStore.setState({
          activeEvent: randomEvent,
          phase: GamePhase.EVENT,
        });
        break;
      }
      case MapNodeType.REST:
        useGameStore.getState().setGamePhase(GamePhase.REST);
        break;
      case MapNodeType.SHOP:
        this.enterShop();
        break;
    }
  },

  enterShop() {
    const player = this.getGameState().player;
    if (!player) return;
    const sellableCardPool = Object.values(CardLibrary).filter((card) => {
      // Condition 1: Must be a playable type (not Status or Curse)
      const isPlayableType =
        card.type === CardType.ATTACK ||
        card.type === CardType.SKILL ||
        card.type === CardType.POWER;

      // Condition 2: Must be of the character's color or colorless
      const isCorrectColor =
        card.color === player.color || card.color === CardColor.COLORLESS;

      return isPlayableType && isCorrectColor;
    });

    const cardChoices = sampleSize(sellableCardPool, 5).map((card) => ({
      ...card,
      price: Math.floor(Math.random() * 50 + 50),
    }));

    const availableRelics = Object.values(RelicLibrary);
    const relicChoices = sampleSize(availableRelics, 3).map((relic) => ({
      ...relic,
      price: Math.floor(Math.random() * 100 + 150),
    }));

    const shopInventory = {
      cards: cardChoices,
      relics: relicChoices,
      removeServiceCost: 75,
    };

    useGameStore.setState({
      currentShop: shopInventory,
      phase: GamePhase.SHOP,
    });
  },

  buyItem(itemType: "CARD" | "RELIC", itemId: string) {
    const state = this.getGameState();
    const player = cloneDeep(state.player);
    const shop = cloneDeep(state.currentShop);
    if (!player || !shop) return;

    let itemCost = 0;

    if (itemType === "CARD") {
      const cardIndex = shop.cards.findIndex((c) => c.id === itemId);
      if (cardIndex === -1) return;
      const cardToBuy = shop.cards[cardIndex];
      itemCost = cardToBuy.price;
      if (player.gold >= itemCost) {
        player.deck.push(CardFactory.createInstance(cardToBuy));
        shop.cards.splice(cardIndex, 1); // Remove from shop
      }
    } else if (itemType === "RELIC") {
      const relicIndex = shop.relics.findIndex((r) => r.id === itemId);
      if (relicIndex === -1) {
        console.error(`Relic with id ${itemId} not found in shop.`);
        return;
      }

      const relicToBuy = shop.relics[relicIndex];
      itemCost = relicToBuy.price;

      if (player.gold >= itemCost) {
        player.relics.push(RelicFactory.createInstance(relicToBuy)); // Add the full relic definition
        shop.relics.splice(relicIndex, 1); // Remove from shop
      } else {
        console.warn("Not enough gold to buy relic.");
        return; // Exit early if cannot afford
      }
    }

    if (itemCost > 0) {
      player.gold -= itemCost;
      useGameStore.setState({ player, currentShop: shop });
    }
  },

  rest() {
    const player = cloneDeep(this.getGameState().player);
    if (!player) return;

    // Heal for 30% of max HP, rounded down.
    const healAmount = Math.floor(player.maxHp * 0.3);
    player.hp = Math.min(player.maxHp, player.hp + healAmount);

    useGameStore.getState().setPlayer(player);
    this.finishNodeActivity(); // New helper to return to map
  },

  smith(cardInstanceId: string) {
    const player = cloneDeep(this.getGameState().player);
    if (!player) return;

    const cardToUpgrade = player.deck.find(
      (c) => c.instanceId === cardInstanceId
    );
    if (
      !cardToUpgrade ||
      cardToUpgrade.isUpgraded ||
      !cardToUpgrade.definition.upgradedId
    ) {
      console.error("Cannot upgrade this card.");
      return;
    }

    const upgradedDefinition = CardLibrary[cardToUpgrade.definition.upgradedId];
    if (!upgradedDefinition) {
      console.error(
        `Upgraded card definition not found for ${cardToUpgrade.definition.upgradedId}`
      );
      return;
    }

    // Replace the definition and mark as upgraded
    cardToUpgrade.definition = upgradedDefinition;
    cardToUpgrade.isUpgraded = true;

    useGameStore.getState().setPlayer(player);
    this.finishNodeActivity();
  },

  // NEW: A universal way to end a node activity and return to the map.
  finishNodeActivity() {
    useGameStore.getState().setGamePhase(GamePhase.MAP);
  },

  removeCardFromDeck(cardInstanceId: string) {
    const state = this.getGameState();
    const player = cloneDeep(state.player);
    const shop = cloneDeep(state.currentShop);
    if (!player || !shop) return;

    const cost = shop.removeServiceCost;
    if (player.gold < cost) {
      console.warn("Not enough gold to remove card.");
      return;
    }

    const cardIndex = player.deck.findIndex(
      (c) => c.instanceId === cardInstanceId
    );
    if (cardIndex === -1) {
      console.error("Card to remove not found in deck.");
      return;
    }

    // Pay the cost and remove the card
    player.gold -= cost;
    player.deck.splice(cardIndex, 1);

    // Increase the cost for the next removal
    shop.removeServiceCost += 25;

    useGameStore.setState({ player, currentShop: shop });
  },

  // --- Reward Actions ---
  generateCardChoices(): CardDefinition[] {
    const player = this.getGameState().player;
    if (!player) return [];

    const characterCardPool = Object.values(CardLibrary).filter(
      (c) => c.color === player.color
    );
    const colorlessCardPool = Object.values(CardLibrary).filter(
      (c) => c.color === CardColor.COLORLESS
    );

    // Create a combined pool with a higher chance for character cards
    const combinedPool = [
      ...characterCardPool,
      ...characterCardPool,
      ...colorlessCardPool,
    ];

    return sampleSize(combinedPool, 3);
  },

  claimReward(reward: Reward) {
    const player = cloneDeep(this.getGameState().player);
    if (!player) return;

    let claimed = false;
    switch (reward.type) {
      case "GOLD":
        player.gold += reward.amount;
        claimed = true;
        break;
      case "RELIC":
        player.relics.push(RelicFactory.createInstance(reward.relic));
        claimed = true;
        break;
      // Card choices are handled differently as they require a selection.
      // We will keep claimCardReward for that specific interaction.
    }

    if (claimed) {
      useGameStore.getState().setPlayer(player);
      this.finishRewardStep(reward.type);
    }
  },

  claimCardReward(cardId: string) {
    // This method remains largely the same, as it takes a choice.
    const player = cloneDeep(this.getGameState().player);
    if (!player) return;

    const cardDef = CardLibrary[cardId];
    if (cardDef) {
      player.deck.push(CardFactory.createInstance(cardDef));
      useGameStore.getState().setPlayer(player);
    }
    this.finishRewardStep("CARD_CHOICE");
  },

  skipCardReward() {
    this.finishRewardStep("CARD_CHOICE");
  },

  // Helper to remove claimed rewards and check if we're done
  finishRewardStep(rewardType: string) {
    let rewards = this.getGameState().pendingRewards;
    if (rewards) {
      rewards = rewards.filter((r) => r.type !== rewardType);
      useGameStore.setState({ pendingRewards: rewards });

      if (rewards.length === 0) {
        // All rewards claimed, return to map
        useGameStore.getState().setGamePhase(GamePhase.MAP);
      }
    }
  },

  resolveEventOption(optionIndex: number) {
    const state = this.getGameState();
    const player = cloneDeep(state.player);
    const event = state.activeEvent;

    if (!player || !event || !event.options[optionIndex]) return;

    // Execute the consequence
    event.options[optionIndex].consequence(player, this);

    // Update player state and exit the event
    useGameStore.getState().setPlayer(player);
    useGameStore.setState({ activeEvent: null });
    this.finishNodeActivity(); // Return to the map
  },

  usePotion(potionId: string, targetId?: string) {
    const state = this.getGameState();
    const combatState = cloneDeep(state.currentCombat);
    if (!combatState) return;

    const potionIndex = combatState.player.potions.findIndex(
      (p) => p.id === potionId
    );
    if (potionIndex === -1) return;

    const potion = combatState.player.potions[potionIndex];

    let target: Entity | undefined;
    if (targetId) {
      target = combatState.enemies.find((e) => e.id === targetId);
    } else if (potion.targetType === TargetType.SELF) {
      target = combatState.player;
    }

    // Execute effect
    potion.effect({ caster: combatState.player, target, combat: combatState });

    // Remove potion after use
    combatState.player.potions.splice(potionIndex, 1);

    useGameStore.getState().updateCombat(combatState);
    CombatManager.checkCombatEnd();
  },

  // --- Combat Actions ---
  playCard(cardInstanceId: string, targetId?: string) {
    CombatManager.playCard(cardInstanceId, targetId);
  },

  endTurn() {
    CombatManager.endPlayerTurn();
  },

  // --- State Access ---
  getGameState() {
    return useGameStore.getState();
  },

  // The UI will use this to re-render when the state changes.
  subscribe(callback: (state: any) => void) {
    return useGameStore.subscribe(callback);
  },
};
