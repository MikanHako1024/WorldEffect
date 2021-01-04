

/*
Game_Event.prototype.unloadFromScene = function() {
  var characterSprites = SceneManager._scene._spriteset._characterSprites;
  var sId = characterSprites.findIndex((s) => s._character === this);
  if (sId >= 0) {
    var s = characterSprites[sId];
    characterSprites[sId] = null;
    SceneManager._scene._spriteset._tilemap.removeChild(s);
  }
  $gameMap._events[this._eventId] = null;
};
*/


function test_NpcBehaviorDemo1() {
  var npc = new Game_NPC('demo1');
  window.$gameNpcs['demo1'] = npc;
  var e = $gameMap.event(8);
  npc.pos = [e._mapId, e.x, e.y, e._direction]; // [4,2,9,2]
  npc.event = e;

  //npc.patrol = [new PathNode(4,2,9,2), new PathNode(4,3,9,6), new PathNode(4,4,9,6)];
  npc.patrol = [new PathNode(4,2,9,2), new PathNode(4,9,9,6), new PathNode(4,9,14,6)];

  //npc.onSceneMovementUpdate();
  //npc.onSceneMovementUpdate();
  //npc.onSceneMovementUpdate();
}

function test_NpcBehaviorDemo2() {
  var npc = new Game_NPC('demo2');
  window.$gameNpcs['demo2'] = npc;
  var e = $gameMap.event(9);
  npc.pos = [e._mapId, e.x, e.y, e._direction];
  npc.event = e;

  npc.routine = [new PathNode(4,12,19,8), new PathNode(4,5,15,8), 
                new PathNode(6,9,14,8), new PathNode(6,14,6,8)];
}

function test_NpcBehaviorDemo3() {
  var npc = new Game_NPC('demo3');
  window.$gameNpcs['demo3'] = npc;
  var e = $gameMap.event(8);
  npc.pos = [e._mapId, e.x, e.y, e._direction];
  npc.event = e;

  npc.patrol = [new PathNode(8,2,9,2), new PathNode(8,9,9,6), new PathNode(8,9,14,6)];
}


//EventWanderer.createDynamicEventData('demo3', 8, 2, {a:1, pos:[2,9]});
//EventWanderer.createDynamicEventData('demo3', 8, 3, {a:1, pos:[2,9]});


function test_NpcBehaviorDemo4() {
  let pattern1 = new NPCPattern(
    [() => $gameVariables.value(1) == 6], 
    'b3-1', 'd3-1', 'a3-1',
    [new PathNode(8,2,9,2), new PathNode(8,17,14,2), new PathNode(0,0,0,0)], 
    []);
  let pattern2 = new NPCPattern(
    [() => $gameVariables.value(1) == 18], 
    'b3-2', 'd3-2', 'a3-2',
    [new PathNode(8,17,14,2), new PathNode(8,9,14,2)], 
    [new PathNode(8,10,3,2), new PathNode(8,15,3,2)]);
  //let npc = Game_NPC.getNPC('demo3', $gameMap._events[$gameMap._events.length-1]);
  let npc = $gameNpcs.getNpc('demo3', $gameMap._events[$gameMap._events.length-1]);
  //let  = $gameNpcs.loadNewEvent('demo3', )
  //let name = 'demo3';
  //let eventData = $gameEvents.find((eventData) => eventData.name == name);
  //let npc = $gameNpcs.getNpc(eventData, $gameMap._events[$gameMap._events.length-1]);
  npc.patterns = [pattern1, pattern2];
  //npc.behaviorName = 'b3-1';
  npc.behaviorName = '';
}

