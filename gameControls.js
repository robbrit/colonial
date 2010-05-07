Game.Controls = {
  onClick: function(ev){
    if (Game.building){
      // TODO: allow dragging for road construction
      var coords = Game.display.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));
      if (Game.inBounds(coords)){
        var tile = Game.tiles[coords[1]][coords[0]];
        if (tile && tile.type.buildable){
          tile.building = Game.building;
          tile.building.placed(coords);
          Game.buildings.push(Game.building);
          Game.building = new Buildings[Game.buildingType]();
          Game.display.tiler.renderBuildings();
        }
      }
    }
  },

  mouseMove: function(ev){
    if (Game.building){
      var coords = Game.display.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));

      var canPlace = true;
      for (var y = 0; y < Game.building.width; y++){
        for (var x = 0; x < Game.building.height; x++){
          if (Game.inBounds([coords[0] + x, coords[1] + y])){
            var tile = Game.tiles[coords[1] + y][coords[0] + x];
            if (tile.building || !tile.type.buildable){
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
        Game.display.tiler.setHover(coords, Game.building.image);
      }else{
        Game.display.tiler.setHover(coords, Resources.images["redHover_" + Game.building.width +
          "_" + Game.building.height]);
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
    Game.building = new Buildings[what]();
    Game.buildingType = what;
  },

  keys: {}
}

$(document)
  .keyup(Game.Controls.keyUp)
  .keydown(Game.Controls.keyDown);

$(function(){
  $("#main-canvas")
    .click(Game.Controls.onClick)
    .mousemove(Game.Controls.mouseMove)
    .mouseout(Game.Controls.mouseOut);
});
