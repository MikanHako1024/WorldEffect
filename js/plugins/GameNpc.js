class NPCPattern {
  conditions = [];
  behaviorName = '';
  dialogueName = '';
  actionName = '';
  evaluate() {}
}

class MapGraph {
  nodes = [];
  findRoutine(pos, dest) {}
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
  constructor(mapId, x, y, d) {
    this.pos = [mapId, x, y, d];
  }
}

class Game_NPCEvent extends Game_Event {
  static loadNewEvent(name) {}
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

  constructor(name) {
    this.name = name;
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
    this.pos = dest.pos;

    // NPC登场
    if (this.mapId === $gameMap.mapId()) {
      const event = Game_NPCEvent.loadNewEvent(this.name);
      this.eventId = event._eventId;
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
        this.pos = dest.pos;
        return;
      }
      dest = list[0];
    }

    // NPC离场
    if (dest.mapId !== $gameMap.mapId()) {
      this.event.unloadFromScene();
      this.pos = dest;
      return;
    }

    // NPC移动
    const d = this.event.findDirectionTo(dest.x, dest.y);
    this.event.setDirection(d);
    this.event.moveForward();

    // 记录NPC位置
    if (this.event) {
      let e = this.event;
      this.pos = [e._mapId, e.x, e.y, e._direction];
    }
  }

  // NPC行为模式更新
  patternUpdate() {
    const newPattern = this.patterns.find((each) =>
      each.conditions.every((condition) => condition.evaluate()),
    );
    const {
      behaviorName,
      dialogueName,
      actionName,
      routine,
      patrol,
    } = newPattern;
    if (this.behaviorName === behaviorName) {
      // 计算到线路起始点的路径
      let dest;
      if (!this.routineIsEmpty()) {
        dest = routine[0];
      } else {
        dest = patrol[0];
      }
      const initRoutine = $gameMapGraph.findRoutine(this.pos, dest);
      this.routine = initRoutine.concat(routine);
      this.patrol = patrol.slice();
    }
    this.dialogueName = dialogueName;
    this.actionName = actionName;
    $gameMap.requestRefresh();
  }
}
