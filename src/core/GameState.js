const initialState = {
  player: null,
  inventory: {
    capacity: 20,
    items: [],
  },
  world: {
    currentMapId: "novice_plains",
    unlockedMapIds: ["novice_plains", "gloom_forest", "broken_mine"],
  },
  combat: {
    status: "idle",
    monster: null,
    playerAttackTimer: 0,
    monsterAttackTimer: 0,
    respawnTimer: 0,
  },
  meta: {
    createdAt: null,
    lastSavedAt: null,
    lastActiveAt: null,
  },
};

function clone(value) {
  if (globalThis.structuredClone) {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

export class GameState {
  constructor() {
    this.state = clone(initialState);
  }

  replace(nextState) {
    this.state = {
      ...clone(initialState),
      ...clone(nextState),
      inventory: {
        ...initialState.inventory,
        ...nextState.inventory,
      },
      world: {
        ...initialState.world,
        ...nextState.world,
      },
      combat: {
        ...initialState.combat,
        ...nextState.combat,
      },
      meta: {
        ...initialState.meta,
        ...nextState.meta,
      },
    };
  }

  getMutableState() {
    return this.state;
  }

  getSnapshot() {
    return clone(this.state);
  }
}
