var AI = {
  AStar: function(start, end){
    // a function for expanding a certain node
    var expand = function(node){
      var res = new Array();
      for (var i = -1; i <= 1; i++){
        for (var j = -1; j <= 1; j++){
          if (i != 0 || j != 0){
            res.push([node[0] + i, node[1] + j]);
          }
        }
      }
      return res;
    };
    // distance travelled function
    var fFunc = function(node){
      return Math.abs(node[0] - start[0]) + Math.abs(node[0] - start[0]);
    }
    // distance to goal function
    var gFunc = function(node){
      // use Manhattan distance
      return Math.abs(node[0] - end[0]) + Math.abs(node[1] - end[1]);
    }

    var toExpand = [ [start, [] ] ];
    var visited = new Array();

    var current, neighbours, path;
    while (toExpand[0][0][0] != end[0] || toExpand[0][0][1] != end[1]){
      current = toExpand.shift();
      visited.push(current[0]);

      neighbours = expand(current[0]);

      for (var i = 0; i < neighbours.length; i++){
        var visited = false;
        for (var j = 0; j < visited.length; j++){
          if (visited[j][0] == neighbours[i][0] && visited[j][1] == neighbours[i][1]){
            visited = true;
            break;
          }
        }

        if (!visited){
          toExpand.push([neighbours[i], Array.concat(current[1], [current[0]])]);
        }
      }

      toExpand.sort(function(a, b){
        return (fFunc(a) + gFunc(a)) - (fFunc(b) + gFunc(b));
      });
    }
    return toExpand[0][1];
  }
};
