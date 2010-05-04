function Sprite(sprite, xy, offsetxy){
  if (offsetxy === undefined){
    offsetxy = $V([0, 0]);
  }

  this.location = xy;
  this.offset = offsetxy;
  this.sprite = sprite;
}

Sprite.prototype.getLocation = function(){
  // TODO: adjust sprites offset so that the bottom appears on the tile they are on
  return [
    this.location[0] + this.offset.elements[0],
    this.location[1] + this.offset.elements[1]
  ];
}

function Immigrant(start, target){
  Sprite.call(this, Resources.sprites.immigrant, start);

  this.speed = 0.15;
  this.path = AI.AStar(this, start, target.xy);

  if (!this.path){
    Game.addMessage("Some housing plots are inaccessible.");
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
        // TODO: enter house, do work
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
