import { CardFactory, type CardDefinition, type CardInstance } from "./Card";
import { CardColor, CardType, TargetType } from "../types/enums";
import { DamageCalculator } from "../combat/DamageCalculator";

export const CardLibrary: Record<string, CardDefinition> = {
  strike: {
    id: "strike",
    name: "Strike",
    cost: 1,
    type: CardType.ATTACK,
    color: CardColor.RED,
    targetType: TargetType.SINGLE_ENEMY,
    description: () => "Deal 6 damage.",
    effect: ({ caster, target }) => {
      if (target) {
        const damage = DamageCalculator.calculateAttackDamage(
          6,
          caster,
          target
        );
        target.takeDamage(damage);
      }
    },
  },
  strike_plus: {
    id: "strike_plus",
    name: "Strike+",
    cost: 1,
    type: CardType.ATTACK,
    color: CardColor.RED,
    targetType: TargetType.SINGLE_ENEMY,
    description: () => "Deal 9 damage.",
    effect: ({ caster, target }) => {
      if (target) {
        const damage = DamageCalculator.calculateAttackDamage(
          9,
          caster,
          target
        );
        target.takeDamage(damage);
      }
    },
    // Upgraded cards don't have an 'upgradedId'
  },
  defend: {
    id: "defend",
    name: "Defend",
    cost: 1,
    type: CardType.SKILL,
    color: CardColor.RED,
    targetType: TargetType.SELF,
    description: () => "Gain 5 Block.",
    effect: ({ caster }) => {
      caster.addBlock(5);
    },
  },
  bash: {
    id: "bash",
    name: "Bash",
    cost: 2,
    type: CardType.ATTACK,
    color: CardColor.RED,
    targetType: TargetType.SINGLE_ENEMY,
    description: () => "Deal 8 damage. Apply 2 Vulnerable.",
    effect: ({ caster, target }) => {
      if (target) {
        const damage = DamageCalculator.calculateAttackDamage(
          8,
          caster,
          target
        );
        target.takeDamage(damage);
        target.applyStatusEffect("vulnerable", 2, 2); // Apply 2 vulnerable for 2 turns
      }
    },
  },
  flex: {
    id: "flex",
    name: "Flex",
    cost: 0,
    type: CardType.SKILL,
    color: CardColor.RED,
    targetType: TargetType.SELF,
    description: () =>
      "Gain 2 Strength. At the end of your turn, lose 2 Strength.",
    effect: ({ caster }) => {
      caster.applyStatusEffect("strength", 2);
      caster.applyStatusEffect("temp_strength", 2);
    },
  },
  inflame: {
    id: "inflame",
    name: "Inflame",
    color: CardColor.RED,
    cost: 1,
    type: CardType.POWER,
    targetType: TargetType.SELF,
    description: () => "Gain 2 {keyword:strength}.", // The description now correctly reflects the effect.
    effect: ({ caster }) => {
      // CORRECTED EFFECT: Directly apply the 'strength' status effect.
      caster.applyStatusEffect("strength", 2);
    },
  },
  dazed: {
    id: "dazed",
    name: "Dazed",
    color: CardColor.CURSE, // Or STATUS, CURSE is fine for grouping
    cost: -2, // A convention for unplayable cards
    type: CardType.STATUS,
    targetType: TargetType.NONE,
    description: () => "Unplayable. {keyword:ethereal}.",
    effect: () => {
      /* No effect when played */
    },
    tags: ["ethereal"], // <-- THE KEY CHANGE
  },
  burn: {
    id: "burn",
    name: "Burn",
    color: CardColor.CURSE,
    cost: -2,
    type: CardType.STATUS,
    targetType: TargetType.NONE,
    description: () => "Unplayable. At the end of your turn, take 2 damage.",
    // This will require a hook in the CombatManager's endPlayerTurn
    effect: () => {},
  },
  pummel: {
    id: "pummel",
    name: "Pummel",
    color: CardColor.RED,
    cost: 1,
    type: CardType.ATTACK,
    targetType: TargetType.SINGLE_ENEMY,
    description: () => "Deal 2 damage 4 times. {keyword:exhaust}.",
    effect: ({ caster, target }) => {
      if (target) {
        for (let i = 0; i < 4; i++) {
          const damage = DamageCalculator.calculateAttackDamage(
            2,
            caster,
            target
          );
          target.takeDamage(damage);
        }
      }
      // The card will be moved to the exhaust pile by the playCard logic
    },
    tags: ["exhaust"],
  },
  perfected_strike: {
    id: "perfected_strike",
    name: "Perfected Strike",
    color: CardColor.RED,
    cost: 2,
    type: CardType.ATTACK,
    targetType: TargetType.SINGLE_ENEMY,
    description: () => {
      return `Deal 6 damage. Deals 2 additional damage for ALL cards with "Strike" in their name.`;
    },
    effect: ({ caster, target, combat }) => {
      if (target) {
        const bonus = combat.player.deck.filter((c) =>
          c.definition.name.toLowerCase().includes("strike")
        ).length;
        const totalBaseDamage = 6 + bonus * 2;
        const damage = DamageCalculator.calculateAttackDamage(
          totalBaseDamage,
          caster,
          target
        );
        target.takeDamage(damage);
      }
    },
  },
  blood_for_blood: {
    id: "blood_for_blood",
    name: "Blood for Blood",
    color: CardColor.RED,
    cost: 4,
    type: CardType.ATTACK,
    targetType: TargetType.SINGLE_ENEMY,
    description: () =>
      "Costs 1 less for each time you lose HP this combat. Deal 18 damage.",
    // NOTE: This requires a combat-long counter on the player for HP loss events.
    // For now, we'll simulate a cost reduction.
    effect: ({ caster, target }) => {
      if (target) {
        const damage = DamageCalculator.calculateAttackDamage(
          18,
          caster,
          target
        );
        target.takeDamage(damage);
      }
    },
  },

  // --- NEW SKILLS ---
  shrug_it_off: {
    id: "shrug_it_off",
    name: "Shrug It Off",
    color: CardColor.RED,
    cost: 1,
    type: CardType.SKILL,
    targetType: TargetType.SELF,
    description: () => "Gain 8 {keyword:block}. Draw 1 card.",
    effect: ({ caster, combat, manager }) => {
      // The context now includes 'manager'
      caster.addBlock(8);

      // CORRECTED IMPLEMENTATION: Call the new public method
      manager.drawCards(combat, 1);
    },
  },
  ghostly_armor: {
    id: "ghostly_armor",
    name: "Ghostly Armor",
    color: CardColor.RED,
    cost: 1,
    type: CardType.SKILL,
    targetType: TargetType.SELF,
    description: () => "{keyword:ethereal}. Gain 10 {keyword:block}.",
    tags: ["ethereal"],
    effect: ({ caster }) => {
      caster.addBlock(10);
    },
  },

  // --- NEW POWERS ---
  barricade: {
    id: "barricade",
    name: "Barricade",
    color: CardColor.RED,
    cost: 3,
    type: CardType.POWER,
    targetType: TargetType.SELF,
    description: () =>
      "{keyword:block} is not removed at the start of your turn. {keyword:ethereal}.",
    tags: ["ethereal"],
    effect: ({ caster }) => {
      caster.applyStatusEffect("barricade_power", 1);
    },
  },
  demon_form: {
    id: "demon_form",
    name: "Demon Form",
    color: CardColor.RED,
    cost: 3,
    type: CardType.POWER,
    targetType: TargetType.SELF,
    description: () => "At the start of your turn, gain 2 {keyword:strength}.",
    effect: ({ caster }) => {
      caster.applyStatusEffect("demon_form_power", 2);
    },
  },
  immolate: {
    id: "immolate",
    name: "Immolate",
    color: CardColor.RED,
    cost: 2,
    type: CardType.ATTACK,
    targetType: TargetType.ALL_ENEMIES,
    description: () =>
      "Deal 21 damage to ALL enemies. Shuffle a {card:burn} into your discard pile.",
    effect: ({ caster, combat }) => {
      // Deal damage to all enemies
      for (const enemy of combat.enemies) {
        if (enemy.isAlive()) {
          const damage = DamageCalculator.calculateAttackDamage(
            21,
            caster,
            enemy
          );
          enemy.takeDamage(damage);
        }
      }
      // Add a Burn card to the discard pile
      const burnCard = CardFactory.createInstance(CardLibrary["burn"]);
      combat.player.discardPile.push(burnCard);
    },
  },
  heavy_blade: {
    id: "heavy_blade",
    name: "Heavy Blade",
    color: CardColor.RED,
    cost: 2,
    type: CardType.ATTACK,
    targetType: TargetType.SINGLE_ENEMY,
    description: () => {
      return `Deal 14 damage. {keyword:strength} affects this card 3 times.`;
    },
    effect: ({ caster, target }) => {
      if (target) {
        // Special damage calculation for this card
        const strength = caster.getStatusEffectAmount("strength") || 0;
        const totalBaseDamage = 14 + strength * 3; // Apply strength bonus 3 extra times
        const damage = DamageCalculator.calculateAttackDamage(
          totalBaseDamage,
          caster,
          target
        );
        target.takeDamage(damage);
      }
    },
  },
  uppercut: {
    id: "uppercut",
    name: "Uppercut",
    color: CardColor.RED,
    cost: 2,
    type: CardType.ATTACK,
    targetType: TargetType.SINGLE_ENEMY,
    description: () =>
      "Deal 13 damage. Apply 1 {keyword:vulnerable}. Apply 1 Weak.",
    effect: ({ caster, target }) => {
      if (target) {
        const damage = DamageCalculator.calculateAttackDamage(
          13,
          caster,
          target
        );
        target.takeDamage(damage);
        target.applyStatusEffect("vulnerable", 1, 1);
        // We would need to implement 'Weak' status effect first
        target.applyStatusEffect("weak", 1, 1);
      }
    },
  },

  // --- NEW SKILLS ---
  second_wind: {
    id: "second_wind",
    name: "Second Wind",
    color: CardColor.RED,
    cost: 1,
    type: CardType.SKILL,
    targetType: TargetType.SELF,
    description: () =>
      "{keyword:exhaust} all non-Attack cards in your hand. Gain 5 {keyword:block} for each card {keyword:exhaust}ed.",
    effect: ({ caster, combat }) => {
      const hand = combat.player.hand;
      let cardsToExhaust: CardInstance[] = [];
      let cardsToKeep: CardInstance[] = [];

      for (const card of hand) {
        if (card.definition.type !== CardType.ATTACK) {
          cardsToExhaust.push(card);
        } else {
          cardsToKeep.push(card);
        }
      }

      const blockGained = cardsToExhaust.length * 5;
      caster.addBlock(blockGained);

      // Perform the exhaust and update the hand
      combat.player.exhaustPile.push(...cardsToExhaust);
      combat.player.hand = cardsToKeep;
    },
  },
  offering: {
    id: "offering",
    name: "Offering",
    color: CardColor.RED,
    cost: 0,
    type: CardType.SKILL,
    targetType: TargetType.SELF,
    description: () =>
      "Lose 6 HP. Gain 2 Energy. Draw 3 cards. {keyword:exhaust}.",
    tags: ["exhaust"],
    effect: ({ caster, combat, manager }) => {
      // Direct HP loss, ignores block
      caster.hp = Math.max(0, caster.hp - 6);
      combat.player.energy += 2;

      manager.drawCards(combat, 3);
    },
  },

  // --- NEW POWERS ---
  brutality: {
    id: "brutality",
    name: "Brutality",
    color: CardColor.RED,
    cost: 0,
    type: CardType.POWER,
    targetType: TargetType.SELF,
    description: () => "At the start of your turn, lose 1 HP and draw 1 card.",
    effect: ({ caster }) => {
      caster.applyStatusEffect("brutality_power", 1);
    },
  },
};
