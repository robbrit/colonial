var TileTypes = {
  water: {
    file: "water.png",
    image: new Image(),
    type: "water",
    loaded: false,
    buildable: false,
    passable: function(who) { return who.boat === true; }
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

