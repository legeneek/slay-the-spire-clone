import { type EnemyIntent, IntentType } from "../../../engine/entities/Enemy";
// Assume you have SVGs for icons
// import AttackIcon from '../assets/attack-intent.svg';
// import DefendIcon from '../assets/defend-intent.svg';

const getIntentIcon = (type: IntentType) => {
  switch (type) {
    case IntentType.ATTACK:
      return "⚔️"; // Placeholder
    case IntentType.DEFEND:
      return "🛡️"; // Placeholder
    case IntentType.ATTACK_DEFEND:
      return "⚔️🛡️"; // Placeholder
    case IntentType.BUFF:
      return "💪"; // Placeholder
    case IntentType.DEBUFF:
      return "💀"; // Placeholder
    default:
      return "?";
  }
};

export default function IntentIcon({ intent }: { intent: EnemyIntent }) {
  return (
    <div className="intent-display">
      <span className="intent-icon">
        {getIntentIcon(intent.move.intentType)}
      </span>
      {intent.displayDamage && (
        <span className="intent-value">{intent.displayDamage}</span>
      )}
    </div>
  );
}
