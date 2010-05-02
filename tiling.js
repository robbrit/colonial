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
  this.ihat = Math.floor(tiles[0][0].image.width / 2);
  this.base = this.jhat * tiles[0].length;
  this.context = this.element.get(0).getContext("2d");

  this.anchor = {left: 0, top: 0};

  this.width = tiles[0].length * this.ihat * 2;
  this.height = tiles.length * this.jhat * 2;

  this.maxWidth = 800;
  this.maxHeight = 600;

  this.hover = false;
  this.hoverImage = new Image();
  this.hoverImage.src = "images/util/hover.png";
}

Diamond.prototype.render = function(area){
  if (!this.loaded){
    this.setCanvasSize(
      this.jhat * (this.tiles[0].length + this.tiles.length + 1) + 1,
      this.ihat * (this.tiles[0].length + this.tiles.length));
    this.loaded = true;
  }

  if (area === undefined){
    area = [0, 0, this.tiles.length, this.tiles[0].length];

    this.context.fillStyle = "rgb(255, 255, 255)";
    this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
  }else{
    if (area[0] < 0){
      area[0] = 0;
    }
    if (area[2] > this.tiles[0].length){
      area[2] = this.tiles[0].length;
    }
    if (area[1] < 0){
      area[1] = 0;
    }
    if (area[3] > this.tiles.length){
      area[3] = this.tiles.length;
    }
  }

  var coords;

  // pass 1 - draw terrain
  for (var y = area[1]; y < area[3]; y++){
    for (var x = area[0]; x < area[2]; x++){
      coords = this.toScreenCoords([x, y]);
      this.context.drawImage(this.tiles[y][x].image, coords[0], coords[1]);
    }
  }

  //pass 2 - draw buildings
  for (var y = area[1]; y < area[3]; y++){
    for (var x = area[0]; x < area[2]; x++){
      coords = this.toScreenCoords([x, y]);
      if (this.tiles[y][x].building){
        this.context.drawImage(this.tiles[y][x].building.image, coords[0], coords[1]);
      }
    }
  }
  // draw hover box
  if (this.hover !== false){
    this.colourHover();
  }
};

Diamond.prototype.renderTile = function(xy){
  var coords = this.toScreenCoords(xy);
  this.context.drawImage(this.tiles[xy[1]][xy[0]].image, coords[0], coords[1]);
};

Diamond.prototype.toWorldCoords = function(xy){
  var y = xy[1] - (this.base - this.jhat - this.anchor.top);
  var x = xy[0] + this.anchor.left;

  return [
    Math.round(x / 2.0 / this.ihat - y / 2.0 / this.jhat),
    Math.round(x / 2.0 / this.ihat + y / 2.0 / this.jhat) - 1
  ];
};

Diamond.prototype.toScreenCoords = function(xy){
  return [
    xy[1] * this.ihat + xy[0] * this.ihat - this.anchor.left,
    this.base + xy[1] * this.jhat - xy[0] * this.jhat - this.ihat / 2 - this.anchor.top
  ];
}

Diamond.prototype.setCanvasSize = function(height, width){
  this.height = height;
  this.width = width;
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
  this.anchor.left = Math.max(Math.min(this.anchor.left + dx, this.width  - this.canvasSize.width ), 0);
  this.anchor.top  = Math.max(Math.min(this.anchor.top  + dy, this.height - this.canvasSize.height), 0);
  this.render();
};

Diamond.prototype.setHover = function(xy){
  var lastHover;
  // cover up last hover spot
  if (this.hover !== false){
    this.colourHover(true);
  }
  if (xy !== false && xy !== undefined){
    this.hover = this.toWorldCoords(xy);
    lastHover = this.hover;
  }else{
    lastHover = this.hover;
    this.hover = false;
  }
  // TODO: If the mouse moves too fast, this causes tearing - need to fix
  this.render([lastHover[0] - 3, lastHover[1] - 3, lastHover[0] + 4, lastHover[1] + 4]);
};

Diamond.prototype.colourHover = function(clear){
  var coords = this.toScreenCoords(this.hover);
  this.context.save();
  if (clear){
    this.context.globalCompositeOperation = "source-atop";
    this.context.fillStyle = "rgb(255, 255, 255)";
    this.context.fillRect(coords[0], coords[1], this.ihat * 3, this.jhat * 3);
  }else{
    this.context.drawImage(this.hoverImage, coords[0], coords[1]);
  }
  this.context.restore();
};
