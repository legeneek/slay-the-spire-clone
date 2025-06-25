import { useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Enemy } from "../../../engine/entities/Enemy";
import { GameController } from "../../../engine/GameController";
import { useCombatUIStore } from "../../state/uiState";
import IntentIcon from "./IntentIcon";
import { usePrevious } from "../../hooks/usePrevious";
import Cultist from "../../../assets/cultist.png";
import Slaver from "../../../assets/slaver.png";
import jawworm from "../../../assets/jaw_worm.png";
import gremlin_nob from "../../../assets/gremlin_nob.png";
import sentry from "../../../assets/sentry.png";

export default function EnemyComponent({ enemy }: { enemy: Enemy }) {
  const { targetingSource, setHoveredTarget } = useCombatUIStore();
  const controls = useAnimation();
  const addFloatingText = useCombatUIStore((state) => state.addFloatingText);
  const prevEnemyState = usePrevious(enemy);
  let enemyArt: any;
  if (enemy.name == "Cultist") {
    enemyArt = Cultist;
  } else if (enemy.name == "Slaver (Red)") {
    enemyArt = Slaver;
  } else if (enemy.name == "Jaw Worm") {
    enemyArt = jawworm;
  } else if (enemy.name == "Gremlin Nob") {
    enemyArt = gremlin_nob;
  } else if (enemy.name == "Sentry") {
    enemyArt = sentry;
  }

  // Effect for damage shake animation and floating text
  useEffect(() => {
    if (!prevEnemyState) return;

    // --- Floating Text Logic ---
    // Damage Taken
    const damageTaken = prevEnemyState.hp - enemy.hp;
    if (damageTaken > 0) {
      addFloatingText(enemy.id, damageTaken, "damage");
    }

    // Block Gained
    const blockGained = enemy.block - prevEnemyState.block;
    if (blockGained > 0) {
      addFloatingText(enemy.id, blockGained, "block");
    }

    // --- Shake Animation Logic ---
    if (damageTaken > 0) {
      controls.start({
        x: [0, -6, 6, -6, 6, -4, 4, 0],
        transition: { duration: 0.4 },
      });
    }
  }, [enemy, prevEnemyState, addFloatingText, controls]);

  const isPotentialTarget = targetingSource !== null;

  const handleEnemyClick = () => {
    if (targetingSource) {
      GameController.playCard(targetingSource.instanceId, enemy.id);
      useCombatUIStore.getState().reset(); // Reset UI state after action
    }
  };

  return (
    <div
      className="entity-container enemy"
      onMouseEnter={() => setHoveredTarget(enemy.id)}
      onMouseLeave={() => setHoveredTarget(null)}
    >
      <motion.div
        className="entity-sprite"
        animate={controls}
        onClick={handleEnemyClick}
      >
        {enemy.intent && <IntentIcon intent={enemy.intent} />}

        <div style={{ position: "relative" }}>
          <div
            style={{
              backgroundImage: `url(${enemyArt})`,
              backgroundSize: "cover",
            }}
            className={`entity-art-placeholder enemy-art ${
              isPotentialTarget ? "targetable" : ""
            }`}
          ></div>
        </div>
      </motion.div>

      <div className="entity-plate">
        <span className="entity-name">{enemy.name}</span>
        <div className="health-bar">
          <div className="hp-text">
            ❤️ {enemy.hp} / {enemy.maxHp}
          </div>
          <motion.div
            className="hp-fill"
            initial={{
              width: `${
                ((prevEnemyState?.hp ?? enemy.hp) / enemy.maxHp) * 100
              }%`,
            }}
            animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <AnimatePresence>
          {enemy.block > 0 && (
            <motion.div
              className="block-plate"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              🛡️ {enemy.block}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
