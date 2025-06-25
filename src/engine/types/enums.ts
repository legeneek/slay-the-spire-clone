export enum CardType {
  ATTACK = "ATTACK",
  SKILL = "SKILL",
  POWER = "POWER",
  STATUS = "STATUS",
  CURSE = "CURSE",
}

export enum TargetType {
  SELF = "SELF",
  SINGLE_ENEMY = "SINGLE_ENEMY",
  ALL_ENEMIES = "ALL_ENEMIES",
  NONE = "NONE",
}

export enum GamePhase {
  MAIN_MENU = "MAIN_MENU",
  CHARACTER_SELECT = "CHARACTER_SELECT",
  MAP = "MAP",
  COMBAT = "COMBAT",
  EVENT = "EVENT",
  REST = "REST",
  SHOP = "SHOP",
  REWARD = "REWARD",
}

export enum CardColor {
  RED = "RED", // For Ironclad
  GREEN = "GREEN", // For Silent
  BLUE = "BLUE", // For Defect
  COLORLESS = "COLORLESS",
  CURSE = "CURSE",
}
