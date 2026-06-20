import { CLASSES, EXP_TABLE } from "../data/classes.js";
import { createId } from "../utils/id.js";

export class CharacterSystem {
  constructor(gameState, eventBus, equipmentSystem) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.equipmentSystem = equipmentSystem;
  }

  init() {
    this.eventBus.on("player:createRequested", ({ name, classId }) => {
      this.createCharacter(name, classId);
    });

    this.eventBus.on("player:expGained", ({ exp }) => {
      this.addExp(exp);
    });
  }

  createCharacter(name, classId) {
    const classConfig = CLASSES[classId] ?? CLASSES.warrior;
    const state = this.gameState.getMutableState();
    const now = Date.now();

    state.player = {
      id: createId("player"),
      name: name.trim() || "冒险者",
      classId: classConfig.id,
      level: 1,
      exp: 0,
      gold: 0,
      baseStats: { ...classConfig.baseStats },
      currentHp: classConfig.baseStats.maxHp,
      equipment: {
        weapon: null,
        helmet: null,
        armor: null,
        boots: null,
      },
    };

    state.inventory.items = [];
    state.world.currentMapId = "novice_plains";
    state.combat.status = "idle";
    state.combat.monster = null;
    state.combat.playerAttackTimer = 0;
    state.combat.monsterAttackTimer = 0;
    state.combat.respawnTimer = 0;
    state.meta.createdAt = now;
    state.meta.lastActiveAt = now;

    this.eventBus.emit("player:created", { player: state.player });
    this.eventBus.emit("ui:refreshRequested");
  }

  addExp(exp) {
    const state = this.gameState.getMutableState();
    if (!state.player) return;

    state.player.exp += exp;
    let leveled = false;

    while (state.player.exp >= this.getNextLevelExp(state.player.level)) {
      state.player.exp -= this.getNextLevelExp(state.player.level);
      this.levelUp();
      leveled = true;
    }

    if (!leveled) {
      this.eventBus.emit("ui:refreshRequested");
    }
  }

  addGold(gold) {
    const state = this.gameState.getMutableState();
    if (!state.player) return;

    state.player.gold += gold;
    this.eventBus.emit("ui:refreshRequested");
  }

  levelUp() {
    const state = this.gameState.getMutableState();
    const player = state.player;
    const classConfig = CLASSES[player.classId];

    player.level += 1;
    player.baseStats.attack += classConfig.growth.attack;
    player.baseStats.defense += classConfig.growth.defense;
    player.baseStats.maxHp += classConfig.growth.maxHp;
    player.baseStats.attackSpeed += classConfig.growth.attackSpeed;
    player.currentHp = this.getTotalStats().maxHp;

    this.eventBus.emit("player:levelUp", { level: player.level });
    this.eventBus.emit("combat:log", { message: `等级提升到 ${player.level}` });
    this.eventBus.emit("ui:refreshRequested");
  }

  getNextLevelExp(level) {
    return EXP_TABLE[level] ?? EXP_TABLE[EXP_TABLE.length - 1] + (level - EXP_TABLE.length + 1) * 420;
  }

  getTotalStats() {
    const state = this.gameState.getMutableState();
    if (!state.player) return null;

    const bonus = this.equipmentSystem.getEquipmentStats(state.player.equipment);
    const base = state.player.baseStats;

    return {
      attack: Math.round(base.attack + bonus.attack),
      defense: Math.round(base.defense + bonus.defense),
      maxHp: Math.round(base.maxHp + bonus.maxHp),
      attackSpeed: Number((base.attackSpeed + bonus.attackSpeed).toFixed(2)),
    };
  }

  getPower() {
    const stats = this.getTotalStats();
    if (!stats) return 0;

    return Math.round(stats.attack * 6 + stats.defense * 4 + stats.maxHp * 0.45 + stats.attackSpeed * 25);
  }
}
