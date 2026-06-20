export const EQUIPMENT_SLOTS = {
  weapon: "Weapon",
  helmet: "Helmet",
  armor: "Armor",
  boots: "Boots",
};

export const QUALITIES = {
  common: {
    id: "common",
    name: "Common",
    className: "quality-common",
    multiplier: 1,
    sellMultiplier: 1,
    weight: 58,
  },
  uncommon: {
    id: "uncommon",
    name: "Uncommon",
    className: "quality-uncommon",
    multiplier: 1.35,
    sellMultiplier: 1.5,
    weight: 28,
  },
  rare: {
    id: "rare",
    name: "Rare",
    className: "quality-rare",
    multiplier: 1.8,
    sellMultiplier: 2.2,
    weight: 11,
  },
  epic: {
    id: "epic",
    name: "Epic",
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
