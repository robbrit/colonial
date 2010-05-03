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
      Game.tiler = new Diamond(Game.tiles, "#main-canvas");
      Game.tiler.render();
      $(".toolbar").height($("#main-canvas").height());
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
    GameLogic.update();
    Game.tiler.render();
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
    return $.map(Game.objects, function(obj, i) { return obj.sprite.image; });
  },

  tiles: false,
  tiler: false,
  building: false
};

Game.objects = new Array();

$(function(){
  Game.loadTiles("maps/bigmap.js");

  // fire up the game engine
  Game.intervalID = setInterval(Game.update, 33);
});
