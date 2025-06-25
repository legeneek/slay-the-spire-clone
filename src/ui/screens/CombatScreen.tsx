import { useEffect } from "react";
import { useGameEngine } from "../hooks/useGameEngine";
import { useCombatUIStore } from "../state/uiState";
import { GameController } from "../../engine/GameController";
// Import new modular components
import EnemyComponent from "../components/combat/EnemyComponent";
import CardComponent from "../components/CardComponent";
import { AnimatePresence } from "framer-motion";
import { TurnPhase } from "../../engine/combat/types";
import type { CardInstance } from "../../engine/cards/Card";
import PlayerComponent from "../components/combat/PlayerComponent";
import FloatingText from "../components/FloatingText";
import StatusEffectIcon from "../components/combat/StatusEffectIcon";

const EndTurnButton = () => {
  const { phase } = useGameEngine().currentCombat || {};
  const isPlayerTurn = phase === TurnPhase.PLAYER_TURN;

  return (
    <button
      className="end-turn-button"
      onClick={() => GameController.endTurn()}
      disabled={!isPlayerTurn}
    >
      {isPlayerTurn ? "End Turn" : "Enemy Turn"}
    </button>
  );
};

const CombatUI = () => {
  const { currentCombat } = useGameEngine();
  const { floatingTexts } = useCombatUIStore();
  const {
    targetingSource,
    setTargetingSource,
    reset: resetUIState,
  } = useCombatUIStore();

  useEffect(() => {
    resetUIState();
  }, [currentCombat!.turn, resetUIState]);

  const { player, enemies } = currentCombat!;
  const { hoveredTargetId } = useCombatUIStore();
  const hoveredEnemy = enemies.find((e) => e.id === hoveredTargetId);
  const enemyEffectsToShow =
    hoveredEnemy?.statusEffects ||
    enemies.find((e) => e.isAlive())?.statusEffects ||
    [];

  const handleCardClick = (card: CardInstance) => {
    // Prevent action if the card is not playable
    if (player.energy < card.currentCost) {
      return;
    }

    const isAlreadySelected = targetingSource?.instanceId === card.instanceId;

    if (isAlreadySelected) {
      // If the player clicks the same card again, cancel targeting.
      setTargetingSource(null);
    } else {
      // If the card is self-target or has no target, play it immediately.
      if (
        card.definition.targetType === "SELF" ||
        card.definition.targetType === "NONE"
      ) {
        GameController.playCard(card.instanceId);
        // Ensure targeting mode is exited if it was somehow active
        setTargetingSource(null);
      } else {
        // Otherwise, enter targeting mode with this card as the source.
        setTargetingSource(card);
      }
    }
  };

  return (
    <div className="combat-screen-refactored">
      <div className="battlefield">
        <div className="player-area">
          <div className="entity-wrapper">
            <PlayerComponent player={player} />
            {/* Render floating texts for the player */}
            <AnimatePresence>
              {floatingTexts
                .filter((ft) => ft.entityId === player.id)
                .map((ft) => (
                  <FloatingText
                    key={ft.id}
                    id={ft.id}
                    text={ft.text}
                    color={ft.color}
                  />
                ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="enemy-area">
          {enemies.map(
            (enemy) =>
              enemy.isAlive() && (
                <div key={enemy.id} className="entity-wrapper">
                  <EnemyComponent enemy={enemy} />
                  {/* Render floating texts for this specific enemy */}
                  <AnimatePresence>
                    {floatingTexts
                      .filter((ft) => ft.entityId === enemy.id)
                      .map((ft) => (
                        <FloatingText
                          key={ft.id}
                          id={ft.id}
                          text={ft.text}
                          color={ft.color}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              )
          )}
        </div>
      </div>
      <div className="status-bar-zone">
        <div className="player-status-effects">
          {player.statusEffects.map((effect, index) => (
            <StatusEffectIcon
              key={`${effect.definition.id}-${index}`}
              effect={effect}
            />
          ))}
        </div>
        <div className="enemy-status-effects">
          {enemyEffectsToShow.map((effect, index) => (
            <StatusEffectIcon
              key={`${effect.definition.id}-${index}`}
              effect={effect}
            />
          ))}
        </div>
      </div>

      <div className="hand-display">
        <AnimatePresence>
          {player.hand.map((card) => (
            <CardComponent
              key={card.instanceId}
              card={card}
              context={{
                type: "in-hand",
                onSelect: () => handleCardClick(card), // Now this correctly references the function
                isPlayable: player.energy >= card.currentCost,
                isSelected: targetingSource?.instanceId === card.instanceId,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="combat-hud">
        <div className="energy-display">
          <span>
            {player.energy} / {player.maxEnergy}
          </span>
        </div>
        <EndTurnButton />
      </div>
    </div>
  );
};

export default function CombatScreen() {
  const { currentCombat } = useGameEngine();

  return !currentCombat ? <div>Loading combat...</div> : <CombatUI></CombatUI>;
}
