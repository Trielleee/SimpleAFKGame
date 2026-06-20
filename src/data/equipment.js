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
    multiplier: 1,
    sellMultiplier: 1,
    weight: 58,
  },
  uncommon: {
    id: "uncommon",
    name: "\u4f18\u79c0",
    className: "quality-uncommon",
    multiplier: 1.35,
    sellMultiplier: 1.5,
    weight: 28,
  },
  rare: {
    id: "rare",
    name: "\u7a00\u6709",
    className: "quality-rare",
    multiplier: 1.8,
    sellMultiplier: 2.2,
    weight: 11,
  },
  epic: {
    id: "epic",
    name: "\u53f2\u8bd7",
    className: "quality-epic",
    multiplier: 2.5,
    sellMultiplier: 3.5,
    weight: 3,
  },
};

export const SLOT_BASE_STATS = {
  weapon: { attack: 6 },
  helmet: { defense: 2, maxHp: 10 },
  armor: { defense: 4, maxHp: 20 },
  boots: { defense: 1, maxHp: 8, attackSpeed: 0.03 },
};
