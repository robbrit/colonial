var MapEditor = {
  mouseDown: false,

  changeTile: function(x, y, what){
    var coords = MapEditor.tiler.toWorldCoords([x, y]);

    if (coords[0] >= 0 && coords[1] >= 0 && coords[1] < MapEditor.tiles.length && coords[0] < MapEditor.tiles[coords[1]].length){
      MapEditor.tiles[coords[1]][coords[0]].setImage(what);
      MapEditor.tiler.renderTile(coords);
    }
  },
  
  selectTile: function(which){
    MapEditor.selected = TileTypes[which];
    $("#selected-tile").attr("src", "images/tiles/" + MapEditor.selected.file);
  },

  render: function (){
    MapEditor.tiler.render();
  },

  save: function(){
    // TODO: don't need to save types
    $("#output").html(JSON.stringify({
      width: $("#map-width").val(),
      height: $("#map-height").val(),
      tiles: MapEditor.tiles
    }));
  },

  createTiles: function(){
    var width = parseInt($("#map-width").val());
    var height = parseInt($("#map-height").val());

    MapEditor.tiles = new Array(height);
    for (var i = 0; i < height; i++){
      MapEditor.tiles[i] = new Array(width);
      for (var j = 0; j < width; j++){
        var image = (i == j ? TileTypes.water : TileTypes.grass);
        MapEditor.tiles[i][j] = new Tile([j, i], image);
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
  tiles: false
};
$(function(){
  for (var i in TileTypes){
    TileTypes[i].image.src = "images/tiles/" + TileTypes[i].file;
  }
  MapEditor.selected = TileTypes.water;

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
    if (ev.keyCode == 38){ // up
      MapEditor.tiler.scroll(0, -Common.scrollSpeed);
    }else if (ev.keyCode == 39){ // right
      MapEditor.tiler.scroll(Common.scrollSpeed, 0);
    }else if (ev.keyCode == 40){ // down
      MapEditor.tiler.scroll(0, Common.scrollSpeed);
    }else if (ev.keyCode == 37){ // left
      MapEditor.tiler.scroll(-Common.scrollSpeed, 0);
    }
  });
