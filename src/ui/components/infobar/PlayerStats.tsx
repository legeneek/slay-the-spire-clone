import { Player } from "../../../engine/entities/Player";

export default function PlayerStats({ player }: { player: Player }) {
  return (
    <div className="player-stats-group">
      <div className="stat-item hp">
        ❤️ {player.hp} / {player.maxHp}
      </div>
      <div className="stat-item gold">💰 {player.gold}</div>
    </div>
  );
}
