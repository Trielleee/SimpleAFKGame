export class InventorySystem {
  constructor(gameState, eventBus, characterSystem) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.characterSystem = characterSystem;
  }

  init() {
    this.eventBus.on("loot:equipmentDropped", ({ item }) => {
      this.addItem(item);
    });

    this.eventBus.on("inventory:sellRequested", ({ itemId }) => {
      this.sellItem(itemId);
    });
  }

  addItem(item) {
    const state = this.gameState.getMutableState();
    if (state.inventory.items.length >= state.inventory.capacity) {
      this.eventBus.emit("combat:log", { message: `Inventory full, dropped ${item.name}` });
      return false;
    }

    state.inventory.items.push(item);
    this.eventBus.emit("inventory:itemAdded", { item });
    this.eventBus.emit("combat:log", { message: `Obtained ${item.name}` });
    this.eventBus.emit("ui:refreshRequested");
    return true;
  }

  sellItem(itemId) {
    const state = this.gameState.getMutableState();
    const itemIndex = state.inventory.items.findIndex((item) => item.id === itemId);
    if (itemIndex < 0) return;

    const [item] = state.inventory.items.splice(itemIndex, 1);
    this.characterSystem.addGold(item.sellValue);
    this.eventBus.emit("combat:log", { message: `Sold ${item.name} for ${item.sellValue} gold` });
    this.eventBus.emit("ui:refreshRequested");
  }
}
