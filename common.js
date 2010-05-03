var Common = {
  createHiddenSurface: function(w, h){
    var canvas = document.createElement("canvas");

    canvas.width = w;
    canvas.height = h;

    return canvas;
  },

  scrollSpeed: 20
};
