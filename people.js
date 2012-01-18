/******************
 * Default Person *
 ******************/
function Person(sprite, xy, offsetxy){
  if (offsetxy === undefined){
    offsetxy = $V([0, 0]);
  }

  this.location = xy;
  this.offset = offsetxy;
  this.sprite = sprite;
  this.vel = false;
  this.target = false;
  this.targetQueue = new Array();
  this.speed = 0.10;

  this.renderState = "showing";
  this.canMoveOffroad = false;

  this.setNewTarget(false);
} 
Person.prototype.findHouses = function(radius, multiple){
  if (radius === undefined){
    radius = 2;
  }
  if (multiple === undefined){
    multiple = false;
  }
  var houses = new Array();
  for (var y = Math.max(0, this.location[1] - radius); y <= Math.min(Game.tiles.length - 1, this.location[1] + radius); y++){
    for (var x = Math.max(0, this.location[0] - radius); x <= Math.min(Game.tiles[y].length - 1, this.location[0] + radius); x++){
      if (Game.tiles[y][x].building && Game.tiles[y][x].building.isHouse){
        if (multiple){
          houses.push(Game.tiles[y][x].building);
        }else{
          return Game.tiles[y][x].building;
        }
      }
    }
  }
  if (multiple){
    return houses;
  }else{
    return false;
  }
};

Person.prototype.setSprite = function(sprite){
  this.sprite = sprite;
};

Person.prototype.getLocation = function(){
  return [
    this.location[0] + this.offset.elements[0],
    this.location[1] + this.offset.elements[1]
  ];
}

Person.prototype.move = function(){
  if (this.vel){
    this.offset.elements[0] += this.vel.elements[0];
    this.offset.elements[1] += this.vel.elements[1];
  }
};

Person.prototype.stop = function(){
  this.offset = $V([0, 0]);
  this.vel = $V([0, 0]);
};

Person.prototype.arrived = function(){
  this.setNewTarget(false);
};

Person.prototype._moveToBuilding = function(target, pathfinder){
  this.targetTile = target;

  this.targetQueue = pathfinder(this, this.location, target.xy || target.location);

  if (this.targetQueue){
    this.targetQueue.shift(); // A* includes the start
    this.setNewTarget(this.targetQueue.shift());
  }else{
    // no path!
    this.setNewTarget(false);
  }
}

Person.prototype.moveToBuilding = function(target){
  this.show();
  this._moveToBuilding(target, AI.GlobalAStar);
};

Person.prototype.moveToBuildingByRoad = function(target){
  this.show();
  var road = target.findRoad(1);

  if (road){
    var targetBuilding = target;

    // odd chance we might start where we are going
    if (road.xy[0] != this.location[0] || road.xy[0] != this.location[1]){
      this._moveToBuilding(road, AI.RoadAStar);
    }else{
      this.setNewTarget(this.location);
    }

    return true;
  }else{
    return false;
  }
}

Person.prototype.setNewTarget = function(target){
  if (target){
    this.target = $V(target);
    this.vlocation = $V(this.location);
    this.vel = this.target.subtract(this.vlocation).toUnitVector().multiply(this.speed);
  }else{
    this.vel = $V([0, 0]);
    this.targetBuilding = false;
  }

  this.offset.elements[0] = 0;
  this.offset.elements[1] = 0;
};

Person.prototype.shouldDisplay = function(){
  return this.renderState != "hidden";
};
Person.prototype.hide = function(){
  this.renderState = "hidden";
};
Person.prototype.show = function(){
  this.renderState = "showing";
};

Person.prototype.update = function(){
  // find a target
  if (this.target === false){
    this.setNewTarget(this.nextTile());
  }

  if (this.target !== false){
    // check to see if we've arrived at where we are going
    var dist = this.offset.add($V(this.location)).subtract(this.target);
    if (dist.dot(dist) <= this.speed * this.speed){
      this.location = this.target.elements;

      var target = this.nextTile();

      if (target === false){
        this.arrived();
      }else{
        this.setNewTarget(target);
      }
    }
  }

  this.move();
};
Person.prototype.nextTile = function(){
  if (this.targetQueue.length > 0){
    return this.targetQueue.shift();
  }else{
    return false;
  }
};

/******************
 *    Fetcher     *
 ******************/
function Fetcher(sprite, home){
  if (home){
    Person.call(this, sprite, home.findRoad(1).xy);
  }else{
    Person.call(this, sprite, null);
  }
  this.building = home;
  this.pauseTime = 90;

  // by default we're hanging out at home
  this.goInHome();
};
Fetcher.prototype = new Person();

Fetcher.prototype.goInHome = function(){
  this.state = "waiting at home";
  this.hide();

  // when workers arrive back home, make them
  // wait a little while
  this.pauseTimeLeft = this.pauseTime;
};

Fetcher.prototype.moveToBuilding = function(building){
  if (this.state == "at home"){
    this.goOutside();
  }
  this.targetBuilding = building;
  this.state = "to target";
  this.moveToBuildingByRoad(building);
};

Fetcher.prototype.arrived = function(){
  Person.prototype.arrived.call(this);

  if (this.state == "to target"){
    if (this.arrivedAtBuilding(this.targetBuilding)){
      this.goHome();
    }
  }else if (this.state == "to home"){
    this.goInHome();
  }
};

Fetcher.prototype.update = function(){
  Person.prototype.update.call(this);

  if (this.state == "waiting at home"){
    if (--this.pauseTimeLeft <= 0){
      this.state = "at home";
      this.readyToGo();
    }
  }
};

Fetcher.prototype.goHome = function(){
  this.state = "to home";
  this.moveToBuildingByRoad(this.building);
};

Fetcher.prototype.goOutside = function(){
  this.location = this.building.findRoad(1).xy;
};

// override this method for workers that need to do something
// special in that spot. The method returns false if the overridden
// version handles the next state and location.
Fetcher.prototype.arrivedAtBuilding = function(which){ return true; };

// override this one for when the workers wait time is done.
Fetcher.prototype.readyToGo = function(){};

/******************
 *    Wanderer    *
 ******************/
function Wanderer(sprite, home){
  Fetcher.call(this, sprite, home);

  // keep track of the spaces we've wandered in
  this.wanderSize = 20;
  this.setNewTarget(false);

  this.speed = 0.08;
}
Wanderer.prototype = new Fetcher();

Wanderer.prototype.readyToGo = function(){
  this.wander();
};

Wanderer.prototype.arrived = function() {
  Fetcher.prototype.arrived.call(this);

  if (this.state == "wandering"){
    // arrived at the end of the wander list
    this.goHome();
  }
};

/* This method is for workers that wander around providing
 * some service to locals.
 */
Wanderer.serviceUpdate = function(service){
  return function(){
    if (this.state == "wandering"){
      service.call(this);
    }

    // do regular wandering stuff
    Wanderer.prototype.update.call(this);
  };
};

Wanderer.prototype.wander = function(){
  this.show();
  this.state = "wandering";

  // put myself on a road nearby
  this.goOutside();
  
  this.targetQueue = this.getRandomRoads();
}
Wanderer.prototype.getRandomRoads = function(){
  // if we don't have a pre-set path, just wander
  if (this.location === undefined){
    return false;
  }

  var path = [this.location];
  var visited = [this.location];
  var x = this.location[0], y = this.location[1];
  for (var i = 0; i < this.wanderSize; i++){
    var next = new Array();

    if (x > 0 && Game.tiles[y][x - 1].road){
      if (visited.deepIndexOf([x - 1, y]) == -1){
        next.push([x - 1, y]);
      }
    }
    if (y > 0 && Game.tiles[y - 1][x].road){
      if (visited.deepIndexOf([x, y - 1]) == -1){
        next.push([x, y - 1]);
      }
    }
    if (x < Game.tiles[y].length - 1 && Game.tiles[y][x + 1].road){
      if (visited.deepIndexOf([x + 1, y]) == -1){
        next.push([x + 1, y]);
      }
    }
    if (y < Game.tiles.length - 1 && Game.tiles[y + 1][x].road){
      if (visited.deepIndexOf([x, y + 1]) == -1){
        next.push([x, y + 1]);
      }
    }

    if (next.length > 0){
      var nextTile = next[Math.floor(Math.random() * next.length)];
      path.push(nextTile);
      visited.push(nextTile);
      x = nextTile[0]; y = nextTile[1];
    }else{
      // we're at a dead end, reset visited list
      visited = [];
      i--;
    }
  }
  return path;
}


/******************
 *    Immigrant   *
 ******************/
function Immigrant(start, target){
  Person.call(this, Resources.sprites.immigrant, start);

  this.canMoveOffroad = true;
  this.moveToBuilding(target);

  if (!this.targetQueue){
    Game.addMessage(t("inaccessible_housing"));
  }
}
Immigrant.prototype = new Person();

Immigrant.prototype.update = function(){
  if (this.targetQueue){
    var dist = this.offset.add($V(this.location)).subtract(this.target);
    if (dist.dot(dist) <= this.speed * this.speed){
      // we're here! are we at our final target?
      if (this.targetQueue.length == 0){
        // TODO: check to see if the building is still here
        this.targetTile.building.arrived(this);
        GameLogic.immigrantArrived(this);
        Game.removePerson(this);
      }else{
        this.location = this.target.elements;
        this.setNewTarget($V(this.targetQueue.shift()));
      }
    }else{
      // move
      this.move();
    }
  }
};

/********************
 *    Job Finder    *
 ********************/
function JobFinder(building){
  Wanderer.call(this, Resources.sprites.jobFinder, building);

  this.building = building;
}
JobFinder.prototype = new Wanderer();

JobFinder.prototype.update = Wanderer.serviceUpdate(function(){
  if (this.building.needsWorkers()){
    // look around for houses
    var house = this.findHouses();

    var unemp;
    if (house && house.people > 0 && GameLogic.unemployment() > 0){
      this.building.addWorker();
      GameLogic.addJob();
    }
  }else{
    // remove me
    this.hide();
    Game.removePerson(this);
  }
});

/***********************
 *    Water Carrier    *
 ***********************/
function WaterCarrier(building){
  Wanderer.call(this, Resources.sprites.waterCarrier, building);

  this.building = building;
}
WaterCarrier.prototype = new Wanderer();

WaterCarrier.prototype.update = Wanderer.serviceUpdate(function(){
  // give water to nearby houses
  var houses = this.findHouses(2, true);

  for (var i = 0; i < houses.length; i++){
    houses[i].addResource("water");
  }
});

/**********************
 *       Worker       *
 **********************/
function Worker(start, building){
  Person.call(this, Resources.sprites.worker, start);

  this.camp = building;
  this.working = false;
  this.workplace = null;
  this.canMoveOffroad = true;
}
Worker.prototype = new Person();

Worker.prototype.isWorking = function() { return this.working; }

Worker.prototype.assignWorkplace = function(building){
  this.working = true;
  this.workplace = building;
  this.setState("on_road");
};

Worker.prototype.transportGoodsTo = function(goods, building){
  this.location = this.workplace.findRoad(1).xy;

  if (this.moveToBuildingByRoad(building)){
    this.setState("transporting");
    this.dropSpot = building;
    this.goods = goods;

    return true;
  }
  return false;
};

Worker.prototype.arrived = function(){
  if (this.state == "on_road"){
    // arrived from road, move onto building
    this.moveToBuilding(this.workplace);
    this.setState("entering");
  }else if (this.state == "entering"){
    Person.prototype.arrived.call(this);
    this.setState("inside");
    this.workplace.workerArrived(this);
  }else if (this.state == "inside"){
    this.workplace.whileInside(this);
  }else if (this.state == "transporting"){
    // arrived at silo
    this.dropSpot.addGoods(this.goods);
    this.goods = false;

    if (this.moveToBuildingByRoad(this.workplace)){
      this.setState("returning");
    }else{
      this.setState("waiting_for_return");
    }
  }else if (this.state == "returning"){
    this.moveToBuilding(this.workplace);
    this.setState("entering");
    this.workplace.state = "working";
  }
}

Worker.prototype.setState = function(state){
  this.state = state;
  this.setSprite(this.workplace.getWorkerSprite(this.state));
}

Worker.prototype.update = function(){
  if (this.state == "waiting_for_return"){
    // check to see if there is a road
    if (this.moveToBuildingByRoad(this.workplace)){
      this.setState("returning");
    }
  }

  Person.prototype.update.call(this);
};

/***********************
 *      Merchant       *
 ***********************/
function Merchant(building){
  Wanderer.call(this, Resources.sprites.merchant, building);

  this.resources = {};
  this.visited = [];
}
Merchant.prototype = new Wanderer();

Merchant.prototype.update = Wanderer.serviceUpdate(function(){
  // give the resources I'm carrying to nearby houses
  if (this.resources.corn){
    var houses = this.findHouses(2, true);

    var amount;

    for (var i = 0; i < houses.length; i++){
      if (this.visited.indexOf(houses[i]) == -1){
        amount = Math.min(5, this.resources.corn);

        this.resources.corn -= amount;

        houses[i].addResource("corn", amount);
        this.visited.push(houses[i]);
      }
    }

    if (this.resources.corn === 0){
      // time to go home
      this.goHome();
    }
  }
});

Merchant.prototype.arrivedAtBuilding = function(which){
  if (which == this.targetBuilding){
    // arrived at target
    // TODO: should try to take out 200 but can't always
    this.silo.removeGoods({corn: 200});
  }else if (which == this.building){
    this.building.addGoods({corn: 200});
  }
};

Merchant.prototype.addResources = function(resources){
  this.visited = [];
  for (var good in resources){
    if (this.resources[good] !== undefined){
      this.resources[good] += resources[good];
    }else{
      this.resources[good] = resources[good];
    }
  }
};
