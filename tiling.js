function Tile(x, y, image){
  this.x = x;
  this.y = y;
  this.image = image;
}

/*var Zigzag = {
  isometric: function(tiles){
    var mapHeight = tiles.length;
    var mapWidth = tiles[0].length;

    var height = tiles[0][0].image.height;
    var width = tiles[0][0].image.width;
    var vert_offset = Math.ceil(height / 2);
    var horz_offset = Math.floor(width / 2);

    if ((mapHeight & 1) == 0){
      Tiler.setCanvasSize(mapHeight / 2 * height - vert_offset, (mapWidth - 1) * width);
    }else{
      Tiler.setCanvasSize(mapHeight / 2 * height, (mapWidth - 1) * width);
    }

    var context = $("#main-canvas").get(0).getContext("2d");

    var cx, cy;
    for (var y = tiles.length - 1; y >= 0; y--){
      for (var x = tiles[y].length - 1; x >= 0; x--){
        if ((y & 1) == 0){
          cy = y / 2 * height;
          cx = x * width;
        }else{
          cy = (y - 1) / 2 * height + vert_offset;
          cx = x * width + horz_offset;
        }
        context.drawImage(tiles[y][x].image, cx - horz_offset, cy - vert_offset);
      }
    }
  },

  toWorldCoords: function(x, y){
  }
};*/

var Diamond = {
  isometric: function(tiles){
    this.tiles = tiles;

    this.jhat = Math.floor(tiles[0][0].image.height / 2);
    this.ihat = Math.floor(tiles[0][0].image.width / 2);
    this.base = this.jhat * tiles[0].length;
    this.context = $("#main-canvas").get(0).getContext("2d");

    if (!this.loaded){
      Tiler.setCanvasSize(this.jhat * (tiles[0].length + tiles.length + 1) + 1, this.ihat * (tiles[0].length + tiles.length));
      this.loaded = true;
    }

    var cx, cy;
    for (var y = tiles.length - 1; y >= 0; y--){
      for (var x = tiles[y].length - 1; x >= 0; x--){
        cy = this.base + y * this.jhat - x * this.jhat - this.ihat / 2;
        cx = y * this.ihat + x * this.ihat;
        this.context.drawImage(tiles[y][x].image, cx, cy);
      }
    }
  },

  renderTile: function(x, y){
    this.context.drawImage(tiles[y][x].image,
      y * this.ihat + x * this.ihat,
      this.base + y * this.jhat - x * this.jhat - this.ihat / 2
    );
  },

  toWorldCoords: function(x, y){
    y -= this.base - this.jhat;

    return [
      Math.round(x / 2.0 / this.ihat - y / 2.0 / this.jhat),
      Math.round(x / 2.0 / this.ihat + y / 2.0 / this.jhat) - 1
    ];
  },

  isometricLines: function(){
    this.context.strokeStyle = "#000";
    var width = this.tiles[0].length;
    var height = this.tiles.length;
    var tileWidth = tiles[0][0].image.width;
    var tileHeight = tiles[0][0].image.height;

    if (!this.loaded){
      Tiler.setCanvasSize(this.jhat * (width + height + 1) + 1, this.ihat * (width + height));
      this.loaded = true;
    }

    var cy1, cy2, cx1, cx2;
    for (var i = 0; i <= width; i++){
      cy1 = this.base - i * this.jhat;
      cy2 = this.base + height * this.jhat - i * this.jhat;
      cx1 = i * this.ihat;
      cx2 = height * this.ihat + i * this.ihat;
      this.context.moveTo(cx1, cy1);
      this.context.lineTo(cx2, cy2);
      this.context.stroke();
    }
    for (var i = 0; i <= width; i++){
      cy1 = this.base + i * this.jhat;
      cx1 = i * this.ihat;
      cy2 = this.base + i * this.jhat - width * this.jhat;
      cx2 = i * this.ihat + width * this.ihat;
      this.context.moveTo(cx1, cy1);
      this.context.lineTo(cx2, cy2);
      this.context.stroke();
    }
  }
};

var Tiler = {
  setCanvasSize: function(height, width){
    $("#main-canvas").attr("height", height).attr("width", width);
  }
}
