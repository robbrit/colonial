function Tile(xy, type){
  // TODO: Allow for randomized images
  this.xy = xy;
  this.image = type.image;
  this.type = type;
  this.building = false;
}

Tile.prototype.setImage = function(what){
  this.image = what.image;
  this.type = what.type;
}

function Diamond(tiles, element){
  this.tiles = tiles;
  this.element = $(element);

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
  this.hover = {pos: false, image: false};

  // a surface to contain the terrain information
  this.renderTerrain();
  this.renderBuildings();
}

Diamond.prototype.render = function(){
  this.context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  //pass 1 - draw terrain
  this.renderLayer(this.terrainSurface);

  //pass 2 - draw buildings
  this.renderLayer(this.buildingSurface);

  //pass 3 - render sprites
  var sprites = Game.getSprites();

  var sprite, coords, offsetX, offsetY;
  for (var i = 0; i < sprites.length; i++){
    sprite = sprites[i];
    coords = this.toScreenCoords(sprite.getLocation());

    // adjust so that the bottom of the sprite appears on the tile
    offsetX = this.ihat - sprite.sprite.image.width / 2;
    offsetY = this.jhat - sprite.sprite.image.height;
    this.context.drawImage(sprite.sprite.image, coords[0] + offsetX, coords[1] + offsetY);
  }

  //pass 4 - draw overlay
  this.colourHover();
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

  var coords;

  for (var y = 0; y < this.tiles.length; y++){
    for (var x = this.tiles[y].length - 1; x >= 0; x--){
      coords = this.toScreenCoords([x, y], false);
      context.drawImage(this.tiles[y][x].image, coords[0], coords[1]);
    }
  }
};

Diamond.prototype.renderBuildings = function(){
  if (!this.buildingSurface){
    this.buildingSurface = Common.createHiddenSurface(this.backgroundSize.width, this.backgroundSize.height);
  }
  var context = this.buildingSurface.getContext("2d");

  context.fillStyle = "rgba(255, 255, 255, 0)";
  context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  var coords;

  for (var y = 0; y < this.tiles.length; y++){
    for (var x = this.tiles[y].length - 1; x >= 0; x--){
      coords = this.toScreenCoords([x, y], false);
      if (this.tiles[y][x].building){
        // TODO: some buildings are big
        context.drawImage(this.tiles[y][x].building.image.image, coords[0], coords[1]);
      }
    }
  }
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
  this.element.attr("height", height).attr("width", width);
};

Diamond.prototype.scroll = function(dx, dy){
  this.anchor.left = Math.max(Math.min(this.anchor.left + dx, this.backgroundSize.width  - this.canvasSize.width ), 0);
  this.anchor.top  = Math.max(Math.min(this.anchor.top  + dy, this.backgroundSize.height - this.canvasSize.height), 0);
  this.render();
};

Diamond.prototype.setHover = function(xy, image){
  if (this.hover.pos !== false){
    this.colourHover(true);
  }
  if (xy !== false && xy !== undefined){
    this.hover.pos = xy;
    this.hover.image = image.image;
    this.colourHover();
  }else{
    this.hover.pos = false;
    this.hover.image = false;
  }
};

Diamond.prototype.colourHover = function(clear){
  if (this.inBounds(this.hover.pos)){
    if (clear){
      this.renderTile(this.hover.pos);
    }else{
      var coords = this.toScreenCoords(this.hover.pos);
      this.context.drawImage(this.hover.image, coords[0], coords[1]);
    }
  }
};

Diamond.prototype.inBounds = function(xy){
  return xy[0] >= 0 && xy[0] < this.width && xy[1] >= 0 && xy[1] < this.height;
};
