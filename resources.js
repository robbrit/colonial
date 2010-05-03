var Resources = {
  images: {
    redHover: {
      file: "util/red-hover.png",
      image: new Image()
    }
  }
}
$(function(){
  for (var i in TileTypes){
    TileTypes[i].image.src = "images/tiles/" + TileTypes[i].file;
  }
  for (var i in Buildings){
    Buildings[i].image.src = "images/buildings/" + Buildings[i].file;
  }
  for (var i in Resources.images){
    Resources.images[i].image.src = "images/" + Resources.images[i].file;
  }
});
