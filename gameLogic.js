var GameLogic = {
  createImmigrant: function(target){
    var immigrant = new Immigrant([0, 0], target);
    GameLogic.population++;
    Game.addPerson(immigrant);
    target.building.addPerson(immigrant);
  },

  addPerson: function(person){
    // people added this way don't count toward population
    Game.addPerson(person);
  },
  
  update: function(dt){
    GameLogic.updateFuncs[GameLogic.updateNo++](dt);

    if (GameLogic.updateNo == GameLogic.updateFuncs.length){
      GameLogic.updateNo = 0;
    }
  },

  addJob: function(num){
    if (num === undefined){
      num = 1;
    }
    GameLogic.employed += num;
  },

  removeJob: function(num){
    if (num === undefined){
      num = 1;
    }
    GameLogic.employed -= num;
  },

  unemployment: function(){
    return GameLogic.population - GameLogic.employed;
  },

  // split up updateFuncs so that certain things aren't being called every frame
  updateFuncs: [
    function(dt){
      // count available housing
      // TODO: use a list for buildings and iterate over that instead of over every tile
      var available = Game.findTile(function(tile){
        return tile.building && tile.building.getCapacity !== undefined && tile.building.getCapacity() > 0;
      });

      if (available !== false && Math.random() < 0.05){
        // On a 5% probability, create an immigrant
        GameLogic.createImmigrant(available);
      }
    },
    function(dt) {
      // compute info variables
      $("#info-population").html(GameLogic.population);

      if (GameLogic.population > 0){
        $("#info-unemployment").html(Math.round(100 - GameLogic.employed / GameLogic.population * 100) + "%");
      }else{
        $("#info-unemployment").html("N/A");
      }
    },
    function(dt) {}
  ]
};

GameLogic.population = 0;
GameLogic.employed = 0;
GameLogic.updateNo = 0;
