var GameLogic = {
  createImmigrant: function(target){
    GameLogic.population.push(new Immigrant([0, 0], target));
  },
  
  update: function(dt){
    // count available housing
    var available = Game.findTile(function(tile){
      return tile.building && tile.building.capacity !== undefined && tile.building.capacity > 0;
    });

    if (available !== false){
      available.capacity--;
      GameLogic.createImmigrant(available);
    }
  }
};

GameLogic.population = new Array();

function Immigrant(start, target){
  this.location = start;

  this.path = AI.AStar(this, start, target.xy);
  this.path.shift(); // AStar returns the start already in there
  this.target = this.path.shift();

  this.sprite = Resources.sprites.immigrant;
}

Immigrant.prototype.update = function(){
  /*
  if at target
    get next target
  else
    move toward target
  */
}
