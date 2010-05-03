Game.Controls = {
  onClick: function(ev){
    if (Game.building){
      // TODO: allow dragging for road construction
      var coords = Game.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));
      if (Game.tiler.inBounds(coords)){
        var tile = Game.tiles[coords[1]][coords[0]];
        if (tile && tile.type.buildable){
          tile.building = Game.building;
          Game.tiler.renderBuildings();
        }
      }
    }
  },

  mouseMove: function(ev){
    if (Game.building){
      var coords = Game.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));

      if (Game.tiler.inBounds(coords)){
        var tile = Game.tiles[coords[1]][coords[0]];
        if (tile.building || !tile.type.buildable){
          Game.tiler.setHover(coords, Game.images.redHover);
        }else{
          Game.tiler.setHover(coords, Game.building);
        }
      }
    }
  },

  mouseOut: function(ev){
    if (Game.building){
      Game.tiler.setHover();
    }
  },

  selectBuilding: function(what){
    Game.building = Buildings[what];
  }
}

$(document)
  .keypress(function(ev){
    if (ev.keyCode == 38){ // up
      Game.tiler.scroll(0, -Common.scrollSpeed);
    }else if (ev.keyCode == 39){ // right
      Game.tiler.scroll(Common.scrollSpeed, 0);
    }else if (ev.keyCode == 40){ // down
      Game.tiler.scroll(0, Common.scrollSpeed);
    }else if (ev.keyCode == 37){ // left
      Game.tiler.scroll(-Common.scrollSpeed, 0);
    }
  });

$(function(){
  $("#main-canvas")
    .click(Game.Controls.onClick)
    .mousemove(Game.Controls.mouseMove)
    .mouseout(Game.Controls.mouseOut);
});
