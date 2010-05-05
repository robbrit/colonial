function Sprite(sprite, xy, offsetxy){
  if (offsetxy === undefined){
    offsetxy = $V([0, 0]);
  }

  this.location = xy;
  this.offset = offsetxy;
  this.sprite = sprite;

  this.state = "showing";
}

Sprite.prototype.getLocation = function(){
  return [
    this.location[0] + this.offset.elements[0],
    this.location[1] + this.offset.elements[1]
  ];
}

Sprite.prototype.shouldDisplay = function(){
  return this.state != "hidden";
}

function Immigrant(start, target){
  Sprite.call(this, Resources.sprites.immigrant, start);

  this.speed = 0.15;
  this.targetTile = target;
  this.path = AI.AStar(this, start, target.xy);

  if (!this.path){
    Game.addMessage(t("inaccessible_housing"));
  }else{
    this.path.shift(); // AStar returns the start already in there
    this.target = $V(this.path.shift());

    this.vectorize();
  }
}
Immigrant.prototype = Sprite.prototype;

Immigrant.prototype.update = function(){
  if (this.path){
    var dist = this.offset.add($V(this.location)).subtract(this.target);
    if (dist.dot(dist) <= this.speed * this.speed){
      // we're here! are we at our final target?
      if (this.path.length == 0){
        this.targetTile.building.addPerson(this);
        // TODO: time to start looking for a job
      }else{
        this.location = this.target.elements;
        this.target = $V(this.path.shift());
        this.offset.elements[0] = 0;
        this.offset.elements[1] = 0;
        this.vectorize();
      }
    }else{
      // move
      this.offset.elements[0] += this.vel.elements[0];
      this.offset.elements[1] += this.vel.elements[1];
    }
  }
};

Immigrant.prototype.vectorize = function(){
  this.vlocation = $V(this.location);
  this.vel = this.target.subtract(this.vlocation).toUnitVector().multiply(this.speed);
}
