import { useState, useEffect } from "react";
import { GameController } from "../../engine/GameController";

// This hook is the magic that connects our vanilla engine to React.
export function useGameEngine() {
  // Get the initial state once.
  const [gameState, setGameState] = useState(() =>
    GameController.getGameState()
  );

  useEffect(() => {
    // The subscribe method returns an `unsubscribe` function.
    const unsubscribe = GameController.subscribe((newState) => {
      // When the engine's state changes, we update our React state.
      setGameState(newState);
    });

    // The cleanup function of useEffect will be called when the component unmounts.
    // This is crucial to prevent memory leaks!
    return () => {
      unsubscribe();
    };
  }, []); // The empty dependency array ensures this runs only once.

  return gameState;
}
