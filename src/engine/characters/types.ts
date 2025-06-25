import { CardColor } from "../types/enums";

export interface CharacterDefinition {
  id: string;
  name: string;
  title: string;
  color: CardColor;
  maxHp: number;
  startingRelicId: string;
  startingDeck: string[]; // Array of card IDs
}
