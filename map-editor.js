var MapEditor = {
  mouseDown: false,

  images: {
    water: {
      file: "water.png",
      image: new Image(),
      type: "water"
    },
    grass: {
      file: "grass.png",
      image: new Image(),
      type: "grass"
    },
    desert: {
      file: "desert.png",
      image: new Image(),
      type: "desert"
    },
    dune: {
      file: "dune.png",
      image: new Image(),
      type: "dune"
    },
    ore: {
      file: "ore.png",
      image: new Image(),
      type: "ore"
    },
    rock: {
      file: "rock.png",
      image: new Image(),
      type: "rock"
    },
    tree: {
      file: "tree.png",
      image: new Image(),
      type: "tree"
    },
    swamp: {
      file: "swamp.png",
      image: new Image(),
      type: "swamp"
    }
  },


  changeTile: function(x, y, what){
    var coords = MapEditor.tiler.toWorldCoords(x, y);

    if (coords[0] >= 0 && coords[1] >= 0 && coords[1] < MapEditor.tiles.length && coords[0] < MapEditor.tiles[coords[1]].length){
      MapEditor.tiles[coords[1]][coords[0]].setImage(what);
      MapEditor.tiler.renderTile(coords[0], coords[1]);
    }
  },
  
  selectTile: function(which){
    MapEditor.selected = MapEditor.images[which];
    $("#selected-tile").attr("src", "images/tiles/" + MapEditor.selected.file);
  },

  render: function (){
    MapEditor.tiler.render();
  },

  save: function(){
    $("#output").html(JSON.stringify({
      width: $("#map-width").val(),
      height: $("#map-height").val(),
      tiles: tiles
    }));
  },

  createTiles: function(){
    var width = parseInt($("#map-width").val());
    var height = parseInt($("#map-height").val());

    MapEditor.tiles = new Array(height);
    for (var i = 0; i < height; i++){
      MapEditor.tiles[i] = new Array(width);
      for (var j = 0; j < width; j++){
        var image = (i == j ? MapEditor.images.water : MapEditor.images.grass);
        MapEditor.tiles[i][j] = new Tile(j, i, image.image, image.type);
      }
    }

    MapEditor.tiler = new Diamond(MapEditor.tiles, "#main-canvas");
    MapEditor.tiler.maxHeight = 400;

    MapEditor.tiler.setCanvasSize(
      (width + height + 1) * Math.floor(MapEditor.selected.image.height / 2),
      (width + height) * Math.floor(MapEditor.selected.image.width / 2)
    );

    MapEditor.render();
  },

  tiler: false,
  tiles: false,

  scrollSpeed: 10
};
MapEditor.selected = MapEditor.images.water;

$(function(){
  for (var i in MapEditor.images){
    MapEditor.images[i].image.src = "images/tiles/" + MapEditor.images[i].file;
  }
  MapEditor.createTiles();
});

$("#main-canvas")
  .mousedown(function(ev){
    MapEditor.mouseDown = true;
  })
  .mouseup(function(ev){
    var pos = $(this).position();
    MapEditor.changeTile(ev.clientX - pos.left + $(window).scrollLeft(),
      ev.clientY - pos.top + $(window).scrollTop(), MapEditor.selected);
    MapEditor.mouseDown = false;
  })
  .mousemove(function(ev){
    if (MapEditor.mouseDown){
      var pos = $(this).position();
      MapEditor.changeTile(ev.clientX - pos.left + $(window).scrollLeft(),
        ev.clientY - pos.top + $(window).scrollTop(), MapEditor.selected);
    }
  })
  .mouseout(function(ev){
    MapEditor.mouseDown = false;
  });

$(document)
  .keypress(function(ev){
    console.log(ev.keyCode);
    if (ev.keyCode == 38){ // up
      MapEditor.tiler.scroll(0, -MapEditor.scrollSpeed);
    }else if (ev.keyCode == 39){ // right
      MapEditor.tiler.scroll(MapEditor.scrollSpeed, 0);
    }else if (ev.keyCode == 40){ // down
      MapEditor.tiler.scroll(0, MapEditor.scrollSpeed);
    }else if (ev.keyCode == 37){ // left
      MapEditor.tiler.scroll(-MapEditor.scrollSpeed, 0);
    }
  });
