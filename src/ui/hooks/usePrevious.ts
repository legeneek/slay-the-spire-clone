import { useEffect, useRef } from "react";

/**
 * A custom React hook that tracks the value of a state or prop from the previous render cycle.
 * @param value The value to track. Can be of any type.
 * @returns The value from the previous render, or `undefined` on the initial render.
 *
 * @example
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count); // On first render, prevCount is undefined. After count becomes 1, prevCount will be 0.
 */
export function usePrevious<T>(value: T): T | undefined {
  // 1. Initialize a ref. The `current` property can hold any value and persists across renders without causing re-renders itself.
  const ref = useRef<T>(undefined);

  // 2. Use the useEffect hook. This code will run *after* the component has finished rendering.
  useEffect(() => {
    // 3. After the render is complete, update the ref's `current` property with the value that was just rendered.
    ref.current = value;
  }); // 4. By not providing a dependency array, this effect runs after *every* single render.

  // 5. During the render phase, return the value that the ref was holding *before* the effect ran.
  // This is the value from the previous render cycle.
  return ref.current;
}
