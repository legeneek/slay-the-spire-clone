import { type RelicDefinition } from "./types";
import { type RelicInstance } from "./types";

export class RelicFactory {
  static createInstance(definition: RelicDefinition): RelicInstance {
    return {
      definition,
      instanceState: {}, // Start with an empty state object
    };
  }
}
