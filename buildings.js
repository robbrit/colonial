var Buildings = {
  basic: function(xy){
    this.location = xy;
  },
  road: function(xy){
    Buildings.basic.call(this, xy);
    this.image = Resources.images.road;
    this.type = "road";
  },

  plot: function(xy){
    Buildings.basic.call(this, xy);
    this.image = Resources.images.plot;
    this.type = "plot";
    this.capacity = 1;
    this.people = new Array();
  }
};
Buildings.plot.prototype = Buildings.basic.prototype;
Buildings.road.prototype = Buildings.basic.prototype;

Buildings.basic.prototype.placed = function(coords){
  this.location = coords;
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
  this.people.push(person);

  this.image = Resources.images.hovel;
  Game.display.tiler.renderBuildings();
};

Buildings.plot.prototype.addPerson = function(person){
  this.capacity--;
};

Buildings.plot.prototype.getCapacity = function(person){
  if (this.capacity == 0 || !this.findRoad()){
    return 0;
  }else{
    return this.capacity;
  }
};

Buildings.basic.prototype.findRoad = function(radius, width, height){
  if (radius === undefined){
    radius = 2;
  }
  if (width === undefined){
    width = 1;
  }
  if (height === undefined){
    height = 1;
  }
  for (var y = Math.max(0, this.location[1] - radius); y <= Math.min(Game.tiles.length - 1, this.location[1] + height - 1 + radius); y++){
    for (var x = Math.max(0, this.location[0] - radius); x <= Math.min(Game.tiles[y].length - 1, this.location[0] + width - 1 + radius); x++){
      if (Game.tiles[y][x].building && Game.tiles[y][x].building.type == "road"){
        return true;
      }
    }
  }
  return false;
};
