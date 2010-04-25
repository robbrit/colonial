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

    var jhat = Math.floor(tiles[0][0].image.height / 2);
    var ihat = Math.floor(tiles[0][0].image.width / 2);
    var base = jhat * tiles[0].length;
    var context = $("#main-canvas").get(0).getContext("2d");

    Tiler.setCanvasSize(jhat * (tiles[0].length + tiles.length + 1) + 1, ihat * (tiles[0].length + tiles.length));

    var cx, cy;
    for (var y = tiles.length - 1; y >= 0; y--){
      for (var x = tiles[y].length - 1; x >= 0; x--){
        cy = base + y * jhat - x * jhat - ihat / 2;
        cx = y * ihat + x * ihat;
        context.drawImage(tiles[y][x].image, cx, cy);
      }
    }
    context.moveTo(0, base);
    context.lineTo(ihat * tiles[0].length + jhat * tiles.length, base + jhat * tiles.length);
    context.strokeStyle = "#00F";
    context.stroke();
  },

  toWorldCoords: function(x, y){
    var jhat = Math.floor(this.tiles[0][0].image.height / 2);
    var ihat = Math.floor(this.tiles[0][0].image.width / 2);
    var base = jhat * this.tiles[0].length;

    y -= base - jhat;

    return [
      Math.round(x / 2.0 / ihat - y / 2.0 / jhat),
      Math.round(x / 2.0 / ihat + y / 2.0 / jhat) - 1
    ];
  }
};

var Tiler = {
  setCanvasSize: function(height, width){
    $("#main-canvas").attr("height", height).attr("width", width);
  }
}
