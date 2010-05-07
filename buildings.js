var Buildings = {
  basic: function(xy){
    this.location = xy;
    this.width = 1;
    this.height = 1;
    this.jobs = 0;
    this.workers = 0;
    this.isHouse = false;
    this.jobFinder = false;
  },

  plot: function(xy){
    Buildings.basic.call(this, xy);
    this.image = Resources.images.plot;
    this.type = "plot";
    this.capacity = 1;
    this.people = 0;
    this.isHouse = true;
  },

  water_hole: function(xy){
    Buildings.basic.call(this, xy);
    this.image = Resources.images.water_hole;
    this.type = "water_hole";
    this.width = this.height = 2;

    this.jobs = 2;
  }
};
Buildings.plot.prototype = new Buildings.basic();
Buildings.water_hole.prototype = new Buildings.basic();

Buildings.basic.prototype.update = function() {
  if (this.needsWorkers() && this.jobFinder === false){
    var road = this.findRoad(1);

    if (road){
      this.jobFinder = new JobFinder(road.xy, this);
      GameLogic.addPerson(this.jobFinder);
    }
  }
};
Buildings.basic.prototype.needsWorkers = function() { return this.workers < this.jobs; }

Buildings.basic.prototype.placed = function(coords){
  this.location = coords;
  
  if (!this.findRoad(1)){
    Game.addMessage(t("must_be_near_road"));
  }

  // cover up nearby tiles
  if (this.width > 1 || this.height > 1){
    for (var y = 0; y < this.height; y++){
      for (var x = 0; x < this.width; x++){
        if (y != 0 || x != 0){
          Game.tiles[y][x].building = true;
        }
      }
    }
  }
};

Buildings.basic.prototype.findRoad = function(radius, width, height){
  if (radius === undefined){
    radius = 2;
  }
  if (width === undefined){
    width = this.width;
  }
  if (height === undefined){
    height = this.height;
  }
  for (var y = Math.max(0, this.location[1] - radius); y <= Math.min(Game.tiles.length - 1, this.location[1] + height - 1 + radius); y++){
    for (var x = Math.max(0, this.location[0] - radius); x <= Math.min(Game.tiles[y].length - 1, this.location[0] + width - 1 + radius); x++){
      if (Game.tiles[y][x].road){
        return Game.tiles[y][x];
      }
    }
  }
  return false;
};

Buildings.plot.prototype.placed = function(coords){
  this.location = coords;

  // check for a road nearby
  if (!this.findRoad()){
    Game.addMessage(t("plot_too_far"));
  }
}

Buildings.plot.prototype.arrived = function(person){
  person.state = "hidden";

  this.image = Resources.images.hovel;
  Game.display.tiler.renderBuildings();
};

Buildings.plot.prototype.addPerson = function(person){
  this.people++;
};

Buildings.plot.prototype.getCapacity = function(person){
  if (this.capacity == this.people || !this.findRoad()){
    return 0;
  }else{
    return this.capacity - this.people;
  }
};

Buildings.water_hole.placed = function(coords){
  Buildings.basic.placed.call(this, coords);
};
