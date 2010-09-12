function Tile(xy, type){
  // TODO: Allow for randomized images
  this.xy = xy;
  this.image = type.image;
  this.type = type;
  this.building = false;
  this.road = false;
}

Tile.prototype.setImage = function(what){
  this.image = what.image;
  this.type = what.type;
}

Tile.prototype.canBuild = function(){
  return !this.road && !this.building && this.type.buildable;
};

function Diamond(tiles, element){
  this.tiles = tiles;
  this.element = $(element);

  // queue building rendering so that it only happens once per cycle
  this.buildingRenderQueued = false;

  // this provides the basis for our isometric layout
  this.jhat = Math.floor(tiles[0][0].image.height / 2);
  this.ihat = tiles[0][0].image.width / 2;

  // maximum size of the display port
  this.maxWidth = 800;
  this.maxHeight = 600;

  // set the canvas size to contain the tiles
  this.setCanvasSize(
    this.jhat * (this.tiles[0].length + this.tiles.length + 1),
    this.ihat * (this.tiles[0].length + this.tiles.length));

  this.context = this.element.get(0).getContext("2d");

  // this is the scroll offset representing the top-left point of the visible region
  this.anchor = {left: 0, top: 0};

  // isometric width/height in tiles
  this.width = tiles[0].length;
  this.height = tiles.length;

  this.base = (this.jhat + 1) * this.width;

  // normal width/height in pixels
  this.backgroundSize = {
    width: this.width * this.ihat * 2,
    height: this.base + this.height * (this.jhat + 1)
  };
  
  // an image that hovers over the canvas
  this.hover = {pos: false, image: false, offsetY: 0};

  // a surface to contain the terrain information
  this.renderTerrain();
  this.renderRoads();
  this._renderBuildings();
}

Diamond.prototype.render = function(){
  this.context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  if (this.buildingRenderQueued){
    this._renderBuildings();
  }

  //pass 1 - draw terrain, roads and buildings
  this.renderLayer(this.terrainSurface);
  this.renderLayer(this.roadSurface);
  this.renderLayer(this.buildingSurface);

  var sprites = Game.getPeople();

  var sprite, coords, offsetX, offsetY;
  for (var i = 0; i < sprites.length; i++){
    sprite = sprites[i];
    if (sprite.shouldDisplay()){
      coords = this.toScreenCoords(sprite.getLocation());

      // adjust so that the bottom of the sprite appears on the tile
      offsetX = this.ihat - sprite.sprite.image.width / 2;
      offsetY = this.jhat - sprite.sprite.image.height;
      this.context.drawImage(sprite.sprite.image, coords[0] + offsetX, coords[1] + offsetY);
    }
  }

  // draw overlay
  this.colourHover();
  if (this.hoverSurface){
    this.renderLayer(this.hoverSurface);
  }
};

Diamond.prototype.renderLayer = function(surface){
  this.context.drawImage(surface,
    this.anchor.left, this.anchor.top, this.canvasSize.width, this.canvasSize.height,
    0, 0, this.canvasSize.width, this.canvasSize.height);

}

Diamond.prototype.renderTile = function(xy){
  var coords = this.toScreenCoords(xy);
  this.context.drawImage(this.tiles[xy[1]][xy[0]].image, coords[0], coords[1]);

  if (this.tiles[xy[1]][xy[0]].building){
    this.context.drawImage(this.tiles[xy[1]][xy[0]].building.image.image, coords[0], coords[1]);
  }
};

Diamond.prototype.renderTerrain = function(){
  if (!this.terrainSurface){
    this.terrainSurface = Common.createHiddenSurface(this.backgroundSize.width, this.backgroundSize.height);
  }
  var context = this.terrainSurface.getContext("2d");

  context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  var coords, type;

  for (var y = 0; y < this.tiles.length; y++){
    for (var x = this.tiles[y].length - 1; x >= 0; x--){
      coords = this.toScreenCoords([x, y], false);
      context.drawImage(this.tiles[y][x].image, coords[0], coords[1]);
      currentType = this.tiles[y][x].type.type;

      // draw corners
      if (y > 0){
        if (x > 0){
          //check top left
          if ((type = this.tiles[y - 1][x].type) == this.tiles[y][x - 1].type && type.type != currentType){
            context.drawImage(type.image_tl, coords[0], coords[1]);
          }
        }
        if(x < this.width - 1){
          //check top right
          if ((type = this.tiles[y - 1][x].type) == this.tiles[y][x + 1].type && type.type != currentType){
            context.drawImage(type.image_tr, coords[0], coords[1]);
          }
        }
      }
      if (y < this.height - 1){
        // TODO: See if image flipping works later on
        if (x > 0){
          //check bottom left
          if ((type = this.tiles[y + 1][x].type) == this.tiles[y][x - 1].type && type.type != currentType){
            context.drawImage(type.image_bl, coords[0], coords[1]);
          }
        }
        if(x < this.width - 1){
          //check bottom right
          if ((type = this.tiles[y + 1][x].type) == this.tiles[y][x + 1].type && type.type != currentType){
            context.drawImage(type.image_br, coords[0], coords[1]);
          }
        }
      }
    }
  }
};

Diamond.prototype.renderRoads = function(){
  if (!this.roadSurface){
    this.roadSurface = Common.createHiddenSurface(this.backgroundSize.width, this.backgroundSize.height);
  }
  var context = this.roadSurface.getContext("2d");

  context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  for (var y = 0; y < this.tiles.length; y++){
    for (var x = 0; x < this.tiles[y].length; x++){
      if (this.tiles[y][x].road){
        this.drawRoad(context, [x, y]);
      }
    }
  }
};

Diamond.prototype.drawRoad = function(context, xy){
  var y = xy[1];
  var x = xy[0];

  // grab nearby tiles to see if we need to render extra roads
  var nearby = {
    left:   (x > 0 ? this.tiles[y][x - 1].road || this.isHoverRoad(x - 1, y) : false),
    right:  ((y > 0 && y < this.tiles.length && x < this.tiles[y].length - 1) ?
              this.tiles[y][x + 1].road || this.isHoverRoad(x + 1, y) : false),
    top:    (y > 0 ? this.tiles[y - 1][x].road || this.isHoverRoad(x, y - 1) : false),
    bottom: (y < this.tiles.length - 1 ? this.tiles[y + 1][x].road || this.isHoverRoad(x, y + 1) : false),
  }
  var coords = this.toScreenCoords([x, y], false);

  context.drawImage(Resources.images.road.image, coords[0], coords[1]);

  if (nearby.left){
    context.drawImage(Resources.images.road_bl.image, coords[0], coords[1]);
  }
  if (nearby.top){
    context.drawImage(Resources.images.road_tl.image, coords[0], coords[1]);
  }
  if (nearby.right){
    context.drawImage(Resources.images.road_tr.image, coords[0], coords[1]);
  }
  if (nearby.bottom){
    context.drawImage(Resources.images.road_br.image, coords[0], coords[1]);
  }
};

Diamond.prototype.renderBuildings = function(){
  this.buildingRenderQueued = true;
};

Diamond.prototype._renderBuildings = function(){
  if (!this.buildingSurface){
    this.buildingSurface = Common.createHiddenSurface(this.backgroundSize.width, this.backgroundSize.height);
  }
  var context = this.buildingSurface.getContext("2d");

  context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  var coords;

  var buildings = Game.getBuildingsByZOrder();
  for (var i = 0; i < buildings.length; i++){
    buildings[i].render(this, context);
  }
  this.buildingRenderQueued = false;
}

Diamond.prototype.toWorldCoords = function(xy){
  // convert from screen coordinates on the canvas to a world tile
  // first offset to where the (0,0) point is in world space (at the tip
  // of the rightmost tile)
  var y = xy[1] - this.base + this.jhat + this.anchor.top;
  var x = xy[0] + this.anchor.left;

  // now convert x,y to the isometric basis
  return [
    Math.round(x / 2.0 / this.ihat - y / (2 * this.jhat + 2)),
    Math.round(x / 2.0 / this.ihat + y / (2 * this.jhat + 2)) - 1
  ];
};

Diamond.prototype.toScreenCoords = function(xy, include_anchor){
  // convert from world coordinates back to screen coordinates
  // if include_anchor is true or not specified, then add the anchor.
  // Offscreen surfaces don't use the anchor.
  if (include_anchor === undefined){
    include_anchor = true;
  }
  // convert x,y to the standard basis
  return [
    Math.round(xy[1] * this.ihat + xy[0] * this.ihat - (include_anchor ? this.anchor.left : 0)),
    Math.round(this.base + xy[1] * (this.jhat + 1)
      - xy[0] * (this.jhat + 1) - this.ihat / 2 - (include_anchor ? this.anchor.top : 0))
  ];
}

Diamond.prototype.setCanvasSize = function(height, width){
  if (height > this.maxHeight){
    height = this.maxHeight;
  }
  if (width > this.maxWidth){
    width = this.maxWidth;
  }
  this.canvasSize = {width: width, height: height};
};

Diamond.prototype.scroll = function(dx, dy){
  this.anchor.left = Math.max(Math.min(this.anchor.left + dx, this.backgroundSize.width  - this.canvasSize.width ), 0);
  this.anchor.top  = Math.max(Math.min(this.anchor.top  + dy, this.backgroundSize.height - this.canvasSize.height), 0);
  this.render();
};

Diamond.prototype.setHover = function(xy, object, object_height){
  if (object_height === undefined){
    object_height = 1;
  }
  if (this.hover.pos !== false){
    this.colourHover(true);
  }
  if (xy !== false && xy !== undefined){
    this.hover.pos = xy;

    if (typeof(object) == "string"){
      this.hover.image = Resources.images[object].image;
      this.hover.offsetY = -this.jhat * (object_height - 1);
    }else{
      this.hover.image = object.image.image;
      this.hover.offsetY = -this.jhat * (object.height - 1) - object.yOffset;
    }
    this.colourHover();
  }else{
    this.hover.offsetY = 0;
    this.hover.pos = false;
    this.hover.image = false;
  }
};

Diamond.prototype.setHoverRoad = function(start, end){
  if (!this.hoverSurface){
    this.hoverSurface = Common.createHiddenSurface(this.backgroundSize.width, this.backgroundSize.height);
  }
  var context = this.buildingSurface.getContext("2d");

  context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  this._renderBuildings();

  if (start !== undefined && end !== undefined){
    this.hoverRoad = { start: start, end: end };

    var renderer = this;

    this.renderRoads();
    Game.roadSegment(start, end, function(tile, nearby){
      renderer.drawRoad(context, tile.xy, nearby);
    });
  }else{
    this.hoverRoad = false;
  }
};

Diamond.prototype.isHoverRoad = function(x, y){
  if (this.hoverRoad === false){
    return false;
  }

  var lowerY = Math.min(this.hoverRoad.start[1], this.hoverRoad.end[1]);
  var higherY = Math.max(this.hoverRoad.start[1], this.hoverRoad.end[1]);
  var lowerX = Math.min(this.hoverRoad.start[0], this.hoverRoad.end[0]);
  var higherX = Math.max(this.hoverRoad.start[0], this.hoverRoad.end[0]);


  return (x == this.hoverRoad.start[0] && y <= higherY && y >= lowerY) ||
    (y == this.hoverRoad.end[1] && x <= higherX && x >= lowerX);
};

Diamond.prototype.setHoverPlots = function(start, end){
  if (!this.hoverSurface){
    this.hoverSurface = Common.createHiddenSurface(this.backgroundSize.width, this.backgroundSize.height);
  }
  var context = this.hoverSurface.getContext("2d");

  context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  if (start !== undefined && end !== undefined){
    var renderer = this;
    Game.houseBlock(start, end, function(tile){
      if (tile.canBuild()){
        var coords = renderer.toScreenCoords(tile.xy, false);
        context.drawImage(Resources.images.plot.image, coords[0], coords[1]);
      }
    });
  }
};

Diamond.prototype.colourHover = function(clear){
  if (this.inBounds(this.hover.pos)){
    if (clear){
      this.renderTile(this.hover.pos);
    }else{
      var coords = this.toScreenCoords(this.hover.pos);
      this.context.drawImage(this.hover.image, coords[0], coords[1] + this.hover.offsetY);
    }
  }
};

Diamond.prototype.inBounds = function(xy){
  return xy[0] >= 0 && xy[0] < this.width && xy[1] >= 0 && xy[1] < this.height;
};
