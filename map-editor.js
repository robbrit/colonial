var tiler = Diamond;
var tiles = new Array();

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
    var coords = tiler.toWorldCoords(x, y);
    tiles[coords[1]][coords[0]].setImage(what);
    tiler.renderTile(coords[0], coords[1]);
  },
  
  selectTile: function(which){
    MapEditor.selected = MapEditor.images[which];
    $("#selected-tile").attr("src", "images/tiles/" + MapEditor.selected.file);
  },

  render: function (){
    tiler.isometric(tiles);
  },

  save: function(){
    $("#output").html(JSON.stringify(tiles));
  }
};
MapEditor.selected = MapEditor.images.water;

$(function(){
  for (var i in MapEditor.images){
    MapEditor.images[i].image.src = "images/tiles/" + MapEditor.images[i].file;
  }

  for (var i = 0; i < 20; i++){
    tiles.push(new Array());
    for (var j = 0; j < 20; j++){
      var image = (i == j ? MapEditor.images.water : MapEditor.images.grass);
      tiles[i].push(new Tile(j, i, image.image, image.type));
    }
  }
  MapEditor.render();
});

$("#main-canvas")
  .mousedown(function(ev){
    MapEditor.mouseDown = true;
  })
  .mouseup(function(ev){
    var pos = $(this).position();
    MapEditor.changeTile(ev.clientX - pos.left, ev.clientY - pos.top, MapEditor.selected);
    MapEditor.mouseDown = false;
  })
  .mousemove(function(ev){
    if (MapEditor.mouseDown){
      var pos = $(this).position();
      MapEditor.changeTile(ev.clientX - pos.left, ev.clientY - pos.top, MapEditor.selected);
    }
  })
  .mouseout(function(ev){
    MapEditor.mouseDown = false;
  });
