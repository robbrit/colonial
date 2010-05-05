var GameLogic = {
  createImmigrant: function(target){
    var immigrant = new Immigrant([0, 0], target);
    GameLogic.population++;
    Game.objects.push(immigrant);
    target.building.addPerson(immigrant);
  },
  
  update: function(dt){
    GameLogic.updateFuncs[GameLogic.updateNo++](dt);

    if (GameLogic.updateNo == GameLogic.updateFuncs.length){
      GameLogic.updateNo = 0;
    }
  },

  // split up updateFuncs so that certain things aren't being called every frame
  updateFuncs: [
    function(dt){
      // count available housing
      // TODO: use a list for buildings and iterate over that instead of over every tile
      var available = Game.findTile(function(tile){
        return tile.building && tile.building.getCapacity !== undefined && tile.building.getCapacity() > 0;
      });

      if (available !== false && Math.random() < 0.15){
        // On a 5% probability, create an immigrant
        GameLogic.createImmigrant(available);
      }
    },
    function(dt) {},
    function(dt) {}
  ]
};

GameLogic.population = 0;
GameLogic.updateNo = 0;
