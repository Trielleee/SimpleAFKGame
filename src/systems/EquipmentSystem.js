import { EQUIPMENT_SLOTS, QUALITIES, SLOT_BASE_STATS } from "../data/equipment.js";
import { createId } from "../utils/id.js";
import { pickOne, pickWeighted } from "../utils/random.js";

export class EquipmentSystem {
  constructor(gameState, eventBus) {
    this.gameState = gameState;
    this.eventBus = eventBus;
  }

  init() {
    this.eventBus.on("inventory:equipRequested", ({ itemId }) => {
      this.equipFromInventory(itemId);
    });
  }

  createDrop(level) {
    const slot = pickOne(Object.keys(EQUIPMENT_SLOTS));
    const quality = pickWeighted(Object.values(QUALITIES));
    const baseStats = SLOT_BASE_STATS[slot];
    const stats = {};

    for (const [key, value] of Object.entries(baseStats)) {
      stats[key] = Number((value * (1 + level * 0.18) * quality.multiplier).toFixed(2));
    }

    return {
      id: createId("item"),
      name: `${quality.name}${EQUIPMENT_SLOTS[slot]}`,
      slot,
      quality: quality.id,
      level,
      stats,
      sellValue: Math.max(1, Math.round(level * 6 * quality.sellMultiplier)),
    };
  }

  equipFromInventory(itemId) {
    const state = this.gameState.getMutableState();
    const player = state.player;
    if (!player) return;

    const itemIndex = state.inventory.items.findIndex((item) => item.id === itemId);
    if (itemIndex < 0) return;

    const [item] = state.inventory.items.splice(itemIndex, 1);
    const previous = player.equipment[item.slot];
    player.equipment[item.slot] = item;

    if (previous) {
      state.inventory.items.push(previous);
    }

    this.eventBus.emit("equipment:changed", { slot: item.slot, item });
    this.eventBus.emit("combat:log", { message: `\u88c5\u5907\u4e86 ${item.name}` });
    this.eventBus.emit("ui:refreshRequested");
  }

  getEquipmentStats(equipment) {
    const stats = {
      attack: 0,
      defense: 0,
      maxHp: 0,
      attackSpeed: 0,
    };

    for (const item of Object.values(equipment)) {
      if (!item) continue;
      for (const [key, value] of Object.entries(item.stats)) {
        stats[key] = (stats[key] ?? 0) + value;
      }
    }

    return stats;
  }
}
