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

  getTile: function(xy){
    return Game.tiles[xy[1]][xy[0]];
  },

  addPerson: function(person){
    Game.people.push(person);
  },

  removePerson: function(person){
    Game.peopleToRemove.push(person);
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
  var context = $("#main-canvas").get(0).getContext("2d");
  context.fillStyle = "rgb(255, 255, 255)";
  context.strokeStyle = "rgb(0, 0, 0)";
  context.fillText("Loading...", 10, 10);

  // TODO: some form of image pre-loading system instead of this silly thing
  setTimeout(function(){
    Game.loadTiles("maps/bigmap.js");

    // fire up the game engine
    Game.intervalID = setInterval(Game.update, 33);
  }, 2000);
});
