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
 *    Wanderer    *
 ******************/
function Wanderer(sprite, start, autoWander){
  Person.call(this, sprite, start);

  // keep track of the spaces we've wandered in
  this.wanderSize = 20;

  if (autoWander === undefined || autoWander){
    this.chooseRandomPath();
  }else{
    this.setNewTarget(false);
  }

  this.speed = 0.08;
  this.waitTime = 250; // this should be adjustable based on the building's employment level
}
Wanderer.prototype = new Person();

Wanderer.serviceUpdate = function(service){
  return function(){
    if (this.state != "at home"){
      service(this);

      // do regular wandering stuff
      Wanderer.prototype.update.call(this);
    }else{
      if (this.waitTimeLeft-- <= 0){
        this.chooseRandomPath();
      }
    }
  };
};

Wanderer.prototype.arrived = function() {
  Person.prototype.arrived.call(this);

  if (this.state == "going home"){
    // note: default wanderers will never have this,
    // only ones that have a home will end up in this
    // state
    this.reachedHome();
  }else if (this.state == "wandering"){
    if (this.building !== undefined){
      this.goHome();
    }else{
      // other wanderers should just continue wandering
      this.chooseRandomPath();
    }
  }
};

Wanderer.prototype.goHome = function(){
  // for wanderers that have a building, just send them back
  var targetRoad = this.building.findRoad(1);

  if (targetRoad){
    this.targetQueue = AI.RoadAStar(this, this.location, targetRoad.xy);
    this.state = "going home";
  }
};

Wanderer.prototype.reachedHome = function(){
  // go inside
  this.hide();
  this.state = "at home";
  this.setNewTarget(false);
  this.waitTimeLeft = this.waitTime;
};

Wanderer.prototype.chooseRandomPath = function(){
  this.show();
  this.state = "wandering";
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

function JobFinder(start, building){
  Wanderer.call(this, Resources.sprites.jobFinder, start);

  this.building = building;
}

/********************
 *    Job Finder    *
 ********************/
JobFinder.prototype = new Wanderer();

JobFinder.prototype.update = Wanderer.serviceUpdate(function(me){
  if (me.building.needsWorkers()){
    // look around for houses
    var house = me.findHouses();

    var unemp;
    if (house && house.people > 0 && GameLogic.unemployment() > 0){
      me.building.addWorker();
      GameLogic.addJob();
    }
  }else{
    // remove me
    me.hide();
    Game.removePerson(me);
  }
});

/***********************
 *    Water Carrier    *
 ***********************/
function WaterCarrier(start, building){
  Wanderer.call(this, Resources.sprites.waterCarrier, start);

  this.building = building;
}
WaterCarrier.prototype = new Wanderer();

WaterCarrier.prototype.update = Wanderer.serviceUpdate(function(me){
  // give water to nearby houses
  var houses = me.findHouses(2, true);

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

/*Worker.prototype.update = function(){
  Person.prototype.update.call(this);
};*/

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
function Merchant(start, building, autoWander){
  Wanderer.call(this, Resources.sprites.merchant, start, autoWander);

  this.building = building;
  this.resources = {};
  this.visited = [];
}
Merchant.prototype = new Wanderer();

Merchant.prototype.serviceUpdate = Wanderer.serviceUpdate(function(me){
  // give the resources I'm carrying to nearby houses
  if (me.resources.corn){
    var houses = me.findHouses(2, true);

    var amount;

    for (var i = 0; i < houses.length; i++){
      if (me.visited.indexOf(houses[i]) == -1){
        amount = Math.min(5, me.resources.corn);

        me.resources.corn -= amount;

        houses[i].addResource("corn", amount);
        me.visited.push(houses[i]);
      }
    }

    if (me.resources.corn === 0){
      // time to go home
      me.goHome();
    }
  }
});

Merchant.prototype.update = function(){
  if (this.state == "wandering" || this.state == "at home"){
    this.serviceUpdate();
  }else{
    Person.prototype.update.call(this);
  }
};

Merchant.prototype.arrived = function(){
  if (this.state == "getting_goods"){
    // get the goods, go back home
    this.silo.removeGoods({corn: 200});
    this.state = "going home";
    // TODO: handle if there is no path
    this.moveToBuildingByRoad(this.building);
  }else if (this.state == "going home"){
    this.building.addGoods({corn: 200});
    Wanderer.prototype.arrived.call(this);
  }else{
    Wanderer.prototype.arrived.call(this);
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
