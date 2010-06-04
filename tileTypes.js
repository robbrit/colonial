var TileTypes = {
  water: {
    file: "water.png",
    image: new Image(),
    type: "water",
    loaded: false,
    buildable: false,
    passable: false
  },
  grass: {
    file: "grass.png",
    image: new Image(),
    type: "grass",
    loaded: false,
    buildable: true,
    passable: true
  },
  desert: {
    file: "desert.png",
    image: new Image(),
    type: "desert",
    loaded: false,
    buildable: true,
    passable: true
  },
  dune: {
    file: "dune.png",
    image: new Image(),
    type: "dune",
    loaded: false,
    buildable: false,
    passable: false
  },
  ore: {
    file: "ore.png",
    image: new Image(),
    type: "ore",
    loaded: false,
    buildable: false,
    passable: false
  },
  rock: {
    file: "rock.png",
    image: new Image(),
    type: "rock",
    loaded: false,
    buildable: false,
    passable: false
  },
  tree: {
    file: "tree.png",
    image: new Image(),
    type: "tree",
    loaded: false,
    buildable: false,
    passable: false
  },
  swamp: {
    file: "swamp.png",
    image: new Image(),
    type: "swamp",
    loaded: false,
    buildable: false,
    passable: true
  }
};

var base = ["grass", "water", "desert"];
var desert_derived = ["dune", "ore", "rock"];
var grass_derived = ["tree", "swamp"];

for (var i = 0; i < base.length; i++){
  var type = TileTypes[base[i]];

  type.image_tr = new Image();
  type.image_tr.src = "images/tiles/" + type.type + "-tr.png";
  type.image_tl = new Image();
  type.image_tl.src = "images/tiles/" + type.type + "-tl.png";
  type.image_bl = new Image();
  type.image_bl.src = "images/tiles/" + type.type + "-bl.png";
  type.image_br = new Image();
  type.image_br.src = "images/tiles/" + type.type + "-br.png";
}
for (var i = 0; i < desert_derived.length; i++){
  var type = TileTypes[desert_derived[i]];

  type.image_tr = TileTypes.desert.image_tr;
  type.image_tl = TileTypes.desert.image_tl;
  type.image_bl = TileTypes.desert.image_bl;
  type.image_br = TileTypes.desert.image_br;
}
for (var i = 0; i < grass_derived.length; i++){
  var type = TileTypes[grass_derived[i]];

  type.image_tr = TileTypes.grass.image_tr;
  type.image_tl = TileTypes.grass.image_tl;
  type.image_bl = TileTypes.grass.image_bl;
  type.image_br = TileTypes.grass.image_br;
}
