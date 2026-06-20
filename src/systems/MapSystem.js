import { MAPS } from "../data/maps.js";

export class MapSystem {
  constructor(gameState, eventBus) {
    this.gameState = gameState;
    this.eventBus = eventBus;
  }

  init() {
    this.eventBus.on("map:switchRequested", ({ mapId }) => {
      this.switchMap(mapId);
    });
  }

  switchMap(mapId) {
    const state = this.gameState.getMutableState();
    if (!MAPS[mapId] || !state.world.unlockedMapIds.includes(mapId)) return;

    state.world.currentMapId = mapId;
    state.combat.status = "idle";
    state.combat.monster = null;
    state.combat.playerAttackTimer = 0;
    state.combat.monsterAttackTimer = 0;
    state.combat.respawnTimer = 0;

    this.eventBus.emit("map:switched", { mapId });
    this.eventBus.emit("combat:log", { message: `Moved to ${MAPS[mapId].name}` });
    this.eventBus.emit("ui:refreshRequested");
  }

  getCurrentMap() {
    const state = this.gameState.getMutableState();
    return MAPS[state.world.currentMapId];
  }
}
