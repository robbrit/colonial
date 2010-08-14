Game.GUI = {
  showBuildingStats: function(building){
    Game.pause();

    var canvas = $("#main-canvas");
    var pos = canvas.position();

    var margin = 20;

    $("#pane-building")
      .children("h1")
        .html(building.getText("header"))
        .end()
      .children("p")
        .html(building.getText("body"))
        .end()
      .css({
        width: canvas.width() - margin * 2,
        height: canvas.height() - margin * 2,
        left: pos.left + margin,
        top: pos.top + margin
      })
      .show();
  },

  closeDialog: function(){
    $(".dialog:visible").hide();
    Game.resume();
  }
};
