var Game = {
  images: {
    water: {
      file: "water.png",
      image: new Image(),
      type: "water",
      loaded: false
    },
    grass: {
      file: "grass.png",
      image: new Image(),
      type: "grass",
      loaded: false
    },
    desert: {
      file: "desert.png",
      image: new Image(),
      type: "desert",
      loaded: false
    },
    dune: {
      file: "dune.png",
      image: new Image(),
      type: "dune",
      loaded: false
    },
    ore: {
      file: "ore.png",
      image: new Image(),
      type: "ore",
      loaded: false
    },
    rock: {
      file: "rock.png",
      image: new Image(),
      type: "rock",
      loaded: false
    },
    tree: {
      file: "tree.png",
      image: new Image(),
      type: "tree",
      loaded: false
    },
    swamp: {
      file: "swamp.png",
      image: new Image(),
      type: "swamp",
      loaded: false
    }
  },

  loadTiles: function(url){
    $.getJSON(url, function(response){
      var tiles = response.tiles;
      Game.tiles = new Array(response.height);
      for (var y = 0; y < response.height; y++){
        Game.tiles[y] = new Array(response.width);
        for (var x = 0; x < response.width; x++){
          Game.tiles[y][x] = new Tile(x, y, Game.images[tiles[y][x].type].image, tiles[y][x].type);
        }
      }
      Game.tiler = new Diamond(Game.tiles, "#main-canvas");
      Game.tiler.render();
    });
  },

  onClick: function(ev){
  },

  mouseMove: function(ev){
    var pos = $("#main-canvas").position();
    Game.tiler.setHover(ev.clientX - pos.left + $(window).scrollLeft(),
      ev.clientY - pos.top + $(window).scrollTop());
    Game.tiler.render();
  },

  mouseOut: function(ev){
    Game.tiler.setHover();
  },

  tiles: false,
  tiler: false
};

$(function(){
  for (var i in Game.images){
    Game.images[i].image.src = "images/tiles/" + Game.images[i].file;
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
