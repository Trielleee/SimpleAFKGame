export class OfflineRewardSystem {
  constructor(gameState, eventBus, mapSystem, characterSystem, equipmentSystem, inventorySystem) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.mapSystem = mapSystem;
    this.characterSystem = characterSystem;
    this.equipmentSystem = equipmentSystem;
    this.inventorySystem = inventorySystem;
  }

  applyOnLoad() {
    const state = this.gameState.getMutableState();
    if (!state.player || !state.meta.lastActiveAt) return;

    const elapsedSeconds = Math.floor((Date.now() - state.meta.lastActiveAt) / 1000);
    const cappedSeconds = Math.min(elapsedSeconds, 60 * 60 * 8);
    if (cappedSeconds < 30) return;

    const map = this.mapSystem.getCurrentMap();
    const power = this.characterSystem.getPower();
    const kills = Math.max(1, Math.floor((cappedSeconds / 45) * Math.max(0.5, power / 120)));
    const exp = kills * map.recommendedLevel * 5;
    const gold = kills * map.recommendedLevel * 3;
    const itemCount = Math.random() < Math.min(0.6, kills * 0.04) ? 1 : 0;

    state.player.gold += gold;
    this.eventBus.emit("player:expGained", { exp });

    for (let index = 0; index < itemCount; index += 1) {
      this.inventorySystem.addItem(this.equipmentSystem.createDrop(map.dropLevel));
    }

    this.eventBus.emit("offline:rewardApplied", {
      seconds: cappedSeconds,
      exp,
      gold,
      itemCount,
    });
    this.eventBus.emit("combat:log", {
      message: `离线 ${Math.floor(cappedSeconds / 60)} 分钟，获得 ${exp} 经验、${gold} 金币`,
    });
    this.eventBus.emit("ui:refreshRequested");
  }
}
