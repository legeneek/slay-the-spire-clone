import { Entity } from "./Entity";
import type { CardInstance } from "../cards/Card"; // Will define this next
import type { RelicInstance } from "../relics/types"; // Will define this later
import type { PotionDefinition } from "../potions/types";
import type { CardColor } from "../types/enums";

export class Player extends Entity {
  public energy: number;
  public maxEnergy: number;
  public relics: RelicInstance[];
  public gold: number;
  public color: CardColor;

  public potionSlots: number;
  public potions: PotionDefinition[];

  // The player's full deck
  public deck: CardInstance[];

  // In-combat piles
  public hand: CardInstance[];
  public drawPile: CardInstance[];
  public discardPile: CardInstance[];
  public exhaustPile: CardInstance[];
  public powersInPlay: CardInstance[];

  constructor(
    name: string,
    maxHp: number,
    startingDeck: CardInstance[],
    color: CardColor
  ) {
    super(name, maxHp);
    this.maxEnergy = 3;
    this.energy = this.maxEnergy;
    this.relics = [];
    this.gold = 99;
    this.color = color;

    this.potionSlots = 3;
    this.potions = [];

    this.deck = startingDeck;
    this.hand = [];
    this.drawPile = [];
    this.discardPile = [];
    this.exhaustPile = [];
    this.powersInPlay = [];
  }
}
