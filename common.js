var Common = {
  createHiddenSurface: function(w, h){
    var canvas = document.createElement("canvas");

    canvas.width = w;
    canvas.height = h;

    return canvas;
  },

  time: function() { return new Date().getTime(); },

  scrollSpeed: 20
};
