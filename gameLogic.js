var GameLogic = {
  createImmigrant: function(target){
    var immigrant = new Immigrant([0, 0], target);
    GameLogic.population++;
    Game.objects.push(immigrant);
    target.building.addPerson(immigrant);
  },
  
  update: function(dt){
    // count available housing
    var available = Game.findTile(function(tile){
      return tile.building && tile.building.getCapacity !== undefined && tile.building.getCapacity() > 0;
    });

    if (available !== false && Math.random() < 0.05){
      // On a 5% probability, create an immigrant
      GameLogic.createImmigrant(available);
    }
  }
};

GameLogic.population = 0;

