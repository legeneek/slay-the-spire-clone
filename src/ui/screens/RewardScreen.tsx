import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameEngine } from "../hooks/useGameEngine";
import { GameController } from "../../engine/GameController";
// Import our new components
import GoldRewardCard from "../components/rewards/GoldRewardCard";
import RelicRewardCard from "../components/rewards/RelicRewardCard";
import CardChoiceReward from "../components/rewards/CardChoiceReward";

export default function RewardScreen() {
  const { pendingRewards } = useGameEngine();
  // Find a reward of each type. We only expect one of each major type.
  const goldReward = pendingRewards?.find((r) => r.type === "GOLD");
  const relicReward = pendingRewards?.find((r) => r.type === "RELIC");
  const cardChoiceReward = pendingRewards?.find(
    (r) => r.type === "CARD_CHOICE"
  );

  // This effect checks if all rewards have been claimed and proceeds automatically.
  useEffect(() => {
    if (pendingRewards && pendingRewards.length === 0) {
      // Add a small delay for the last item's exit animation to feel natural
      const timer = setTimeout(() => {
        GameController.finishNodeActivity(); // Returns to map
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pendingRewards]);

  return (
    <motion.div className="reward-screen-refactored">
      <h2 className="reward-title">VICTORY!</h2>
      <div className="rewards-grid">
        <AnimatePresence>
          {goldReward && <GoldRewardCard key="gold" reward={goldReward} />}
          {relicReward && <RelicRewardCard key="relic" reward={relicReward} />}
        </AnimatePresence>
      </div>

      {/* The card choice is separate because it has a different layout */}
      <AnimatePresence>
        {cardChoiceReward && <CardChoiceReward key="card-choice" />}
      </AnimatePresence>

      {cardChoiceReward && (
        <button
          className="skip-button"
          onClick={() => GameController.finishRewardStep("CARD_CHOICE")}
        >
          Skip Card
        </button>
      )}
    </motion.div>
  );
}
