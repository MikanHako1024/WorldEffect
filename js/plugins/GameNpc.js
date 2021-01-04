class NPCPattern {
  conditions = [];
  behaviorName = '';
  dialogueName = '';
  actionName = '';
  routine = [];
  patrol = [];
  constructor(conditions = [], 
      behaviorName = '',
      dialogueName = '',
      actionName = '',
      routine = [],
      patrol = []) {
    this.conditions = conditions;
    this.behaviorName = behaviorName;
    this.dialogueName = dialogueName;
    this.actionName = actionName;
    this.routine = routine;
    this.patrol = patrol;
  }
  evaluate(condition) {
    return condition(); // temp
  }
}

class MapGraph {
  nodes = [];
  findRoutine(pos, dest) {
    // temp
    if (pos[0] !== dest.mapId) return [new PathNode(8, 17, 14, 2)];
    return [];
  }
}
window.$gameMapGraph = new MapGraph();

class PathNode {
  pos = [-1, -1, -1, -1];
  cost = 0;
  get mapId() {
    return this.pos[0];
  }
  get x() {
    return this.pos[1];
  }
  get y() {
    return this.pos[2];
  }
  get d() {
    return this.pos[3];
  }
  constructor(mapId, x, y, d, cost=1) {
    this.pos = [mapId, x, y, d];
    this.cost = cost;
  }
}

class Game_NPCEvent extends Game_Event {
  static loadNewEvent(name) {

  }

  /*
  // temp
  unloadFromScene() {
    const characterSprites = SceneManager._scene._spriteset._characterSprites;
    const sId = characterSprites.findIndex((s) => s._character === this);
    if (sId >= 0) {
      const s = characterSprites[sId];
      characterSprites[sId] = null;
      SceneManager._scene._spriteset._tilemap.removeChild(s);
    }
    $gameMap._events[this._eventId] = null;
  }

  // temp
  loadToScene() {
    
  }
  */
}

class Game_NPC {
  offSceneCounter = 0;
  patterns = [];
  routine = [];
  patrol = [];
  pos = [-1, -1, -1, -1];
  dialogueName = '';
  behaviorName = '';
  actionName = '';

  get mapId() {
    return this.pos[0];
  }
  get x() {
    return this.pos[1];
  }
  get y() {
    return this.pos[2];
  }
  get d() {
    return this.pos[3];
  }

  //constructor(name) {
  //  this.name = name;
  //}
  constructor(eventData) {
    this.name = eventData.name;
    this.eventData = eventData;
  }

  setPos(pos) {
    this.pos = pos;
    this.eventData.mapId = pos[0];
    this.eventData.payload.pos = [pos[1], pos[2]];
    $gameSelfData.setValue(this.event.getDataKey('pos'), [pos[1], pos[2]]);
  }

  setEvent(event) {
    this.event = event;
    this.pos = [event._mapId, event.x, event.y, event._direction];
    event.setPosition(this.x, this.y);
    event.setDirection(this.d);
  }

  routineIsEmpty() {
    return !this.routine.length;
  }

  patrolIsEmpty() {
    return !this.patrol.length;
  }

  // 场景外NPC更新
  offSceneUpdate(deltaTime) {
    let list;
    let dest;

    // 设置队列list的值:
    if (this.routineIsEmpty()) {
      if (this.patrolIsEmpty()) return;
      list = this.patrol;
    } else {
      list = this.routine;
    }

    // 设置dest为list的head
    dest = list[0];

    // 更新offSceneCounter计数
    this.offSceneCounter += deltaTime;

    // 判断是否需要更新NPC位置
    if (this.offSceneCounter < dest.cost) {
      return;
    }

    // 更新NPC位置
    while (this.offSceneCounter >= dest.cost) {
      this.offSceneCounter -= dest.cost;
      list.shift();
      if (list === this.patrol) {
        list.push(dest);
      } else if (this.routineIsEmpty()) {
        list === this.patrol;
      }
      if (!list.length) {
        return;
      }
      dest = list[0];
    }
    this.setPos(dest.pos);

    // NPC登场
    if (this.mapId === $gameMap.mapId()) {
      // temp
      //const event = Game_NPCEvent.loadNewEvent(this.name);
      const event = $gameNpcs.loadNewEvent(this.name);
      this.setEvent(event);
      event.loadToScene();
    }
  }

  // 场景内NPC位置更新
  onSceneMovementUpdate() {
    let list;
    let dest;

    // 设置队列list的值:
    if (this.routineIsEmpty()) {
      if (this.patrolIsEmpty()) return;
      list = this.patrol;
    } else {
      list = this.routine;
    }

    // 设置dest为list的head
    dest = list[0];

    // 如果已到达目标点
    if (this.x === dest.x && this.y === dest.y) {
      list.shift();
      if (list === this.patrol) {
        list.push(dest);
      } else if (this.routineIsEmpty()) {
        list === this.patrol;
      }
      if (!list.length) {
        this.event.setDirection(dest.d);
        this.setPos(dest.pos);
        return;
      }
      dest = list[0];
    }

    // NPC离场
    if (dest.mapId !== $gameMap.mapId()) {
      this.event.unloadFromScene();
      this.setPos(dest.pos);
      return;
    }

    // NPC移动
    const d = this.event.findDirectionTo(dest.x, dest.y);
    this.event.setDirection(d);
    this.event.moveForward();

    // 记录NPC位置
    if (this.event) {
      let e = this.event;
      this.setPos([e._mapId, e.x, e.y, e._direction]);
    }
  }

  // NPC行为模式更新
  patternUpdate() {
    const newPattern = this.patterns.find((each) =>
      each.conditions.every((condition) => each.evaluate(condition)),
    );
    const {
      behaviorName,
      dialogueName,
      actionName,
      routine,
      patrol,
    } = newPattern;
    if (this.behaviorName !== behaviorName) {
      // 计算到线路起始点的路径
      let dest;
      if (!!routine.length) {
        dest = routine[0];
      } else {
        dest = patrol[0];
      }
      const initRoutine = $gameMapGraph.findRoutine(this.pos, dest);
      this.routine = initRoutine.concat(routine);
      this.patrol = patrol.slice();
      this.behaviorName = behaviorName;
    }
    this.dialogueName = dialogueName;
    this.actionName = actionName;
    $gameMap.requestRefresh();
  }
}

// temp
class Game_NPCs {
  _data = {};

  //createNpc(name, event) {
  //  let npc = new Game_NPC(name);
  createNpc(eventData, event) {
    let npc = new Game_NPC(eventData);
    event && npc.setEvent(event);
    return npc;
  }

  getNpc(name, event) {
    let npc;
    if (this._data[name] !== undefined) {
      npc = this._data[name];
      event && npc.setEvent(event);
    }
    else {
      //npc = this.createNpc(name, event);
      let eventData = $gameEvents.find((eventData) => eventData.name == name);
      npc = this.createNpc(eventData, event);
      this._data[name] = npc;
    }
    return npc;
  }
  
  offSceneUpdateAll(deltaTime) {
    for (let name in this._data) {
      let npc = this._data[name];
      if (npc && npc.mapId !== $gameMap._mapId) {
        npc.offSceneUpdate(deltaTime);
      }
    }
  }

  // temp
  loadNewEvent(name, mapId, eventId) {
    const eventData = $gameEvents.find((eventData) => eventData.name == name);
    if (!eventData) return;
    const event = EventWanderer.createDynamicEvent(eventData, $gameMap._mapId, $gameMap._events.length);
    //const event = EventWanderer.createDynamicEvent(eventData);
    //const npc = this.getNpc(name, event);
    //event.loadToScene();
    return event;
  }
}
window.$gameNpcs = new Game_NPCs();
