function Person(sprite, xy, offsetxy){
  if (offsetxy === undefined){
    offsetxy = $V([0, 0]);
  }

  this.location = xy;
  this.offset = offsetxy;
  this.sprite = sprite;
  this.vel = false;

  this.state = "showing";
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

Person.prototype.setNewTarget = function(target){
  this.target = $V(target);
  this.offset.elements[0] = 0;
  this.offset.elements[1] = 0;
  this.vectorize();
}

Person.prototype.vectorize = function(){
  this.vlocation = $V(this.location);
  this.vel = this.target.subtract(this.vlocation).toUnitVector().multiply(this.speed);
}

Person.prototype.shouldDisplay = function(){
  return this.state != "hidden";
}

function Wanderer(sprite, start, max){
  Person.call(this, sprite, start);

  // max is the maximum number of spaces to wander
  if (max === undefined){
    max = 10;
  }

  this.spaces = 0;
  this.max = max;
  this.visited = new Array();
  this.speed = 0.08;

  this.target = false;
}
Wanderer.prototype = new Person();

Wanderer.prototype.update = function(){
  var target;
  if (this.target === false){
    target = this.findNextRoad();
    if (target){
      this.setNewTarget(target);
    }
  }
  var dist = this.offset.add($V(this.location)).subtract(this.target);
  if (dist.dot(dist) <= this.speed * this.speed){
    this.location = this.target.elements;
    this.visited.push(this.location);

    if (++this.spaces >= this.max){
      // TODO: go home
      //       make A* that only goes on roads
      this.update = function(){};
    }else{
      target = this.findNextRoad();

      if (target === false){
        this.visited = new Array();

        target = this.findNextRoad();

        if (target === false){
          // nowhere to go, just hang out here
          this.setNewTarget(this.location);
        }else{
          this.setNewTarget(target);
        }

      }else{
        this.setNewTarget(target);
      }
    }
  }else{
    this.move();
  }
};

Wanderer.prototype.findNextRoad = function(){
  if (this.location === undefined){
    return false;
  }
  var x = this.location[0], y = this.location[1];
  var next = new Array();

  if (x > 0 && Game.tiles[y][x - 1].road){
    if (this.visited.deepIndexOf([x - 1, y]) == -1){
      next.push([x - 1, y]);
    }
  }
  if (y > 0 && Game.tiles[y - 1][x].road){
    if (this.visited.deepIndexOf([x, y - 1]) == -1){
      next.push([x, y - 1]);
    }
  }
  if (x < Game.tiles[y].length - 1 && Game.tiles[y][x + 1].road){
    if (this.visited.deepIndexOf([x + 1, y]) == -1){
      next.push([x + 1, y]);
    }
  }
  if (y < Game.tiles.length - 1 && Game.tiles[y + 1][x].road){
    if (this.visited.deepIndexOf([x, y + 1]) == -1){
      next.push([x, y + 1]);
    }
  }

  if (next.length > 0){
    return next[Math.floor(Math.random() * next.length)];
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

JobFinder.prototype = new Wanderer();

JobFinder.prototype.update = function(){
  if (this.building.needsWorkers()){
    // look around for houses
    var house = this.findHouses();

    var unemp;
    if (house && house.people > 0 && (unemp = GameLogic.unemployment()) > 0){
      this.building.workers++;
      GameLogic.addJob();
    }else{
      Wanderer.prototype.update.call(this);
    }
  }else{
    // remove me
    this.state = "hidden";
    Game.removePerson(this);
  }
};

function WaterCarrier(start, building){
  Wanderer.call(this, Resources.sprites.waterCarrier, start);

  this.building = building;
}
WaterCarrier.prototype = new Wanderer();

WaterCarrier.prototype.update = function(){
  // do something random
  Wanderer.prototype.update.call(this);
}
