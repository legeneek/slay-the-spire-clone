// The static definition of a status effect.
export interface StatusEffectDefinition {
  id: string; // e.g., 'strength', 'vulnerable'
  name: string;
  description: (instance: StatusEffectInstance) => string;
  type: "BUFF" | "DEBUFF";
  // How does the effect behave at the end of a turn?
  // DECREMENT: Reduces amount by 1 (e.g., Poison)
  // DURATION: Reduces duration by 1 (e.g., Vulnerable)
  // NONE: Persists without change (e.g., Strength)
  endOfTurnBehavior: "DECREMENT_AMOUNT" | "DECREMENT_DURATION" | "NONE";
}

// A unique instance of a status effect on an Entity.
export interface StatusEffectInstance {
  definition: StatusEffectDefinition;
  amount: number;
  // Optional: for effects that last a specific number of turns
  duration?: number;
}
