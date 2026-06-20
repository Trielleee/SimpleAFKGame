# Simple AFK RPG Architecture

本文档说明当前项目的架构边界、模块职责和依赖规则。项目目标是练习高内聚、低耦合的单机网页放置 RPG 架构，而不是把所有功能堆进一个文件。

## 架构目标

- 使用原生 HTML / CSS / JavaScript。
- 使用 ES Modules 拆分模块。
- 游戏核心逻辑不直接操作 DOM。
- UI 层不直接修改游戏核心数据。
- 存档系统只负责序列化和反序列化 GameState。
- 系统之间优先通过 EventBus 通信。
- GameState 统一保存游戏状态。
- 每个 JS 文件只负责一个明确职责。

## 文件结构

```text
index.html
architecture.md
src/
  main.js
  styles.css
  core/
    EventBus.js
    GameLoop.js
    GameState.js
  data/
    classes.js
    equipment.js
    maps.js
    monsters.js
  systems/
    CharacterSystem.js
    CombatSystem.js
    EquipmentSystem.js
    InventorySystem.js
    MapSystem.js
    MonsterSystem.js
    OfflineRewardSystem.js
    SaveSystem.js
  ui/
    AppUI.js
  utils/
    random.js
```

## 模块职责

### `src/main.js`

应用入口，只负责创建模块实例、注入依赖、调用 `init()` 和启动主循环。

`main.js` 不应该包含具体游戏规则、DOM 渲染逻辑或存档细节。

### `src/core/EventBus.js`

事件总线，负责模块之间的发布和订阅。

它让 UI、战斗、背包、角色、存档等模块不需要直接互相知道内部实现。

### `src/core/GameState.js`

统一游戏状态容器。

提供：

- `getMutableState()`：只给系统层使用，用于受控修改状态。
- `getSnapshot()`：给 UI 等只读场景使用，返回深拷贝。
- `replace()`：给存档读取使用，用保存数据替换当前状态。

### `src/core/GameLoop.js`

游戏主循环，只负责按固定间隔发送 `game:tick` 事件。

它不处理战斗、不加经验、不掉装备，只做调度。

### `src/data/*.js`

静态配置层。

- `classes.js`：职业配置和经验表。
- `maps.js`：地图配置。
- `monsters.js`：怪物模板。
- `equipment.js`：装备部位、品质、基础属性配置。

data 层只能导出配置，不应该依赖任何系统或 UI。

### `src/systems/CharacterSystem.js`

角色系统。

负责：

- 创建角色。
- 增加经验。
- 等级提升。
- 增加金币。
- 计算角色总属性。
- 计算战力。

它可以读取职业配置和装备系统提供的装备属性加成。

### `src/systems/MapSystem.js`

地图系统。

负责：

- 当前地图查询。
- 地图切换。
- 切换地图时重置战斗状态。

地图系统不负责生成怪物，也不负责掉落计算。

### `src/systems/MonsterSystem.js`

怪物系统。

负责根据地图的怪物池，从 `data/monsters.js` 中创建一个战斗用怪物实例。

它不修改 GameState，也不操作 UI。

### `src/systems/CombatSystem.js`

战斗系统。

负责：

- 监听 `game:tick`。
- 自动生成怪物。
- 计算玩家和怪物的攻击。
- 处理怪物死亡。
- 处理玩家死亡和休息。
- 发出经验、金币、掉落和日志事件。

战斗系统只处理战斗计算，不直接渲染界面。

### `src/systems/EquipmentSystem.js`

装备系统。

负责：

- 生成掉落装备。
- 计算装备属性加成。
- 执行穿戴装备。
- 将替换下来的装备放回背包。

装备系统不负责背包容量判断，也不负责 UI 展示。

### `src/systems/InventorySystem.js`

背包系统。

负责：

- 接收掉落装备。
- 检查背包容量。
- 出售背包装备。
- 发出背包变化事件。

背包系统不负责装备属性计算。

### `src/systems/SaveSystem.js`

存档系统。

负责：

- 从 localStorage 读取存档。
- 将 GameState 序列化到 localStorage。
- 定时自动保存。
- 在关键事件后保存。

存档系统不应该调用 UI，也不应该包含战斗、离线收益或装备规则。

### `src/systems/OfflineRewardSystem.js`

离线收益系统。

负责：

- 根据上次活跃时间计算离线时长。
- 根据当前地图和角色战力计算经验、金币和少量装备收益。
- 应用离线收益。

离线收益逻辑独立于 UI 和 SaveSystem。

### `src/ui/AppUI.js`

UI 控制器。

负责：

- 查询 DOM。
- 渲染角色、地图、战斗、装备、背包、日志。
- 监听按钮点击。
- 把用户操作转换成事件请求。

UI 只能使用 `GameState.getSnapshot()` 读取状态，不能直接修改状态。

### `src/utils/random.js`

通用随机工具。

负责：

- 随机整数。
- 随机选择一个元素。
- 按权重随机选择。

## 模块通信方式

模块之间主要通过 `EventBus` 通信。

典型流程：

```text
UI 点击创建角色
  -> emit player:createRequested
  -> CharacterSystem 创建角色
  -> emit player:created
  -> UI 收到 ui:refreshRequested 后刷新
```

```text
GameLoop 每秒 tick
  -> emit game:tick
  -> CombatSystem 计算战斗
  -> emit player:expGained / loot:equipmentDropped / combat:log
  -> CharacterSystem / InventorySystem / UI 分别处理
```

```text
UI 点击穿戴装备
  -> emit inventory:equipRequested
  -> EquipmentSystem 修改装备状态
  -> emit equipment:changed
  -> SaveSystem 自动保存
  -> UI 刷新
```

## 主要事件

- `game:tick`：游戏主循环 tick。
- `player:createRequested`：UI 请求创建角色。
- `player:created`：角色已创建。
- `player:expGained`：角色获得经验。
- `player:levelUp`：角色升级。
- `map:switchRequested`：UI 请求切换地图。
- `map:switched`：地图已切换。
- `combat:monsterSpawned`：生成怪物。
- `combat:monsterKilled`：怪物死亡。
- `combat:playerDefeated`：玩家被击倒。
- `combat:log`：新增战斗日志。
- `loot:equipmentDropped`：掉落装备。
- `inventory:itemAdded`：装备进入背包。
- `inventory:equipRequested`：UI 请求穿戴装备。
- `inventory:sellRequested`：UI 请求出售装备。
- `equipment:changed`：装备发生变化。
- `save:loaded`：存档读取完成。
- `save:saved`：存档保存完成。
- `offline:rewardApplied`：离线收益已结算。
- `ui:refreshRequested`：请求 UI 刷新。

## 允许的依赖

### 入口层

`main.js` 可以依赖所有模块，用于组装应用。

允许：

```text
main.js -> core/*
main.js -> systems/*
main.js -> ui/AppUI.js
```

### UI 层

UI 可以依赖：

```text
AppUI -> EventBus
AppUI -> GameState.getSnapshot()
AppUI -> data/*
AppUI -> CharacterSystem 的只读计算方法
```

UI 可以发送事件请求系统执行操作。

### 系统层

系统可以依赖：

```text
systems/* -> EventBus
systems/* -> GameState.getMutableState()
systems/* -> data/*
systems/* -> utils/*
```

系统之间可以通过构造函数注入少量公开方法，例如：

```text
CombatSystem -> CharacterSystem.getTotalStats()
CombatSystem -> EquipmentSystem.createDrop()
InventorySystem -> CharacterSystem.addGold()
```

这类依赖应保持明确、少量、单向。

### 数据层

data 层可以被其他模块读取。

允许：

```text
systems/* -> data/*
ui/* -> data/*
```

## 禁止的依赖

### UI 禁止直接修改 GameState

禁止：

```js
gameState.getMutableState().player.gold += 100;
snapshot.player.gold = 100;
state.inventory.items.push(item);
```

UI 应该发送事件：

```js
eventBus.emit("inventory:equipRequested", { itemId });
eventBus.emit("map:switchRequested", { mapId });
```

### 核心逻辑禁止操作 DOM

禁止在 `core/*` 和 `systems/*` 中出现：

```js
document.querySelector(...)
element.innerHTML = ...
element.addEventListener(...)
```

DOM 操作只能放在 `ui/*`。

### SaveSystem 禁止耦合 UI 或具体玩法

禁止：

```text
SaveSystem -> AppUI
SaveSystem -> CombatSystem 内部战斗规则
SaveSystem -> OfflineRewardSystem 具体收益公式
```

SaveSystem 只关心 GameState 的保存和读取。

### data 层禁止依赖业务模块

禁止：

```text
data/* -> systems/*
data/* -> ui/*
data/* -> core/*
```

data 层应保持纯配置。

### 禁止循环依赖

禁止出现：

```text
CharacterSystem -> CombatSystem -> CharacterSystem
EquipmentSystem -> InventorySystem -> EquipmentSystem
AppUI -> System -> AppUI
```

需要互相通知时，使用 EventBus。

## GameState 数据结构

当前核心状态大致如下：

```js
{
  player: {
    id,
    name,
    classId,
    level,
    exp,
    gold,
    baseStats,
    currentHp,
    equipment: {
      weapon,
      helmet,
      armor,
      boots,
    },
  },
  inventory: {
    capacity,
    items,
  },
  world: {
    currentMapId,
    unlockedMapIds,
  },
  combat: {
    status,
    monster,
    playerAttackTimer,
    monsterAttackTimer,
    respawnTimer,
  },
  meta: {
    createdAt,
    lastSavedAt,
    lastActiveAt,
  },
}
```

## 扩展建议

新增职业：优先修改 `data/classes.js`。  
新增地图：优先修改 `data/maps.js`。  
新增怪物：优先修改 `data/monsters.js`。  
新增装备品质或部位：优先修改 `data/equipment.js`，再检查 UI 是否需要展示新部位。  
新增任务系统：新增 `TaskSystem.js`，通过监听 `monsterKilled`、`levelUp`、`itemObtained` 等事件推进任务。  
新增副本系统：新增 `DungeonSystem.js`，不要把副本规则写进 `MapSystem` 或 `CombatSystem` 内部。  

## 当前架构检查结论

- UI 只负责渲染和发送事件请求。
- 核心系统不直接操作 DOM。
- SaveSystem 不处理 UI 和离线收益公式。
- data 层保持纯配置。
- main.js 只做依赖组装。
- 当前没有发现循环 import。
