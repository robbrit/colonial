var GameLogic = {
  createImmigrant: function(target){
    var immigrant = new Immigrant([0, 0], target);
    GameLogic.population++;
    Game.objects.push(immigrant);
  },
  
  update: function(dt){
    // count available housing
    var available = Game.findTile(function(tile){
      return tile.building && tile.building.capacity !== undefined && tile.building.capacity > 0;
    });

    if (available !== false && Math.random() < 0.05){
      // On a 5% probability, create an immigrant
      available.building.capacity--;
      GameLogic.createImmigrant(available);
    }
  }
};

GameLogic.population = 0;

