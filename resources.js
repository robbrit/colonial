var Resources = {
  images: {
    hovel: {
      file: "buildings/hovel.png"
    },

    immigrant: {
      file: "sprites/immigrant.png"
    },

    jobFinder: {
      file: "sprites/jobfinder.png"
    },

    plot: {
      file: "buildings/plot.png"
    },

    redHover_1_1: {
      file: "util/red-hover-1-1.png"
    },

    redHover_2_2: {
      file: "util/red-hover-2-2.png"
    },

    road: {
      file: "buildings/road.png"
    },
    road_tr: {
      file: "buildings/road-tr.png"
    },
    road_tl: {
      file: "buildings/road-tl.png"
    },
    road_bl: {
      file: "buildings/road-bl.png"
    },
    road_br: {
      file: "buildings/road-br.png"
    },

    shack: {
      file: "buildings/shack.png"
    },

    waterCarrier: {
      file: "sprites/watercarrier.png"
    },

    water_hole: {
      file: "buildings/water-hole.png"
    }
  }
};

Resources.sprites = {
  immigrant: Resources.images.immigrant,
  jobFinder: Resources.images.jobFinder,
  waterCarrier: Resources.images.waterCarrier
};

$(function(){
  for (var i in TileTypes){
    TileTypes[i].image.src = "images/tiles/" + TileTypes[i].file;
  }
  for (var i in Resources.images){
    Resources.images[i].image = new Image();
    Resources.images[i].image.src = "images/" + Resources.images[i].file;
  }
});
