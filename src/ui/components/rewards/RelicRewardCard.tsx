import { motion } from "framer-motion";
import { GameController } from "../../../engine/GameController";
import { type RelicReward } from "../../../engine/rewards/types";

export default function RelicRewardCard({ reward }: { reward: RelicReward }) {
  const handleClaim = () => {
    GameController.claimReward(reward);
  };

  return (
    <motion.div
      className="reward-card relic-reward"
      onClick={handleClaim}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
      whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px gold" }}
    >
      <div className="relic-icon-img">{reward.relic.name.charAt(0)}</div>
      <strong>{reward.relic.name}</strong>
      <p>{reward.relic.description}</p>
    </motion.div>
  );
}
