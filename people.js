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

  this.render_state = "showing";
}

Person.prototype.findHouses = function(radius){
  if (radius === undefined){
    radius = 2;
  }
  for (var y = Math.max(0, this.location[1] - radius); y <= Math.min(Game.tiles.length - 1, this.location[1] + radius); y++){
    for (var x = Math.max(0, this.location[0] - radius); x <= Math.min(Game.tiles[y].length - 1, this.location[0] + radius); x++){
      if (Game.tiles[y][x].building && Game.tiles[y][x].building.isHouse){
        return Game.tiles[y][x].building;
      }
    }
  }
  return false;
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
}

Person.prototype.setNewTarget = function(target){
  if (target){
    this.target = $V(target);
    this.vectorize();
  }else{
    this.vel = $V([0, 0]);
  }

  this.offset.elements[0] = 0;
  this.offset.elements[1] = 0;
}

Person.prototype.vectorize = function(){
  this.vlocation = $V(this.location);
  this.vel = this.target.subtract(this.vlocation).toUnitVector().multiply(this.speed);
}

Person.prototype.shouldDisplay = function(){
  return this.render_state != "hidden";
}
Person.prototype.hide = function(){
  this.render_state = "hidden";
}
Person.prototype.show = function(){
  this.render_state = "showing";
}

/******************
 *    Wanderer    *
 ******************/
function Wanderer(sprite, start, max){
  Person.call(this, sprite, start);

  // keep track of the spaces we've wandered in
  this.wanderSize = 20;
  this.chooseRandomPath();

  this.state = "wandering";
  this.speed = 0.08;
  this.waitTime = 400;

  this.target = false;
}
Wanderer.prototype = new Person();

Wanderer.serviceUpdate = function(service){
  return function(){
    if (this.state != "at home"){
      service();

      // do regular wandering stuff
      Wanderer.prototype.update.call(this);
    }else{
      if (this.waitTimeLeft-- <= 0){
        this.state = "wandering";
        this.show();
        this.chooseRandomPath();
      }
    }
  };
};

Wanderer.prototype.update = function(){
  // find a target
  if (this.target === false){
    this.setNewTarget(this.nextTile());
  }

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
  }else{
    this.move();
  }
};

Wanderer.prototype.arrived = function() {
  this.setNewTarget(false);

  if (this.state == "going home"){
    // note: default wanderers will never have this,
    // only ones that have a home will end up in this
    // state
    this.reachedHome();
  }else if (this.state == "wandering"){
    if (this.building !== undefined){
      // for wanderers that have a building, just send them back
      var targetRoad = this.building.findRoad(1);

      if (targetRoad){
        this.targetQueue = AI.RoadAStar(this, this.location, targetRoad.xy);
        this.state = "going home";
      }
    }else{
      // other wanderers should just continue wandering
      this.chooseRandomPath();
    }
  }
};

Wanderer.prototype.reachedHome = function(){
  // go inside
  this.hide();
  this.state = "at home";
  this.waitTimeLeft = this.waitTime;
};

Wanderer.prototype.chooseRandomPath = function(){
  this.targetQueue = this.getRandomRoads();
}
Wanderer.prototype.getRandomRoads = function(){
  // if we don't have a pre-set path, just wander
  if (this.location === undefined){
    return false;
  }

  var path = [this.location];
  var x = this.location[0], y = this.location[1];
  for (var i = 0; i < this.wanderSize; i++){
    var next = new Array();

    if (x > 0 && Game.tiles[y][x - 1].road){
      if (path.deepIndexOf([x - 1, y]) == -1){
        next.push([x - 1, y]);
      }
    }
    if (y > 0 && Game.tiles[y - 1][x].road){
      if (path.deepIndexOf([x, y - 1]) == -1){
        next.push([x, y - 1]);
      }
    }
    if (x < Game.tiles[y].length - 1 && Game.tiles[y][x + 1].road){
      if (path.deepIndexOf([x + 1, y]) == -1){
        next.push([x + 1, y]);
      }
    }
    if (y < Game.tiles.length - 1 && Game.tiles[y + 1][x].road){
      if (path.deepIndexOf([x, y + 1]) == -1){
        next.push([x, y + 1]);
      }
    }

    if (next.length > 0){
      var nextTile = next[Math.floor(Math.random() * next.length)];
      path.push(nextTile);
      x = nextTile[0]; y = nextTile[1];
    }else{
      break;
    }
  }
  return path;
}

Wanderer.prototype.nextTile = function(){
  if (this.targetQueue.length > 0){
    return this.targetQueue.shift();
  }else{
    return false;
  }
};

function Immigrant(start, target){
  Person.call(this, Resources.sprites.immigrant, start);

  this.speed = 0.10;
  this.targetTile = target;
  this.path = AI.GlobalAStar(this, start, target.xy);

  if (!this.path){
    Game.addMessage(t("inaccessible_housing"));
  }else{
    this.path.shift(); // AStar returns the start already in there
    this.target = $V(this.path.shift());

    this.vectorize();
  }
}
Immigrant.prototype = new Person();

Immigrant.prototype.update = function(){
  if (this.path){
    var dist = this.offset.add($V(this.location)).subtract(this.target);
    if (dist.dot(dist) <= this.speed * this.speed){
      // we're here! are we at our final target?
      if (this.path.length == 0){
        // TODO: check to see if the building is still here
        this.targetTile.building.arrived(this);
        Game.removePerson(this);
      }else{
        this.location = this.target.elements;
        this.setNewTarget($V(this.path.shift()));
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

JobFinder.prototype.update = function(){
  if (this.building.needsWorkers()){
    // look around for houses
    var house = this.findHouses();

    var unemp;
    if (house && house.people > 0 && GameLogic.unemployment() > 0){
      this.building.workers++;
      GameLogic.addJob();
    }else{
      Wanderer.prototype.update.call(this);
    }
  }else{
    // remove me
    this.hide();
    Game.removePerson(this);
  }
};

/***********************
 *    Water Carrier    *
 ***********************/
function WaterCarrier(start, building){
  Wanderer.call(this, Resources.sprites.waterCarrier, start);

  this.building = building;
}
WaterCarrier.prototype = new Wanderer();

WaterCarrier.prototype.update = Wanderer.serviceUpdate(function(){
  // TODO: fill the nearby houses water
});
