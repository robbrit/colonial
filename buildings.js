var Buildings = {
  basic: function(xy, type){
    if (type !== undefined){
      this.location = xy;
      this.image = Resources.images[type];
      this.type = type;

      // set a bunch of defaults
      this.width = 1;
      this.height = 1;
      this.jobs = 0;
      this.workers = 0;
      this.isHouse = false;
      this.needsRoad = true;
      this.jobFinder = false;

      this.usesLabourCamp = false;
    }
  },

  corn_field: function(xy){
    Buildings.basic.call(this, xy, "corn_field");

    this.width = this.height = 3;

    this.production = 0;
    this.totalProduction = 10000;
    this.jobs = 1;
    this.workersHere = [];
    this.usesLabourCamp = true;
  },


  plot: function(xy){
    Buildings.basic.call(this, xy, "plot");

    this.capacity = 1;
    this.people = 0;
    this.peopleComing = 0;
    this.isHouse = true;

    this.level = 0;
    this.needs = {};
  },

  silo: function(xy){
    Buildings.basic.call(this, xy, "silo");

    this.width = this.height = 2;

    this.jobs = 10;
  },

  water_hole: function(xy){
    Buildings.basic.call(this, xy, "water_hole");
    this.width = this.height = 2;

    this.carrier = false;
    this.jobs = 2;
  },

  work_camp: function(xy){
    Buildings.basic.call(this, xy, "work_camp");
    this.width = this.height = 2;

    this.jobs = 10;
    this.workerObjs = new Array();
  }
};
Buildings.plot.prototype = new Buildings.basic();
Buildings.water_hole.prototype = new Buildings.basic();
Buildings.corn_field.prototype = new Buildings.basic();
Buildings.work_camp.prototype = new Buildings.basic();

Buildings.basic.prototype.update = function() {
  // certain buildings use a job finder to find labourers,
  // so send one out if we need workers
  if (this.usesLabourCamp === false && this.needsWorkers() && this.jobFinder === false){
    var road = this.findRoad(1);

    if (road){
      this.jobFinder = new JobFinder(road.xy, this);
      GameLogic.addPerson(this.jobFinder);
    }
  }
};

Buildings.basic.prototype.getText = function(which){
  if (which == "header"){
    return t(this.type);
  }else{
    return t(this.type + "_body");
  }
};

Buildings.basic.prototype.needsWorkers = function() { return this.workers < this.jobs; }

Buildings.basic.prototype.placed = function(coords){
  this.location = coords;
  
  // certain buildings need to be near a road, so output a message if that is the case
  // here
  if (this.needsRoad && !this.findRoad(1)){
    Game.addMessage(t("must_be_near_road"));
  }

  // cover up nearby tiles
  for (var i = 0; i < this.height; i++){
    for (var j = 0; j < this.width; j++){
      Game.tiles[this.location[1] + i][this.location[0] + j].building = this;
    }
  }
};

Buildings.basic.prototype.remove = function(){
  // clear off all my tiles
  for (var i = 0; i < this.width; i++){
    for (var j = 0; j < this.height; j++){
      Game.tiles[this.location[1] + j][this.location[0] + i].building = false;
    }
  }

  GameLogic.removeJob(this.workers);

  // TODO: work camp places need to fire workers
  // TODO: Housing plots need to remove population
};

Buildings.basic.prototype.addWorker = function(){
  this.workers++;
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

/****************
 * Plot Methods *
 ****************/
Buildings.plot.capacities = [
  1, 1, 2
];
Buildings.plot.prototype.update = function(){
  if (this.people === 0){
    this.level = 0;
  }else{
    if (this.needs["water"] === true){
      if (this.level < 2){
        // promote us to level 2
        this.level = 2;
      }
    }else{
      // demote us to level 1
      this.level = 1;
    }
  }
  this.capacity = Buildings.plot.capacities[this.level];
  this.updateImage();
};

Buildings.plot.prototype.placed = function(coords){
  this.location = coords;
  Game.tiles[this.location[1]][this.location[0]].building = this;

  // check for a road nearby
  if (!this.findRoad()){
    Game.addMessage(t("plot_too_far"));
  }
}

Buildings.plot.prototype.arrived = function(person){
  person.state = "hidden";

  this.peopleComing--;
  this.people++;
};

Buildings.plot.prototype.addPerson = function(person){
  this.peopleComing++;
};

Buildings.plot.prototype.getCapacity = function(person){
  if (this.capacity == this.people + this.peopleComing || !this.findRoad()){
    return 0;
  }else{
    return this.capacity - this.people - this.peopleComing;
  }
};

Buildings.plot.prototype.updateImage = function(){
  var lastImage = this.image;

  if (this.level === 0){
    this.image = Resources.images.plot;
  }else if (this.level == 1){
    this.image = Resources.images.hovel;
  }else if (this.level == 2){
    this.image = Resources.images.shack;
  }

  if (this.image != lastImage){
    // TODO: shouldn't call renderBuildings, should trigger a flag instead
    Game.display.tiler.renderBuildings();
  }
};

Buildings.plot.prototype.addResource = function(resource, amount){
  // a house can only get resources if there is someone living there
  if (this.level > 0){
    if (amount === undefined){
      this.needs[resource] = true;
    }else if (this.needs[resource] === undefined){
      this.needs[resource] = amount;
    }else{
      this.needs[resource] += amount;
    }
  }
};

/*************************
 * Watering Hole Methods *
 *************************/
Buildings.water_hole.prototype.update = function(){
  Buildings.basic.prototype.update.call(this);

  // if we have any workers we should put out a water carrier
  if (this.workers > 0 && !this.carrier){
    var road = this.findRoad(1);

    // should randomly place water carrier based on how well-staffed we are
    if (road){
      this.carrier = new WaterCarrier(road.xy, this);
      GameLogic.addPerson(this.carrier);
    }
  }
};

/*************************
 *   Work Camp Methods   *
 *************************/
Buildings.work_camp.prototype.update = function(){
  Buildings.basic.prototype.update.call(this);

  // if we have any workers look for places that need work
  var idleWorkers = this.idleWorkers();
  if (idleWorkers.length > 0){
    // Might need to iterate over non-housing buildings
    for (var i = 0; i < Game.buildings.length; i++){
      var building = Game.buildings[i];

      if (building.usesLabourCamp && building.needsWorkers()){
        // send a worker to this building
        // TODO: make the worker follow a road
        var worker = idleWorkers.shift();

        worker.assignWorkplace(building);
        building.addWorker();

        worker.location = this.location;
        worker.moveToBuilding(building);
        Game.addPerson(worker);
      }
    }
  }
};

Buildings.work_camp.prototype.addWorker = function(){
  this.workers++;
  this.workerObjs.push(new Worker(this.location, this));
};

Buildings.work_camp.prototype.idleWorkers = function(){
  return $.grep(this.workerObjs, function(obj) { return !obj.isWorking(); });
};

/*****************************
 *     Corn Field Methods    *
 *****************************/
Buildings.corn_field.prototype.workerArrived = function(who){
  this.workersHere.push(who);
};

Buildings.corn_field.prototype.update = function(){
  Buildings.basic.prototype.update.call(this);

  if (this.workersHere.length > 0){
    this.production++;

    if (this.production >= this.totalProduction){
      this.production = 0;

      // TODO: send the worker to a silo
    }
  }
};
