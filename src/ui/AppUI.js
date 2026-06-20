import { CLASSES } from "../data/classes.js";
import { EQUIPMENT_SLOTS, QUALITIES } from "../data/equipment.js";
import { MAPS } from "../data/maps.js";
import { createId } from "../utils/id.js";

export class AppUI {
  constructor(gameState, eventBus, characterSystem) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.characterSystem = characterSystem;
    this.logs = [];
    this.selectedClassId = "warrior";
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.bindGameEvents();
    this.renderClassOptions();
    this.refresh();
  }

  cacheElements() {
    this.createPanel = document.querySelector("#createPanel");
    this.gamePanel = document.querySelector("#gamePanel");
    this.characterName = document.querySelector("#characterName");
    this.classOptions = document.querySelector("#classOptions");
    this.createCharacterBtn = document.querySelector("#createCharacterBtn");
    this.playerName = document.querySelector("#playerName");
    this.playerMeta = document.querySelector("#playerMeta");
    this.goldText = document.querySelector("#goldText");
    this.powerText = document.querySelector("#powerText");
    this.statsView = document.querySelector("#statsView");
    this.mapList = document.querySelector("#mapList");
    this.currentMapText = document.querySelector("#currentMapText");
    this.combatStatus = document.querySelector("#combatStatus");
    this.monsterView = document.querySelector("#monsterView");
    this.logView = document.querySelector("#logView");
    this.equipmentView = document.querySelector("#equipmentView");
    this.inventoryView = document.querySelector("#inventoryView");
  }

  bindEvents() {
    this.createCharacterBtn.addEventListener("click", () => {
      this.eventBus.emit("player:createRequested", {
        name: this.characterName.value,
        classId: this.selectedClassId,
      });
    });

    this.classOptions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-class-id]");
      if (!button) return;

      this.selectedClassId = button.dataset.classId;
      this.renderClassOptions();
    });

    this.mapList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-map-id]");
      if (!button) return;

      this.eventBus.emit("map:switchRequested", { mapId: button.dataset.mapId });
    });

    this.inventoryView.addEventListener("click", (event) => {
      const equipButton = event.target.closest("[data-equip-id]");
      const sellButton = event.target.closest("[data-sell-id]");

      if (equipButton) {
        this.eventBus.emit("inventory:equipRequested", { itemId: equipButton.dataset.equipId });
      }

      if (sellButton) {
        this.eventBus.emit("inventory:sellRequested", { itemId: sellButton.dataset.sellId });
      }
    });
  }

  bindGameEvents() {
    this.eventBus.on("ui:refreshRequested", () => this.refresh());
    this.eventBus.on("save:loaded", () => this.refresh());
    this.eventBus.on("combat:log", ({ message }) => {
      this.logs.unshift({
        id: createId("log"),
        message,
        time: new Date().toLocaleTimeString(),
      });
      this.logs = this.logs.slice(0, 80);
      this.renderLogs();
    });
  }

  renderClassOptions() {
    this.classOptions.innerHTML = Object.values(CLASSES)
      .map((classConfig) => {
        const active = classConfig.id === this.selectedClassId ? "active" : "";
        return `
          <button class="class-card ${active}" type="button" data-class-id="${classConfig.id}">
            <strong>${classConfig.name}</strong>
            <span>${classConfig.description}</span>
            <span>ATK ${classConfig.baseStats.attack} / DEF ${classConfig.baseStats.defense} / HP ${classConfig.baseStats.maxHp}</span>
          </button>
        `;
      })
      .join("");
  }

  refresh() {
    const snapshot = this.gameState.getSnapshot();

    this.createPanel.classList.toggle("hidden", Boolean(snapshot.player));
    this.gamePanel.classList.toggle("hidden", !snapshot.player);

    if (!snapshot.player) return;

    this.renderPlayer(snapshot);
    this.renderMaps(snapshot);
    this.renderCombat(snapshot);
    this.renderEquipment(snapshot);
    this.renderInventory(snapshot);
    this.renderLogs();
  }

  renderPlayer(snapshot) {
    const player = snapshot.player;
    const classConfig = CLASSES[player.classId] ?? CLASSES.warrior;
    const stats = this.characterSystem.getTotalStats();
    const nextExp = this.characterSystem.getNextLevelExp(player.level);

    this.playerName.textContent = player.name;
    this.playerMeta.textContent = `${classConfig.name} Lv.${player.level} - EXP ${player.exp}/${nextExp}`;
    this.goldText.textContent = `Gold ${player.gold}`;
    this.powerText.textContent = `Power ${this.characterSystem.getPower()}`;

    this.statsView.innerHTML = [
      ["HP", `${player.currentHp}/${stats.maxHp}`],
      ["ATK", stats.attack],
      ["DEF", stats.defense],
      ["ASPD", stats.attackSpeed],
    ]
      .map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`)
      .join("");
  }

  renderMaps(snapshot) {
    this.mapList.innerHTML = Object.values(MAPS)
      .map((map) => {
        const active = map.id === snapshot.world.currentMapId ? "active" : "";
        const unlocked = snapshot.world.unlockedMapIds.includes(map.id);
        return `
          <button class="map-button ${active}" type="button" data-map-id="${map.id}" ${unlocked ? "" : "disabled"}>
            <strong>${map.name}</strong>
            <small>Recommended Lv.${map.recommendedLevel}</small>
          </button>
        `;
      })
      .join("");

    this.currentMapText.textContent = MAPS[snapshot.world.currentMapId].name;
  }

  renderCombat(snapshot) {
    const combat = snapshot.combat;
    const monster = combat.monster;
    const statusText = {
      idle: "Searching",
      fighting: "Fighting",
      resting: `Resting ${Math.ceil(combat.respawnTimer / 1000)}s`,
    };

    this.combatStatus.textContent = statusText[combat.status] ?? "Ready";

    if (!monster) {
      this.monsterView.innerHTML = "<p>No target</p>";
      return;
    }

    const hpPercent = Math.max(0, Math.round((monster.currentHp / monster.maxHp) * 100));
    this.monsterView.innerHTML = `
      <div>
        <strong>${monster.name} Lv.${monster.level}</strong>
        <span>${monster.currentHp}/${monster.maxHp} HP</span>
      </div>
      <div class="hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
    `;
  }

  renderEquipment(snapshot) {
    this.equipmentView.innerHTML = Object.entries(EQUIPMENT_SLOTS)
      .map(([slot, label]) => {
        const item = snapshot.player.equipment[slot];
        return `
          <div class="slot-row">
            <div>
              <strong>${label}</strong>
              <span>${item ? this.getItemText(item) : "Empty"}</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  renderInventory(snapshot) {
    const items = snapshot.inventory.items;
    const countText = `${items.length}/${snapshot.inventory.capacity}`;

    if (items.length === 0) {
      this.inventoryView.innerHTML = `<p>Empty ${countText}</p>`;
      return;
    }

    this.inventoryView.innerHTML = `
      <p>${countText}</p>
      ${items
        .map(
          (item) => `
            <div class="item-row">
              <div class="item-main">
                <strong class="${QUALITIES[item.quality].className}">${item.name}</strong>
                <span>${this.getItemText(item)} - Sell ${item.sellValue}</span>
              </div>
              <div class="item-actions">
                <button type="button" data-equip-id="${item.id}">Equip</button>
                <button class="danger" type="button" data-sell-id="${item.id}">Sell</button>
              </div>
            </div>
          `,
        )
        .join("")}
    `;
  }

  renderLogs() {
    if (!this.logView) return;

    this.logView.innerHTML = this.logs
      .map((log) => `<div class="log-line">[${log.time}] ${log.message}</div>`)
      .join("");
  }

  getItemText(item) {
    const labels = {
      attack: "ATK",
      defense: "DEF",
      maxHp: "HP",
      attackSpeed: "ASPD",
    };
    const stats = Object.entries(item.stats)
      .map(([key, value]) => `${labels[key] ?? key} +${value}`)
      .join(" / ");

    return `Lv.${item.level} ${QUALITIES[item.quality].name} - ${stats}`;
  }
}
