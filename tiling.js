function Tile(x, y, image, type){
  this.x = x;
  this.y = y;
  this.image = image;
  this.type = type;
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
}

Diamond.prototype.render = function(){
  if (!this.loaded){
    this.setCanvasSize(
      this.jhat * (this.tiles[0].length + this.tiles.length + 1) + 1,
      this.ihat * (this.tiles[0].length + this.tiles.length));
    this.loaded = true;
  }

  this.context.fillStyle = "rgb(255, 255, 255)";
  this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

  // draw hover box
  if (this.hover !== false){
    var coords = this.toScreenCoords(this.hover[0], this.hover[1]);
    this.context.save();
    this.context.globalCompositeOperation = "source-atop";
    this.context.fillStyle = "rgba(255, 0, 0, 1)";
    this.context.fillRect(coords[0], coords[1], this.ihat * 2, this.jhat * 2);
    this.context.restore();
  }

  var draw;
  for (var y = this.tiles.length - 1; y >= 0; y--){
    for (var x = this.tiles[y].length - 1; x >= 0; x--){
      draw = this.toScreenCoords(x, y);

      // render if tile is visible
      if (draw[1] < this.canvasSize.height && draw[1] + this.jhat * 2 >= 0 &&
          draw[0] < this.canvasSize.width  && draw[0] + this.ihat * 2 >= 0){
        if (this.hover !== false && x == this.hover[0] && y == this.hover[1]){
          this.globalCompositeOperation = "lighter";
        }else{
          this.globalCompositeOperation = "source-atop";
        }
        this.context.drawImage(this.tiles[y][x].image, draw[0], draw[1]);
      }

    }
  }
};

Diamond.prototype.renderTile = function(x, y){
  var coords = this.toScreenCoords(x, y);
  this.context.drawImage(this.tiles[y][x].image, coords[0], coords[1]);
};

Diamond.prototype.toWorldCoords = function(x, y){
  y -= this.base - this.jhat - this.anchor.top;
  x += this.anchor.left;

  return [
    Math.round(x / 2.0 / this.ihat - y / 2.0 / this.jhat),
    Math.round(x / 2.0 / this.ihat + y / 2.0 / this.jhat) - 1
  ];
};

Diamond.prototype.toScreenCoords = function(x, y){
  return [
    y * this.ihat + x * this.ihat - this.anchor.left,
    this.base + y * this.jhat - x * this.jhat - this.ihat / 2 - this.anchor.top
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

Diamond.prototype.setHover = function(x, y){
  if (x !== false && x !== undefined){
    this.hover = this.toWorldCoords(x, y);
  }else{
    this.hover = false;
  }
};
