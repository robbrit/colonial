function Display(tiles){
  this.tiler = new Diamond(tiles, "#main-canvas");
}

Display.prototype.render = function(){
  this.tiler.render();
  this.renderMessages(Game.getMessages());
};

Display.prototype.renderMessages = function(messages){
  // render messages
  var messageHeight = 20;
  var baseY = 10;

  this.tiler.context.save();
  this.tiler.context.strokeStyle = "rgb(0, 0, 0)";
  this.tiler.context.font = "Helvetica";
  //this.tiler.context.textAlign = "center";

  var width, baseX;
  for (var i = 0; i < messages.length; i++){
    this.tiler.context.fillStyle = "rgb(255, 255, 255)";
    width = this.tiler.context.measureText(messages[i]).width;
    baseX = (this.tiler.element.width() - width) / 2;
    this.tiler.context.fillRect(
      baseX, baseY * (i + 1) + messageHeight * i,
      width, messageHeight);
    this.tiler.context.fillStyle = "rgb(0, 0, 0)";
    this.tiler.context.fillText(messages[i], baseX, baseY * (i + 0.5) + messageHeight * (i + 1));
  }

  this.tiler.context.restore();
};

Display.prototype.scroll = function(dx, dy){
  this.tiler.scroll(dx, dy);
};
