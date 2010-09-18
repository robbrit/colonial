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
      this.yOffset = 0;

      this.usesLabourCamp = false;
    }
  },

  corn_field: function(xy){
    Buildings.basic.call(this, xy, "corn_field");

    this.width = this.height = 3;

    this.production = 0;
    this.totalProduction = 1000;
    this.jobs = 1;
    this.workersHere = [];
    this.usesLabourCamp = true;

    this.goodsAtProduction = {
      corn: 50
    };

    this.state = "working";
  },

  market: function(xy){
    Buildings.basic.call(this, xy, "market");

    this.width = this.height = 2;

    this.jobs = 5;
    this.merchant = false;
    this.state = "merchant_here";

    this.contents = {
      corn: 0
    };
  },

  plot: function(xy){
    Buildings.basic.call(this, xy, "plot");

    this.capacity = 1;
    this.people = 0;
    this.peopleComing = 0;
    this.isHouse = true;

    this.level = 0;
    this.levelUpgradeTime = 0;
    this.nextLevel = 0;

    this.needs = {
      water: false,
      corn: 0
    };
  },

  silo: function(xy){
    Buildings.basic.call(this, xy, "silo");

    this.width = this.height = 2;
    this.yOffset = 29;

    this.capacity = 1000;
    this.pendingCapacity = 0; // for stuff on its way
    this.contents = {
      corn: 0
    };

    this.jobs = 10;
  },

  water_hole: function(xy){
    Buildings.basic.call(this, xy, "water_hole");
    this.width = this.height = 2;

    this.carrier = false;
    this.state = "carrier_here";
    this.jobs = 2;
  },

  work_camp: function(xy){
    Buildings.basic.call(this, xy, "work_camp");
    this.width = this.height = 2;

    this.jobs = 10;
    this.workerObjs = new Array();
    this.lastWorkerSent = 0;
  }
};
Buildings.plot.prototype = new Buildings.basic();
Buildings.water_hole.prototype = new Buildings.basic();
Buildings.corn_field.prototype = new Buildings.basic();
Buildings.work_camp.prototype = new Buildings.basic();
Buildings.silo.prototype = new Buildings.basic();
Buildings.market.prototype = new Buildings.basic();

Buildings.basic.prototype.update = function() {
  // certain buildings use a job finder to find labourers,
  // so send one out if we need workers
  if (GameLogic.population > 0 && this.usesLabourCamp === false && this.needsWorkers() && this.jobFinder === false){
    var road = this.findRoad(1);

    if (road){
      this.jobFinder = new JobFinder(road.xy, this);
      GameLogic.addPerson(this.jobFinder);
    }
  }
};

Buildings.basic.prototype.getCapacity = function() { return 0; }

Buildings.basic.prototype.getText = function(which){
  if (which == "header"){
    return t(this.type);
  }else{
    return t(this.type + "_body");
  }
};

// overridden for custom building rendering
Buildings.basic.prototype.render = function(tiler, context){
  coords = tiler.toScreenCoords(this.location, false);
  context.drawImage(this.image.image, coords[0], coords[1] - (tiler.jhat * (this.height - 1)) - this.yOffset);
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

Buildings.basic.prototype.canStore = function(item){
  return false;
}

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
  1, 1, 2, 3
];
Buildings.plot.prototype.upgradeTo = function(level){
  this.levelUpgradeTime = 200;
  this.nextLevel = level;
};

Buildings.plot.prototype.update = function(){
  if (this.people === 0){
    this.level = 0;
  }else{
    if (this.level == 0){
      // jumps to level 1 from 0 are instant
      this.level = 1;
    }else{
      if (this.nextLevel > 0){
        if (--this.levelUpgradeTime <= 0){
          this.level = this.nextLevel;
          this.nextLevel = 0;
          this.levelUpgradeTime = 0;
        }
      }else if (this.level == 1){
        if (this.needs.water === true){
          this.upgradeTo(2);
        }
      }else if (this.level == 2){
        if (this.needs.water === false){
          this.upgradeTo(1);
        }else if (this.needs.corn > 0){
          this.upgradeTo(3);
        }
      }else if (this.level == 3){
        if (this.needs.corn === 0){
          this.upgradeTo(2);
        }
      }
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

  if (this.nextLevel > 0){
    var min = Math.min(this.level, this.nextLevel);
    var max = Math.max(this.level, this.nextLevel);
    this.image = Resources.images["house_shift_" + min + "_" + max];
  }else if (this.level === 0){
    this.image = Resources.images.plot;
  }else if (this.level == 1){
    this.image = Resources.images.hovel;
  }else if (this.level == 2){
    this.image = Resources.images.shack;
  }else if (this.level == 3){
    this.image = Resources.images.hut;
  }

  if (this.image.yOffset !== undefined){
    this.yOffset = this.image.yOffset;
  }else{
    this.yOffset = 0;
  }

  if (this.image != lastImage){
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

Buildings.plot.prototype.getText = function(which){
  var base = Buildings.basic.prototype.getText.call(this, which);
  
  if (which == "body"){
    base += "<br /><br />";
    if (this.nextLevel != 0){
      if (this.nextLevel > this.level){
        base += t("improving");
      }else{
        base += t("worsening");
      }
    }else{
      base += t("house_level_" + this.level);
    }
  }

  return base;
};

/*************************
 * Watering Hole Methods *
 *************************/
Buildings.water_hole.prototype.update = function(){
  Buildings.basic.prototype.update.call(this);

  // if we have any workers we should put out a water carrier
  if (this.workers > 0){
    if (this.state == "carrier_here"){
      var road = this.findRoad(1);

      // TODO: should randomly place water carrier based on how well-staffed we are
      if (road){
        if (!this.carrier){
          this.carrier = new WaterCarrier(road.xy, this);
          GameLogic.addPerson(this.carrier);
        }
      }
    }
  }
};

/*************************
 *   Work Camp Methods   *
 *************************/
Buildings.work_camp.prototype.update = function(){
  Buildings.basic.prototype.update.call(this);

  // if we have any workers look for places that need work
  if (this.lastWorkerSent <= 0){
    var idleWorkers = this.idleWorkers();
    if (idleWorkers.length > 0){
      // Might need to iterate over non-housing buildings
      for (var i = 0; i < Game.buildings.length; i++){
        var building = Game.buildings[i];

        if (building.usesLabourCamp && building.needsWorkers()){
          // send a worker to this building
          var worker = idleWorkers.shift();

          // not sure why this is ever undefined, but it is sometimes
          if (worker){
            worker.assignWorkplace(building);
            building.addWorker();

            var road = this.findRoad(1);

            if (road){
              Game.addPerson(worker);
              worker.location = road.xy;
              worker.moveToBuildingByRoad(building);
              this.lastWorkerSent = 100;
            }
          }
        }
      }
    }
  }else{
    this.lastWorkerSent--;
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
  this.whileInside(who);
};

Buildings.corn_field.prototype.update = function(){
  Buildings.basic.prototype.update.call(this);

  if (this.state == "working"){
    if (this.workersHere.length > 0){
      this.production++;

      var pct = this.getProductionPct();
      if (pct % 10 == 0){
        Game.display.tiler.renderBuildings();
      }

      if (this.production >= this.totalProduction){
        this.production = this.totalProduction;
        this.state = "production_done";
      }
    }
  }else if (this.state == "production_done"){
    var farm = this;
    var silo = Game.findBuilding("silo", function(silo){
      return silo.hasRoom(farm.goodsAtProduction.corn);
    });

    if (silo){
      // send the worker to this silo
      if (this.workersHere[0].transportGoodsTo(this.goodsAtProduction, silo)){
        // only do it if a path can be found
        this.production = 0;
        this.state = "waiting";
        Game.display.tiler.renderBuildings();
      }
    }
  }else{
    // do nothing
  }
};

Buildings.corn_field.prototype.whileInside = function(worker){
  // TODO: make the worker wander around, show farming animation
};

Buildings.corn_field.prototype.getText = function(which){
  var base = Buildings.basic.prototype.getText.call(this, which);
  
  if (which == "body"){
    return base +
      "<br /><br />" +
      "Production is at " + this.getProductionPct() + "%.";
  }else{
    return base;
  }
};

Buildings.corn_field.prototype.getProductionPct = function(){
  return Math.round(this.production / this.totalProduction * 100);
};

Buildings.corn_field.prototype.getWorkerSprite = function(workerState){
  if (workerState == "inside"){
    return Resources.sprites.worker_farming;
  }else{
    return Resources.sprites.worker;
  }
};

Buildings.corn_field.prototype.render = function(tiler, context){
  Buildings.basic.prototype.render.call(this, tiler, context);

  var pct = this.getProductionPct();
  var corn = Resources.images.corn;
  var coords;

  // render the different cells
  if (pct >= 10){
    coords = tiler.toScreenCoords(this.location, false);
    context.drawImage(corn.image, coords[0], coords[1]);
  }
  if (pct >= 20){
    coords = tiler.toScreenCoords([this.location[0] + 1, this.location[1]], false);
    context.drawImage(corn.image, coords[0] + 1, coords[1]);
  }
  if (pct >= 30){
    coords = tiler.toScreenCoords([this.location[0] + 2, this.location[1]], false);
    context.drawImage(corn.image, coords[0] + 2, coords[1]);
  }
  if (pct >= 40){
    coords = tiler.toScreenCoords([this.location[0], this.location[1] + 1], false);
    context.drawImage(corn.image, coords[0], coords[1] + 1);
  }
  if (pct >= 50){
    coords = tiler.toScreenCoords([this.location[0] + 1, this.location[1] + 1], false);
    context.drawImage(corn.image, coords[0] + 1, coords[1] + 1);
  }
  if (pct >= 60){
    coords = tiler.toScreenCoords([this.location[0] + 2, this.location[1] + 1], false);
    context.drawImage(corn.image, coords[0] + 2, coords[1] + 1);
  }
  if (pct >= 70){
    coords = tiler.toScreenCoords([this.location[0], this.location[1] + 2], false);
    context.drawImage(corn.image, coords[0], coords[1] + 2);
  }
  if (pct >= 80){
    coords = tiler.toScreenCoords([this.location[0] + 1, this.location[1] + 2], false);
    context.drawImage(corn.image, coords[0] + 1, coords[1] + 2);
  }
  if (pct >= 90){
    coords = tiler.toScreenCoords([this.location[0] + 2, this.location[1] + 2], false);
    context.drawImage(corn.image, coords[0] + 2, coords[1] + 2);
  }
}

/*****************************
 *        Silo Methods       *
 *****************************/
Buildings.silo.prototype.hasRoom = function(amount){
  var total = this.pendingCapacity + amount;

  for (var type in this.contents){
    total += this.contents[type];
  }

  return total <= this.capacity;
};

Buildings.silo.prototype.contains = function(what, amount){
  if (amount === undefined){
    amount = 1;
  }

  return this.contents[what] === undefined ? false : this.contents[what] >= amount;
};

Buildings.silo.prototype.addGoods = function(what){
  for (var type in what){
    if (this.contents[type] === undefined){
      this.contents[type] = 0;
    }
    this.contents[type] += what[type];
  }
};

Buildings.silo.prototype.removeGoods = function(what){
  for (var type in what){
    if (this.contents[type] === undefined){
      this.contents[type] = 0;
    }
    this.contents[type] -= what[type];

    if (this.contents[type] < 0){
      this.contents[type] = 0;
    }
  }
};

Buildings.silo.prototype.getText = function(which){
  var base = Buildings.basic.prototype.getText.call(this, which);
  
  if (which == "body"){
    base +=
      "<br /><br />";

    for (var crop in this.contents){
      if (crop !== undefined){
        base += crop.capitalize() + ": " + this.contents[crop] + "<br />";
      }
    }
  }

  return base;
};

/***********************
 *   Market Methods    *
 ***********************/
Buildings.market.prototype.update = function(){
  Buildings.basic.prototype.update.call(this);

  if (this.workers > 0){
    // if we have any workers we should put out a merchant
    if (this.contents.corn == 0){
      if (this.state != "waiting_for_goods"){
        // send the merchant to a nearby silo with food
        var silo = Game.findBuilding("silo", function(silo){
          return silo.contains("corn", 200);
        });

        if (silo){
          var road = this.findRoad(1);

          if (road){
            // send the merchant to this silo
            if (!this.merchant){
              this.merchant = new Merchant(road.xy, this, false);
              GameLogic.addPerson(this.merchant);
            }else{
              this.merchant.location = road.xy;
            }

            this.merchant.silo = silo;
            this.merchant.moveToBuildingByRoad(silo);
            this.merchant.state = "getting_goods";
            this.state = "waiting_for_goods";
          }
        }
      }
    }else if (this.state != "merchant_out"){
      var road = this.findRoad(1);

      if (road){
        if (!this.merchant){
          this.merchant = new Merchant(road.xy, this);
          GameLogic.addPerson(this.merchant);
        }else{
          this.merchant.chooseRandomPath();
        }

        this.state = "merchant_out";

        // give the merchant some goods to share
        var amount = Math.min(200, this.contents.corn);

        this.contents.corn -= amount;

        this.merchant.addResources({corn: amount});
      }
    }
  }
};

Buildings.market.prototype.addGoods = Buildings.silo.prototype.addGoods;
