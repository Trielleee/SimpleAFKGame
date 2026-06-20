export const CLASSES = {
  warrior: {
    id: "warrior",
    name: "战士",
    description: "高生命和防御，稳定近战输出。",
    baseStats: {
      attack: 8,
      defense: 5,
      maxHp: 120,
      attackSpeed: 1,
    },
    growth: {
      attack: 3,
      defense: 2,
      maxHp: 24,
      attackSpeed: 0,
    },
  },
  mage: {
    id: "mage",
    name: "法师",
    description: "攻击高，防御低，清怪效率好。",
    baseStats: {
      attack: 12,
      defense: 2,
      maxHp: 85,
      attackSpeed: 0.9,
    },
    growth: {
      attack: 4,
      defense: 1,
      maxHp: 16,
      attackSpeed: 0,
    },
  },
  ranger: {
    id: "ranger",
    name: "游侠",
    description: "攻速较快，属性均衡。",
    baseStats: {
      attack: 9,
      defense: 3,
      maxHp: 95,
      attackSpeed: 1.25,
    },
    growth: {
      attack: 3,
      defense: 1,
      maxHp: 18,
      attackSpeed: 0.02,
    },
  },
};

export const EXP_TABLE = [0, 30, 80, 150, 250, 390, 560, 760, 1000, 1300];
