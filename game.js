var Game = {
  loadTiles: function(url){
    $.getJSON(url, function(response){
      var tiles = response.tiles;
      Game.tiles = new Array(response.height);
      for (var y = 0; y < response.height; y++){
        Game.tiles[y] = new Array(response.width);
        for (var x = 0; x < response.width; x++){
          Game.tiles[y][x] = new Tile([x, y], TileTypes[tiles[y][x].type]);
        }
      }
      Game.display = new Display(Game.tiles);
      Game.display.render();
      Game.state = "playing";
    });
  },

  canvasCoords: function(xy){
    var pos = $("#main-canvas").position();
    return [
      xy[0] - pos.left + $(window).scrollLeft(),
      xy[1] - pos.top  + $(window).scrollTop()
    ];
  },

  update: function(){
    Game.Controls.update();
    if (Game.state == "playing"){
      // delete old messages
      var tooOld = Common.time() - 5000;
      Game.messages = $.grep(Game.messages, function(obj) { return obj.timestamp > tooOld; });

      // remove deleted people
      var index;
      $.each(Game.peopleToRemove, function(i, obj){
        index = Game.people.indexOf(obj);
        Game.people.remove(index);
      });
      delete Game.peopleToRemove;
      Game.peopleToRemove = new Array();

      if (Game.buildingsToRemove.length > 0){
        $.each(Game.buildingsToRemove, function(i, obj){
          index = Game.buildings.indexOf(obj);
          Game.buildings.remove(index);
        });
        delete Game.buildingsToRemove;
        Game.buildingsToRemove = new Array();
        Game.display.tiler.renderBuildings();
      }

      $.each(Game.people, function(i, obj) { obj.update(); });
      $.each(Game.buildings, function(i, obj) { obj.update(); });
      GameLogic.update();
      Game.display.render();
    }
  },

  findTile: function(callback){
    for (var y = 0; y < Game.tiles.length; y++){
      for (var x = 0; x < Game.tiles[y].length; x++){
        if (callback(Game.tiles[y][x])){
          return Game.tiles[y][x];
        }
      }
    }
    return false;
  },

  getPeople: function(){
    return Game.people;
  },

  getMessages: function(){
    return $.map(Game.messages, function(obj) { return obj.message; });
  },

  getBuildings: function(){
    return Game.buildings;
  },

  removeBuilding: function(building){
    Game.buildingsToRemove.push(building);
  },

  getTile: function(xy, y){
    if (y !== undefined){
      xy = [xy, y];
    }
    if (Game.tiles[xy[1]]){
      return Game.tiles[xy[1]][xy[0]];
    }else{
      return undefined;
    }
  },

  addPerson: function(person){
    Game.people.push(person);
  },

  removePerson: function(person){
    Game.peopleToRemove.push(person);
  },

  roadFeasible: function(start, end){
    return Game.roadSegment(start, end, function(tile){
      if (tile.building || !tile.type.buildable){
        return false;
      }
    });
  },

  roadSegment: function(start, end, func){
    var yinc = start[1] > end[1] ? -1 : 1;

    var tile;
    var ret;
    for (var i = start[1]; i != end[1]; i += yinc){
      tile = Game.getTile(start[0], i);
      if ((ret = func(tile)) !== undefined){
        return ret;
      }
    }

    if (start[0] == end[0]){
      ret = func(Game.getTile(end));

      if (ret !== undefined){
        return ret;
      }
    }else if (start[0] < end[0]){
      for (var i = start[0]; i <= end[0]; i++){
        tile = Game.getTile(i, end[1]);
        if ((ret = func(tile)) !== undefined){
          return ret;
        }
      }
    }else{
      for (var i = start[0]; i >= end[0]; i--){
        tile = Game.getTile(i, end[1]);
        if ((ret = func(tile)) !== undefined){
          return ret;
        }
      }
    }

    return true;
  },

  houseBlock: function(start, end, func){
    var startx = Math.min(start[0], end[0]);
    var starty = Math.min(start[1], end[1]);
    var endx = Math.max(start[0], end[0]);
    var endy = Math.max(start[1], end[1]);

    for (var y = starty; y <= endy; y++){
      for (var x = startx; x <= endx; x++){
        var tile = Game.getTile(x, y);
        if (tile){
          func(tile);
        }
      }
    }
  },

  placeBuilding: function(coords){
    Game.building.placed(coords);
    Game.buildings.push(Game.building);
    Game.building = new Buildings[Game.buildingType]();
  },

  addMessage: function(msg){
    // message queue can only be 10 messages long
    if (Game.messages.length == 10){
      Game.messages.shift();
    }
    Game.messages.push({
      message: msg,
      timestamp: Common.time()
    });
  },

  inBounds: function(x, y){
    if (y !== undefined){
      x = [x, y];
    }
    return this.display.tiler.inBounds(x);
  },

  pause: function(){
    Game.state = "paused";
  },

  resume: function(){
    Game.state = "playing";
  },

  paused: function(){
    return Game.state == "paused";
  },

  playing: function(){
    return Game.state == "playing";
  },

  doneLoading: function(){
    Game.loadTiles("maps/bigmap.js");

    // fire up the game engine
    Game.intervalID = setInterval(Game.update, 33);
  },

  tiles: false,
  building: false,
  state: "initializing"
};

Game.people = new Array();
Game.peopleToRemove = new Array();
Game.buildings = new Array();
Game.buildingsToRemove = new Array();
Game.messages = new Array();

$(function(){
  // show loading
  $("#main-canvas")
    .attr("width", 800)
    .attr("height", 600);

  var context = $("#main-canvas").get(0).getContext("2d");
  context.fillStyle = "rgb(255, 255, 255)";
  context.strokeStyle = "rgb(0, 0, 0)";
  context.fillText("Loading...", 10, 10);

  Resources.beginLoading();
});
