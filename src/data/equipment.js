export const EQUIPMENT_SLOTS = {
  weapon: "\u6b66\u5668",
  helmet: "\u5934\u76d4",
  armor: "\u8863\u670d",
  boots: "\u978b\u5b50",
};

export const QUALITIES = {
  common: {
    id: "common",
    name: "\u666e\u901a",
    className: "quality-common",
    statCount: [1, 1],
    multiplierRange: [0.9, 1.1],
    variance: [0.85, 1.15],
    sellMultiplier: 1,
    weight: 58,
  },
  uncommon: {
    id: "uncommon",
    name: "稀有",
    className: "quality-uncommon",
    statCount: [1, 2],
    multiplierRange: [1.15, 1.45],
    variance: [0.9, 1.2],
    sellMultiplier: 1.5,
    weight: 28,
  },
  rare: {
    id: "rare",
    name: "\u7a00\u6709",
    className: "quality-rare",
    statCount: [2, 3],
    multiplierRange: [1.55, 2],
    variance: [0.95, 1.28],
    sellMultiplier: 2.2,
    weight: 11,
  },
  epic: {
    id: "epic",
    name: "\u53f2\u8bd7",
    className: "quality-epic",
    statCount: [3, 4],
    multiplierRange: [2.1, 2.8],
    variance: [1, 1.35],
    sellMultiplier: 3.5,
    weight: 3,
  },
};

export const SLOT_STAT_POOLS = {
  weapon: [
    { stat: "attack", base: 6, weight: 80 },
    { stat: "attackSpeed", base: 0.035, weight: 20 },
  ],
  helmet: [
    { stat: "maxHp", base: 12, weight: 55 },
    { stat: "defense", base: 2.5, weight: 35 },
    { stat: "attack", base: 2, weight: 10 },
  ],
  armor: [
    { stat: "defense", base: 4.5, weight: 45 },
    { stat: "maxHp", base: 24, weight: 45 },
    { stat: "attack", base: 1.5, weight: 10 },
  ],
  boots: [
    { stat: "attackSpeed", base: 0.035, weight: 40 },
    { stat: "defense", base: 1.8, weight: 30 },
    { stat: "maxHp", base: 10, weight: 30 },
  ],
};
