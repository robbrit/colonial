var Resources = {
  images: {
    corn: {
      file: "resources/corn.png"
    },
    corn_field: {
      file: "buildings/corn-field.png"
    },
    hovel: {
      file: "buildings/hovel.png"
    },

    immigrant: {
      file: "sprites/immigrant.png"
    },

    jobFinder: {
      file: "sprites/jobfinder.png"
    },

    market: {
      file: "buildings/market.png"
    },

    plot: {
      file: "buildings/plot.png"
    },

    // TODO: The red hovers should be handled better
    redHover_1_1: {
      file: "util/red-hover-1-1.png"
    },
    redHover_2_2: {
      file: "util/red-hover-2-2.png"
    },
    redHover_3_3: {
      file: "util/red-hover-3-3.png"
    },
    
    redX: {
      file: "util/red-x.png"
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
    silo: {
      file: "buildings/silo.png"
    },

    waterCarrier: {
      file: "sprites/watercarrier.png"
    },

    water_hole: {
      file: "buildings/water-hole.png"
    },
    work_camp: {
      file: "buildings/work-camp.png"
    },
    worker: {
      file: "sprites/worker.png"
    },
    worker_farming: {
      file: "sprites/worker-farming.png"
    }
  },

  imagesLoading: [],

  trackProgress: function(){
    var done = true;
    for (var i = 0; i < Resources.imagesLoading.length; i++){
      if (!Resources.imagesLoading[i].complete){
        done = false;
        break;
      }
    }

    if (done){
      clearInterval(Resources.loadingTimer);
      Game.doneLoading();
    }
  },

  beginLoading: function(){
    for (var i in TileTypes){
      Resources.imagesLoading.push(TileTypes[i].image);
      TileTypes[i].image.src = "images/tiles/" + TileTypes[i].file;
    }
    for (var i in Resources.images){
      Resources.images[i].image = new Image();
      Resources.imagesLoading.push(Resources.images[i].image);
      Resources.images[i].image.src = "images/" + Resources.images[i].file;
    }

    Resources.loadingTimer = setInterval(Resources.trackProgress, 500);
  },
  
  loadingTimer: false
};

Resources.sprites = {
  immigrant: Resources.images.immigrant,
  jobFinder: Resources.images.jobFinder,
  waterCarrier: Resources.images.waterCarrier,
  worker: Resources.images.worker,
  worker_farming: Resources.images.worker_farming
};
