var Game = {
  loadTiles: function(url){
    $.getJSON(url, function(response){
      var tiles = response.tiles;
      Game.tiles = new Array(response.height);
      for (var y = 0; y < response.height; y++){
        Game.tiles[y] = new Array(response.width);
        for (var x = 0; x < response.width; x++){
          Game.tiles[y][x] = new Tile([x, y], Game.tileTypes[tiles[y][x].type]);
        }
      }
      Game.tiler = new Diamond(Game.tiles, "#main-canvas");
      Game.tiler.render();
      $(".toolbar").height($("#main-canvas").height());
    });
  },

  build: function(what){
    Game.building = Buildings[what];
  },

  onClick: function(ev){
    var coords = Game.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));

    // TODO: some buildings are big
    var tile = Game.tiles[coords[1]][coords[0]];
    if (tile && tile.type.buildable){
      Game.tiles[coords[1]][coords[0]].building = Game.building;
    }
  },

  mouseMove: function(ev){
    var pos = $("#main-canvas").position();
    Game.tiler.setHover(Game.canvasCoords([ev.clientX, ev.clientY]));
  },

  mouseOut: function(ev){
    Game.tiler.setHover();
  },

  canvasCoords: function(xy){
    var pos = $("#main-canvas").position();
    return [
      xy[0] - pos.left + $(window).scrollLeft(),
      xy[1] - pos.top  + $(window).scrollTop()
    ];
  },

  tiles: false,
  tiler: false,
  building: false
};

$(function(){
  for (var i in Game.tileTypes){
    Game.tileTypes[i].image.src = "images/tiles/" + Game.tileTypes[i].file;
  }
  for (var i in Buildings){
    Buildings[i].image.src = "images/buildings/" + Buildings[i].file;
  }

  Game.loadTiles("maps/bigmap.js");
});

$("#main-canvas")
  .click(Game.onClick)
  .mousemove(Game.mouseMove)
  .mouseout(Game.mouseOut);

$(document)
  .keypress(function(ev){
    if (ev.keyCode == 38){ // up
      Game.tiler.scroll(0, -Common.scrollSpeed);
    }else if (ev.keyCode == 39){ // right
      Game.tiler.scroll(Common.scrollSpeed, 0);
    }else if (ev.keyCode == 40){ // down
      Game.tiler.scroll(0, Common.scrollSpeed);
    }else if (ev.keyCode == 37){ // left
      Game.tiler.scroll(-Common.scrollSpeed, 0);
    }
  });
