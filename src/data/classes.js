export const CLASSES = {
  warrior: {
    id: "warrior",
    name: "\u6218\u58eb",
    description: "\u9ad8\u751f\u547d\u548c\u9632\u5fa1\uff0c\u7a33\u5b9a\u8fd1\u6218\u8f93\u51fa\u3002",
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
    name: "\u6cd5\u5e08",
    description: "\u653b\u51fb\u9ad8\uff0c\u9632\u5fa1\u4f4e\uff0c\u6e05\u602a\u6548\u7387\u597d\u3002",
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
    name: "\u6e38\u4fa0",
    description: "\u653b\u901f\u8f83\u5feb\uff0c\u5c5e\u6027\u5747\u8861\u3002",
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
