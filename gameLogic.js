var GameLogic = {
  createImmigrant: function(target){
    GameLogic.population.push(new Immigrant([0, 0], target));
  },
  
  update: function(dt){
    // count available housing
    var available = Game.findTile(function(tile){
      return tile.building && tile.building.type == "plot";
    });

    if (available !== false){
      GameLogic.createImmigrant(available);
    }
  }
};

GameLogic.population = new Array();

function Immigrant(start, target){
  this.location = start;
  this.path = AI.AStar(start, target.xy);
}

Immigrant.prototype.update = function(){
}
