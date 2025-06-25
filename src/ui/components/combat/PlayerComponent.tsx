import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Player } from "../../../engine/entities/Player";

import { usePrevious } from "../../hooks/usePrevious";
import { useCombatUIStore } from "../../state/uiState";

export default function PlayerComponent({ player }: { player: Player }) {
  const addFloatingText = useCombatUIStore((state) => state.addFloatingText);

  const prevPlayerState = usePrevious(player);
  const controls = useAnimation();

  useEffect(() => {
    if (!prevPlayerState) return;

    // --- Floating Text Logic ---
    const damageTaken = prevPlayerState.hp - player.hp;
    if (damageTaken > 0) {
      addFloatingText(player.id, damageTaken, "damage");
    }

    const blockGained = player.block - prevPlayerState.block;
    if (blockGained > 0) {
      addFloatingText(player.id, blockGained, "block");
    }

    const healthGained = player.hp - prevPlayerState.hp;
    if (healthGained > 0) {
      addFloatingText(player.id, `+${healthGained}`, "heal");
    }

    // --- Shake Animation Logic ---
    if (damageTaken > 0) {
      controls.start({
        x: [0, -4, 4, -4, 4, 0], // A quick shake
        transition: { duration: 0.3 },
      });
    }
  }, [player, prevPlayerState, addFloatingText, controls]);

  return (
    <div className="entity-container player">
      <motion.div className="entity-sprite" animate={controls}>
        <div className="entity-art-placeholder player-art"></div>
      </motion.div>

      <div className="entity-plate">
        <span className="entity-name">{player.name}</span>
        <div className="health-bar">
          <div className="hp-text">
            ❤️ {player.hp} / {player.maxHp}
          </div>
          <div
            className="hp-fill player"
            style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
          />
        </div>
        {player.block > 0 && (
          <div className="block-plate">🛡️ {player.block}</div>
        )}
      </div>
    </div>
  );
}
