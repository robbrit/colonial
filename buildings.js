var Buildings = {
  road: function(xy){
    this.image = Resources.images.road;
    this.type = "road";
  },

  plot: function(xy){
    this.image = Resources.images.plot;
    this.type = "plot";
    this.capacity = 1;
    this.people = new Array();
    this.location = xy;
  }
};

Buildings.plot.prototype.addPerson = function(person){
  person.state = "hidden";
  this.people.push(person);

  // TODO: When the first person arrives, change image to a house
};
