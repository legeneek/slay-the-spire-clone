import { GameController } from "../GameController";
import { Player } from "../entities/Player";

export interface GameEventOption {
  text: string;
  // Condition to check if the option should be displayed
  condition?: (player: Player) => boolean;
  // The action to take when this option is chosen
  consequence: (player: Player, controller: typeof GameController) => void;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  options: GameEventOption[];
}
