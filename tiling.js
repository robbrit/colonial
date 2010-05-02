function Tile(xy, type){
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
  this.loaded = false;
  this.element = $(element);

  this.jhat = Math.floor(tiles[0][0].image.height / 2);
  this.ihat = tiles[0][0].image.width / 2;

  this.context = this.element.get(0).getContext("2d");

  this.anchor = {left: 0, top: 0};

  this.width = tiles[0].length;
  this.height = tiles.length;

  this.base = (this.jhat + 1) * this.width;

  this.canvasSize = {
    width: this.width * this.ihat * 2,
    height: this.base + this.height * (this.jhat + 1)
  };

  this.maxWidth = 800;
  this.maxHeight = 600;

  this.hover = {pos: false, image: false};
}

Diamond.prototype.render = function(){
  if (!this.loaded){
    this.setCanvasSize(
      this.jhat * (this.tiles[0].length + this.tiles.length + 1),
      this.ihat * (this.tiles[0].length + this.tiles.length));
    this.loaded = true;
  }

  this.context.fillStyle = "rgb(255, 255, 255)";
  this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  var coords;

  // pass 1 - draw terrain
  for (var y = 0; y < this.tiles.length; y++){
    for (var x = this.tiles[y].length - 1; x >= 0; x--){
      coords = this.toScreenCoords([x, y]);
      this.context.drawImage(this.tiles[y][x].image, coords[0], coords[1]);
    }
  }

  //pass 2 - draw buildings
  for (var y = 0; y < this.tiles.length; y++){
    for (var x = this.tiles[y].length - 1; x >= 0; x--){
      coords = this.toScreenCoords([x, y]);
      if (this.tiles[y][x].building){
        this.context.drawImage(this.tiles[y][x].building.image, coords[0], coords[1]);
      }
    }
  }
};

Diamond.prototype.renderTile = function(xy){
  var coords = this.toScreenCoords(xy);
  this.context.drawImage(this.tiles[xy[1]][xy[0]].image, coords[0], coords[1]);

  if (this.tiles[xy[1]][xy[0]].building){
    this.context.drawImage(this.tiles[xy[1]][xy[0]].building.image, coords[0], coords[1]);
  }
};

Diamond.prototype.toWorldCoords = function(xy){
  var y = xy[1] - (this.base - this.jhat - this.anchor.top);
  var x = xy[0] + this.anchor.left;

  return [
    Math.round(x / 2.0 / this.ihat - y / (2 * this.jhat + 2)),
    Math.round(x / 2.0 / this.ihat + y / (2 * this.jhat + 2)) - 1
  ];
};

Diamond.prototype.toScreenCoords = function(xy){
  return [
    xy[1] * this.ihat + xy[0] * this.ihat - this.anchor.left,
    this.base + xy[1] * (this.jhat + 1) - xy[0] * this.jhat - this.ihat / 2 - this.anchor.top - xy[0]
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
  this.anchor.left = Math.max(Math.min(this.anchor.left + dx, this.width  * this.ihat * 2 - this.canvasSize.width ), 0);
  this.anchor.top  = Math.max(Math.min(this.anchor.top  + dy, this.height * (this.jhat + 1) * 2 - this.canvasSize.height), 0);
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
