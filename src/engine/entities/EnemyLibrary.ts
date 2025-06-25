import { Enemy, IntentType } from "./Enemy";
import { Player } from "./Player";
import { DamageCalculator } from "../combat/DamageCalculator";
import { CardFactory } from "../cards/Card";
import { CardLibrary } from "../cards/CardLibrary";

// Helper function to ensure we're dealing with a Player instance when needed
function isPlayer(entity: any): entity is Player {
  return entity instanceof Player;
}

export const EnemyFactory: Record<string, () => Enemy> = {
  // --- NORMAL ENEMIES ---
  cultist: () =>
    new Enemy("Cultist", 48, [
      {
        name: "Incantation",
        intentType: IntentType.BUFF,
        baseDamage: 0,
        description: () => "Gains 3 Strength.",
        execute: (self) => {
          self.applyStatusEffect("strength", 3);
        },
      },
      {
        name: "Dark Strike",
        intentType: IntentType.ATTACK,
        baseDamage: 6,
        description: (self) =>
          `Caw caw! Deals ${self.intent?.displayDamage} damage.`,
        execute: (self, target) => {
          const damage = DamageCalculator.calculateAttackDamage(
            self.intent?.move.baseDamage || 6,
            self,
            target
          );
          target.takeDamage(damage);
        },
      },
    ]),

  red_slaver: () =>
    new Enemy("Slaver (Red)", 46, [
      {
        name: "Stab",
        intentType: IntentType.ATTACK,
        baseDamage: 12,
        description: (self) => `Deals ${self.intent?.displayDamage} damage.`,
        execute: (self, target) => {
          const damage = DamageCalculator.calculateAttackDamage(
            self.intent?.move.baseDamage || 12,
            self,
            target
          );
          target.takeDamage(damage);
        },
      },
      {
        name: "Scrape",
        intentType: IntentType.DEBUFF,
        description: () => "Applies 1 Vulnerable.",
        execute: (_, target) => {
          target.applyStatusEffect("vulnerable", 1, 1);
        },
      },
    ]),

  jaw_worm: () =>
    new Enemy("Jaw Worm", 42, [
      {
        name: "Chomp",
        intentType: IntentType.ATTACK,
        baseDamage: 11,
        description: (self) => `Deals ${self.intent?.displayDamage} damage.`,
        execute: (self, target) => {
          const damage = DamageCalculator.calculateAttackDamage(
            self.intent?.move.baseDamage || 11,
            self,
            target
          );
          target.takeDamage(damage);
        },
      },
      {
        name: "Thrash",
        intentType: IntentType.ATTACK_DEFEND,
        baseDamage: 7,
        baseBlock: 5,
        description: (self) =>
          `Deals ${self.intent?.displayDamage} damage and gains ${self.intent?.displayBlock} Block.`,
        execute: (self, target) => {
          const damage = DamageCalculator.calculateAttackDamage(
            self.intent?.move.baseDamage || 7,
            self,
            target
          );
          target.takeDamage(damage);
          self.addBlock(5);
        },
      },
    ]),

  // --- ELITE ENEMIES ---
  gremlin_nob: () => {
    const nob = new Enemy("Gremlin Nob", 85, [
      {
        name: "Bellow",
        intentType: IntentType.BUFF,
        description: () => "Gains 3 Strength.",
        execute: (self) => {
          self.applyStatusEffect("strength", 3);
        },
      },
      {
        name: "Rush",
        intentType: IntentType.ATTACK,
        baseDamage: 14,
        description: (self) => `Deals ${self.intent?.displayDamage} damage.`,
        execute: (self, target) => {
          const damage = DamageCalculator.calculateAttackDamage(
            self.intent?.move.baseDamage || 14,
            self,
            target
          );
          target.takeDamage(damage);
        },
      },
    ]);
    nob.applyStatusEffect("nob_rage", 2);
    return nob;
  },

  lagavulin: () => {
    const laga = new Enemy("Lagavulin", 110, [
      {
        name: "Siphon Soul",
        intentType: IntentType.DEBUFF,
        description: () => "Drains 2 Strength and 2 Dexterity.",
        execute: (_, target) => {
          // NOTE: Requires Dexterity to be implemented as a status effect.
          // Assuming it works like Strength, we would do:
          target.applyStatusEffect("strength", -2);
          // target.applyStatusEffect('dexterity', -2);
        },
      },
      {
        name: "Attack",
        intentType: IntentType.ATTACK,
        baseDamage: 18,
        description: (self) => `Deals ${self.intent?.displayDamage} damage.`,
        execute: (self, target) => {
          const damage = DamageCalculator.calculateAttackDamage(
            self.intent?.move.baseDamage || 18,
            self,
            target
          );
          target.takeDamage(damage);
        },
      },
    ]);
    laga.applyStatusEffect("asleep", 1);
    // Lagavulin also has a unique mechanic: it wakes up after 3 turns or taking damage.
    // This requires more complex AI in its `determineNextMove` method, which is beyond this scope,
    // but the `asleep` status effect provides the foundation.
    return laga;
  },

  sentries: () => {
    return new Enemy("Sentry", 40, [
      {
        name: "Beam",
        intentType: IntentType.ATTACK,
        baseDamage: 9,
        description: (self) => `Deals ${self.intent?.displayDamage} damage.`,
        execute: (self, target) => {
          const damage = DamageCalculator.calculateAttackDamage(
            self.intent?.move.baseDamage || 9,
            self,
            target
          );
          target.takeDamage(damage);
        },
      },
      {
        name: "Bolt",
        intentType: IntentType.DEBUFF,
        description: () => "Shuffles a Dazed into your discard pile.",
        execute: (_, target) => {
          if (isPlayer(target) && CardLibrary["dazed"]) {
            const dazedCard = CardFactory.createInstance(CardLibrary["dazed"]);
            target.discardPile.push(dazedCard);
          }
        },
      },
    ]);
  },

  // --- BOSSES ---
  the_guardian: () => {
    // This boss requires custom state and AI logic.
    // We'll add a property to track its mode.
    const guardian = new Enemy("The Guardian", 200, [
      {
        name: "Charge Up",
        intentType: IntentType.DEFEND_BUFF,
        description: () => "Gains 20 Block and enters Defensive Mode.",
        execute: (self) => {
          self.addBlock(20);
          self.customState.mode = "defensive";
        },
      },
      {
        name: "Fierce Bash",
        intentType: IntentType.ATTACK,
        baseDamage: 32,
        description: (self) => `Deals ${self.intent?.displayDamage} damage.`,
        execute: (self, target) => {
          const damage = DamageCalculator.calculateAttackDamage(
            32,
            self,
            target
          );
          target.takeDamage(damage);
        },
      },
      {
        name: "Twin Slam",
        intentType: IntentType.ATTACK,
        baseDamage: 8,
        description: () => `Deals 8 damage twice.`,
        execute: (self, target) => {
          for (let i = 0; i < 2; i++) {
            const damage = DamageCalculator.calculateAttackDamage(
              8,
              self,
              target
            );
            target.takeDamage(damage);
          }
        },
      },
      {
        name: "Whirlwind",
        intentType: IntentType.ATTACK,
        baseDamage: 5,
        description: () => `Deals 5 damage 4 times.`,
        execute: (self, target) => {
          for (let i = 0; i < 4; i++) {
            const damage = DamageCalculator.calculateAttackDamage(
              5,
              self,
              target
            );
            target.takeDamage(damage);
          }
        },
      },
    ]);
    guardian.customState.mode = "offensive"; // Custom property for AI
    return guardian;
  },

  hexaghost: () => {
    const ghost = new Enemy("Hexaghost", 250, [
      {
        name: "Activate",
        intentType: IntentType.BUFF,
        description: () => "Readies its attack.",
        execute: () => {},
      },
      {
        name: "Inferno",
        intentType: IntentType.ATTACK_DEBUFF,
        baseDamage: 2,
        description: (self) =>
          `Deals ${self.intent?.displayDamage} damage 6 times and adds Burns.`,
        execute: (self, target) => {
          if (isPlayer(target)) {
            for (let i = 0; i < 6; i++) {
              const damage = DamageCalculator.calculateAttackDamage(
                2,
                self,
                target
              );
              target.takeDamage(damage);
            }
            // Add Burns to the top of the draw pile. This is a complex interaction.
            // For simplicity, we add to discard.
            const burnCard = CardFactory.createInstance(CardLibrary["burn"]);
            target.discardPile.push(burnCard);
          }
        },
      },
      {
        name: "Sear",
        intentType: IntentType.ATTACK_DEBUFF,
        baseDamage: 6,
        description: (self) =>
          `Deals ${self.intent?.displayDamage} damage and adds a Burn to your discard pile.`,
        execute: (self, target) => {
          if (isPlayer(target)) {
            const damage = DamageCalculator.calculateAttackDamage(
              6,
              self,
              target
            );
            target.takeDamage(damage);
            const burnCard = CardFactory.createInstance(CardLibrary["burn"]);
            target.discardPile.push(burnCard);
          }
        },
      },
      {
        name: "Tackle",
        intentType: IntentType.ATTACK,
        baseDamage: 5,
        description: (self) =>
          `Deals ${self.intent?.displayDamage} damage 2 times.`,
        execute: (self, target) => {
          for (let i = 0; i < 2; i++) {
            const damage = DamageCalculator.calculateAttackDamage(
              5,
              self,
              target
            );
            target.takeDamage(damage);
          }
        },
      },
      {
        name: "Inflame",
        intentType: IntentType.BUFF,
        description: () => `Gains 2 Strength.`,
        execute: (self) => self.applyStatusEffect("strength", 2),
      },
    ]);
    // The Hexaghost's AI is the most complex, based on the player's HP and its own turn cycle.
    // The `execute` blocks above provide the building blocks for that AI.
    return ghost;
  },
};
