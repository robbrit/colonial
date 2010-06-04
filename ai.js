var AI = {
  AStar: function(criterion){
    return function(who, start, end){
      // a function for expanding a certain node
      var expand = function(node){
        var res = new Array();
        for (var i = -1; i <= 1; i++){
          for (var j = -1; j <= 1; j++){
            var next = [node[0] + i, node[1] + j];
            if ((i != 0 || j != 0) && Game.inBounds(next) && criterion(next)){
              res.push(next);
            }
          }
        }
        return res;
      };
      // distance travelled function
      var fFunc = function(node){
        return Math.abs(node[0] - start[0]) + Math.abs(node[1] - start[1]);
      }
      // distance to goal function
      var gFunc = function(node){
        // use Manhattan distance
        return Math.abs(node[0] - end[0]) + Math.abs(node[1] - end[1]);
      }

      var toExpand = [ [start, [] ] ];
      var visited = new Array();

      var current, neighbours, path;
      while (toExpand.length > 0){
        current = toExpand.shift();
        if (current[0][0] == end[0] && current[0][1] == end[1]){
          current[1].push(end);
          return current[1];
        }

        neighbours = expand(current[0]);

        for (var i = 0; i < neighbours.length; i++){
          var seenIt = false;
          for (var j = 0; j < visited.length; j++){
            if (visited[j][0] == neighbours[i][0] && visited[j][1] == neighbours[i][1]){
              seenIt = true;
              break;
            }
          }
          if (!seenIt){
            for (var j = 0; j < toExpand.length; j++){
              if (toExpand[j][0][0] == neighbours[i][0] && toExpand[j][0][1] == neighbours[i][1]){
                seenIt = true;
                break;
              }
            }
          }

          if (!seenIt){
            toExpand.push([neighbours[i], current[1].concat([current[0]])]);
          }
        }

        // TODO: Change this to a binary heap to speed this part up a bit
        toExpand.sort(function(a, b){
          return (fFunc(a[0]) + gFunc(a[0])) - (fFunc(b[0]) + gFunc(b[0]));
        });

        visited.push(current[0]);
      }
      return false;
    };
  }
};

// This version of A* allows passable tiles
AI.GlobalAStar = AI.AStar(function(xy) {
  return Game.getTile(xy).type.passable === true;
});
AI.RoadAStar = AI.AStar(function(xy){
  return Game.getTile(xy).road === true;
});
