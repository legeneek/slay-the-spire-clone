# Slay the Spire Clone

This project is a web version of Slay the Spire implemented in 3 days through vibe coding.

## Original Prompt

```
I need your help to develop a web version of Slay the Spire. This process may involve multiple conversations.

Requirements:
1.Implement using TypeScript.
2.Pure client-side, no server-side.
3.Provide a detailed and complete design.
4.Ensure good system design and module separation, with good scalability and readability.
5.Prioritize the implementation of game logic parts unrelated to UI, maintaining UI agnosticism.
6.Select appropriate libraries as needed, specify the version numbers of the libraries used, and avoid using features that are going to be deprecated
```

## Conceptual Diagram

AI-generated conceptual diagram

```
+-----------------------------------------------------------------+
| UI Layer                                                        |
| (React, Vue, Svelte, or Vanilla JS/HTML/CSS)                    |
|                                                                 |
| - Renders Game State (Player HP, Hand, Enemies, etc.)           |
| - Captures User Input (Card Clicks, End Turn Button)            |
+----------------------^---------------------+--------------------+
                       |                     |
                (State Updates)        (User Actions)
                       |                     |
+----------------------v---------------------+--------------------+
| Game Controller (Facade)                                        |
| (The single entry point for the UI)                             |
+-----------------------------------------------------------------+
                       | (Calls methods on managers)
                       v
+-----------------------------------------------------------------+
| Game Engine (Core Logic)                                        |
| +-----------------+ +-----------------+ +---------------------+ |
| | State Manager   | | Event Manager   | | Combat Manager      | |
| | (Zustand)       | | (Pub/Sub)       | | (Turn Logic)        | |
| +-----------------+ +-----------------+ +---------------------+ |
| +-----------------+ +-----------------+ +---------------------+ |
| | Entity Models   | | Card Logic      | | Relic Logic         | |
| | (Player/Enemy)  | | (Definitions)   | | (Passive Effects)   | |
| +-----------------+ +-----------------+ +---------------------+ |
+-----------------------------------------------------------------+
```

## Current Features

- Only the character Ironclad is available
- Some red cards and curse cards have been added, but cards cannot be upgraded
- Only one event is available
- No potions are included
- Only 4 relics are available
- Only Act 1 is implemented
- The encounters and intents of the monsters are random.
- A very rudimentary UI
- AI-generated material images

## How to experience

Start the local server using `npm run dev`, or visit [here](https://legeneek.github.io/mini-game/sts-clone/)
