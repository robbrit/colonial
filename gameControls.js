Game.Controls = {
  onClick: function(ev){
    if (Game.building){
      // TODO: allow dragging for road construction
      var coords = Game.display.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));
      if (Game.inBounds(coords)){
        var tile = Game.tiles[coords[1]][coords[0]];
        if (tile && tile.type.buildable){
          tile.building = Game.building;
          Game.building = new Game.building.constructor();
          Game.display.tiler.renderBuildings();
        }
      }
    }
  },

  mouseMove: function(ev){
    if (Game.building){
      var coords = Game.display.tiler.toWorldCoords(Game.canvasCoords([ev.clientX, ev.clientY]));

      if (Game.inBounds(coords)){
        var tile = Game.tiles[coords[1]][coords[0]];
        if (tile.building || !tile.type.buildable){
          Game.display.tiler.setHover(coords, Resources.images.redHover);
        }else{
          Game.display.tiler.setHover(coords, Game.building.image);
        }
      }
    }
  },

  mouseOut: function(ev){
    if (Game.building){
      Game.display.tiler.setHover();
    }
  },

  selectBuilding: function(what){
    Game.building = new Buildings[what]();
  }
}

$(document)
  .keypress(function(ev){
    if (ev.keyCode == 38){ // up
      Game.display.scroll(0, -Common.scrollSpeed);
    }else if (ev.keyCode == 39){ // right
      Game.display.scroll(Common.scrollSpeed, 0);
    }else if (ev.keyCode == 40){ // down
      Game.display.scroll(0, Common.scrollSpeed);
    }else if (ev.keyCode == 37){ // left
      Game.display.scroll(-Common.scrollSpeed, 0);
    }
  });

$(function(){
  $("#main-canvas")
    .click(Game.Controls.onClick)
    .mousemove(Game.Controls.mouseMove)
    .mouseout(Game.Controls.mouseOut);
});
