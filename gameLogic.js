var GameLogic = {
  createImmigrant: function(target){
    var immigrant = new Immigrant([0, 0], target);
    Game.addPerson(immigrant);
    target.building.addPerson(immigrant);
  },

  addPerson: function(person){
    // people added this way don't count toward population
    Game.addPerson(person);
  },

  immigrantArrived: function(person){
    GameLogic.population++;
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
      var available = false;
      for (var i = 0; i < Game.buildings.length; i++){
        if (Game.buildings[i].getCapacity !== undefined && Game.buildings[i].getCapacity() > 0){
          available = Game.buildings[i].location;
          available = Game.tiles[available[1]][available[0]];
          break;
        }
      }

      if (available !== false && Math.random() < 0.05){
        // On a 5% probability, create an immigrant
        GameLogic.createImmigrant(available);
      }
    },
    function(dt) {
      // compute info variables
      $("#info-population").html(Math.round(GameLogic.population * GameLogic.employablePct));

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
GameLogic.employablePct = 1; // TODO: change job-seeker behaviour to take this into account
