import { MONSTERS } from "../data/monsters.js";
import { createId } from "../utils/id.js";
import { pickOne } from "../utils/random.js";

export class MonsterSystem {
  createMonsterForMap(map) {
    const template = MONSTERS[pickOne(map.monsterIds)];

    return {
      id: createId("monster"),
      templateId: template.id,
      name: template.name,
      level: template.level,
      maxHp: template.maxHp,
      currentHp: template.maxHp,
      attack: template.attack,
      defense: template.defense,
      attackSpeed: template.attackSpeed,
      expReward: template.expReward,
      goldReward: [...template.goldReward],
    };
  }
}
