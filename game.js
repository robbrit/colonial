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
    if (Game.state == "playing"){
      // delete old messages
      var tooOld = Common.time() - 5000;
      
      Game.messages = $.grep(Game.messages, function(obj) { return obj.timestamp > tooOld; });

      $.each(Game.objects, function(i, obj) { obj.update(); });
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

  getSprites: function(){
    return Game.objects;
  },

  getMessages: function(){
    return $.map(Game.messages, function(obj) { return obj.message; });
  },

  getBuildings: function(){
    return Game.buildings;
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

  inBounds: function(xy){
    return this.display.tiler.inBounds(xy);
  },

  tiles: false,
  building: false,
  state: "initializing"
};

Game.objects = new Array();
Game.buildings = new Array();
Game.messages = new Array();

$(function(){
  Game.loadTiles("maps/bigmap.js");

  // fire up the game engine
  Game.intervalID = setInterval(Game.update, 33);
});
