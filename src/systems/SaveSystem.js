const SAVE_KEY = "simple-afk-rpg-save-v1";

export class SaveSystem {
  constructor(gameState, eventBus) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.saveTimer = null;
  }

  init() {
    this.load();

    this.eventBus.on("player:created", () => this.save());
    this.eventBus.on("map:switched", () => this.save());
    this.eventBus.on("equipment:changed", () => this.save());
    this.eventBus.on("inventory:itemAdded", () => this.save());
    this.eventBus.on("player:levelUp", () => this.save());

    this.saveTimer = window.setInterval(() => this.save(), 5000);
    window.addEventListener("beforeunload", () => this.save());
  }

  load() {
    const rawSave = window.localStorage.getItem(SAVE_KEY);
    if (!rawSave) return false;

    try {
      const parsed = JSON.parse(rawSave);
      this.gameState.replace(parsed);
      this.eventBus.emit("save:loaded", { state: this.gameState.getSnapshot() });
      return true;
    } catch (error) {
      console.warn("Save load failed", error);
      return false;
    }
  }

  save() {
    const state = this.gameState.getMutableState();
    state.meta.lastSavedAt = Date.now();
    state.meta.lastActiveAt = Date.now();
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    this.eventBus.emit("save:saved");
  }
}
