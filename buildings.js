var Buildings = {
  road: function(xy){
    this.image = Resources.images.road;
    this.type = "road";
  },

  plot: function(xy){
    this.image = Resources.images.plot;
    this.type = "plot";
    this.capacity = 1;
    this.location = xy;
  }
};
