var Resources = {
  images: {
    hovel: {
      file: "buildings/hovel.png",
      image: new Image()
    },

    immigrant: {
      file: "sprites/immigrant.png",
      image: new Image()
    },

    plot: {
      file: "buildings/plot.png",
      image: new Image()
    },

    redHover: {
      file: "util/red-hover.png",
      image: new Image()
    },

    road: {
      file: "buildings/road.png",
      image: new Image()
    }
  }
};

Resources.sprites = {
  immigrant: Resources.images.immigrant
};

$(function(){
  for (var i in TileTypes){
    TileTypes[i].image.src = "images/tiles/" + TileTypes[i].file;
  }
  for (var i in Resources.images){
    Resources.images[i].image.src = "images/" + Resources.images[i].file;
  }
});
