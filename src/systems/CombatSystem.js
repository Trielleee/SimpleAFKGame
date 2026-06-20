import { randomInt } from "../utils/random.js";

export class CombatSystem {
  constructor(gameState, eventBus, mapSystem, monsterSystem, characterSystem, equipmentSystem) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.mapSystem = mapSystem;
    this.monsterSystem = monsterSystem;
    this.characterSystem = characterSystem;
    this.equipmentSystem = equipmentSystem;
  }

  init() {
    this.eventBus.on("game:tick", ({ deltaMs }) => {
      this.tick(deltaMs);
    });
  }

  tick(deltaMs) {
    const state = this.gameState.getMutableState();
    if (!state.player) return;

    state.meta.lastActiveAt = Date.now();

    if (state.combat.status === "resting") {
      this.tickResting(deltaMs);
      return;
    }

    if (!state.combat.monster) {
      this.spawnMonster();
      return;
    }

    this.tickBattle(deltaMs);
  }

  spawnMonster() {
    const state = this.gameState.getMutableState();
    const map = this.mapSystem.getCurrentMap();
    const monster = this.monsterSystem.createMonsterForMap(map);

    state.combat.monster = monster;
    state.combat.status = "fighting";
    state.combat.playerAttackTimer = 0;
    state.combat.monsterAttackTimer = 0;

    this.eventBus.emit("combat:monsterSpawned", { monster });
    this.eventBus.emit("combat:log", { message: `${monster.name} \u51fa\u73b0\u4e86` });
    this.eventBus.emit("ui:refreshRequested");
  }

  tickResting(deltaMs) {
    const state = this.gameState.getMutableState();
    state.combat.respawnTimer -= deltaMs;

    if (state.combat.respawnTimer <= 0) {
      const stats = this.characterSystem.getTotalStats();
      state.player.currentHp = stats.maxHp;
      state.combat.status = "idle";
      state.combat.respawnTimer = 0;
      this.eventBus.emit("combat:log", { message: "\u4f11\u606f\u5b8c\u6bd5\uff0c\u7ee7\u7eed\u5192\u9669" });
    }

    this.eventBus.emit("ui:refreshRequested");
  }

  tickBattle(deltaMs) {
    const state = this.gameState.getMutableState();
    const combat = state.combat;
    const playerStats = this.characterSystem.getTotalStats();
    const monster = combat.monster;

    combat.playerAttackTimer += deltaMs;
    combat.monsterAttackTimer += deltaMs;

    const playerInterval = Math.max(350, 1000 / playerStats.attackSpeed);
    const monsterInterval = Math.max(450, 1000 / monster.attackSpeed);

    if (combat.playerAttackTimer >= playerInterval) {
      combat.playerAttackTimer = 0;
      const damage = this.calculateDamage(playerStats.attack, monster.defense);
      monster.currentHp = Math.max(0, monster.currentHp - damage);
      this.eventBus.emit("combat:log", { message: `\u4f60\u5bf9 ${monster.name} \u9020\u6210 ${damage} \u4f24\u5bb3` });

      if (monster.currentHp <= 0) {
        this.killMonster(monster);
        return;
      }
    }

    if (combat.monsterAttackTimer >= monsterInterval) {
      combat.monsterAttackTimer = 0;
      const damage = this.calculateDamage(monster.attack, playerStats.defense);
      state.player.currentHp = Math.max(0, state.player.currentHp - damage);
      this.eventBus.emit("combat:log", { message: `${monster.name} \u5bf9\u4f60\u9020\u6210 ${damage} \u4f24\u5bb3` });

      if (state.player.currentHp <= 0) {
        this.defeatPlayer();
        return;
      }
    }

    this.eventBus.emit("ui:refreshRequested");
  }

  calculateDamage(attack, defense) {
    const variance = Math.random() * 0.2 + 0.9;
    return Math.max(1, Math.round((attack - defense * 0.45) * variance));
  }

  killMonster(monster) {
    const state = this.gameState.getMutableState();
    const gold = randomInt(monster.goldReward[0], monster.goldReward[1]);
    const map = this.mapSystem.getCurrentMap();

    state.player.gold += gold;
    state.combat.monster = null;
    state.combat.status = "idle";

    this.eventBus.emit("combat:monsterKilled", {
      monster,
      exp: monster.expReward,
      gold,
    });
    this.eventBus.emit("player:expGained", { exp: monster.expReward });
    this.eventBus.emit("combat:log", { message: `\u51fb\u8d25 ${monster.name}\uff0c\u83b7\u5f97 ${monster.expReward} \u7ecf\u9a8c\u3001${gold} \u91d1\u5e01` });

    if (Math.random() < map.dropChance) {
      const item = this.equipmentSystem.createDrop(map.dropLevel);
      this.eventBus.emit("loot:equipmentDropped", { item });
    }

    this.eventBus.emit("ui:refreshRequested");
  }

  defeatPlayer() {
    const state = this.gameState.getMutableState();
    state.combat.status = "resting";
    state.combat.monster = null;
    state.combat.respawnTimer = 4000;

    this.eventBus.emit("combat:playerDefeated");
    this.eventBus.emit("combat:log", { message: "\u4f60\u88ab\u51fb\u5012\u4e86\uff0c\u6b63\u5728\u4f11\u606f" });
    this.eventBus.emit("ui:refreshRequested");
  }
}
