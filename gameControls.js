Game.Controls = {
  onClick: function(ev){
    if (Game.building && Game.building != "road"){
      // TODO: add money
      // TODO: allow dragging for road construction
      var coords = Game.display.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));
      if (Game.inBounds(coords)){
        var tile = Game.tiles[coords[1]][coords[0]];
        if (tile.canBuild()){
          /*if (Game.building == "road"){
            tile.road = true;
            Game.display.tiler.renderRoads();
          }else{*/
            tile.building = Game.building;
            tile.building.placed(coords);
            Game.buildings.push(Game.building);
            Game.building = new Buildings[Game.buildingType]();
            Game.display.tiler.renderBuildings();
          //}
        }
      }
    }
  },

  mouseDown: function(ev){
    Game.Controls.isMouseDown = true;
  },
  mouseUp: function(ev){
    Game.Controls.isMouseDown = false;

    if (Game.building == "road"){
      Game.Controls.placeRoad(ev);
    }
  },

  mouseMove: function(ev){
    if (Game.building == "road"){
      // TODO: moving the mouse shouldn't actually place the road, it should just draw it
      //       unclicking the mouse will place the road
      if (Game.Controls.isMouseDown){
        Game.Controls.placeRoad(ev);
      }else{
        var coords = Game.display.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));

        if (Game.inBounds(coords)){
          var tile = Game.tiles[coords[1]][coords[0]];
          if (tile.canBuild){
            Game.display.tiler.setHover(coords, Game.building);
          }else{
            Game.display.tiler.setHover(coords, "redHover_1_1");
          }
        }
      }
    }else if (Game.building){
      var coords = Game.display.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));

      var width = (Game.building == "road" ? 1 : Game.building.width);
      var height = (Game.building == "road" ? 1 : Game.building.height);

      var canPlace = true;
      for (var y = 0; y < width; y++){
        for (var x = 0; x < height; x++){
          if (Game.inBounds([coords[0] + x, coords[1] + y])){
            var tile = Game.tiles[coords[1] + y][coords[0] + x];
            if (!tile.canBuild()){
              canPlace = false;
              break;
            }
          }
        }
        if (!canPlace){
          break;
        }
      }
      if (canPlace){
        Game.display.tiler.setHover(coords, Game.building);
      }else{
        Game.display.tiler.setHover(coords, "redHover_" + width + "_" + height);
      }
    }
  },

  mouseOut: function(ev){
    if (Game.building){
      Game.display.tiler.setHover();
    }
  },

  keyDown: function(ev){
    Game.Controls.keys[ev.keyCode] = true;
  },
  keyUp: function(ev){
    Game.Controls.keys[ev.keyCode] = false;
  },

  update: function(){
    if (Game.Controls.keys[38]){ // up
      Game.display.scroll(0, -Common.scrollSpeed);
    }else if (Game.Controls.keys[39]){ // right
      Game.display.scroll(Common.scrollSpeed, 0);
    }else if (Game.Controls.keys[40]){ // down
      Game.display.scroll(0, Common.scrollSpeed);
    }else if (Game.Controls.keys[37]){ // left
      Game.display.scroll(-Common.scrollSpeed, 0);
    }
  },

  selectBuilding: function(what){
    if (what == "road"){
      Game.building = Game.buildingType = "road";
    }else{
      Game.building = new Buildings[what]();
      Game.buildingType = what;
    }
  },

  placeRoad: function(ev){
    var coords = Game.display.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));
    if (Game.inBounds(coords)){
      var tile = Game.tiles[coords[1]][coords[0]];
      if (tile.canBuild()){
        tile.road = true;
        Game.display.tiler.renderRoads();
      }
    }
  },

  keys: {},
  isMouseDown: false
}

$(document)
  .keyup(Game.Controls.keyUp)
  .keydown(Game.Controls.keyDown);

$(function(){
  $("#main-canvas")
    .mousedown(Game.Controls.mouseDown)
    .mouseup(Game.Controls.mouseUp)
    .mousemove(Game.Controls.mouseMove)
    .mouseout(Game.Controls.mouseOut)
    .click(Game.Controls.onClick);
});
