import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameController } from "../../../engine/GameController";
import { type GoldReward } from "../../../engine/rewards/types";

export default function GoldRewardCard({ reward }: { reward: GoldReward }) {
  const [isClaimed, setIsClaimed] = useState(false);

  useEffect(() => {
    // Automatically claim the gold and animate out.
    GameController.claimReward(reward);
    const timer = setTimeout(() => setIsClaimed(true), 1500); // Wait 1.5s before disappearing
    return () => clearTimeout(timer);
  }, [reward]);

  if (isClaimed) return null;

  return (
    <motion.div
      className="reward-card gold-reward"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      💰
      <h3>{reward.amount} Gold</h3>
    </motion.div>
  );
}
