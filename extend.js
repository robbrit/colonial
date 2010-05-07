// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function isArray(obj){
  return obj.constructor.toString().indexOf("Array") != -1;
}

Array.prototype.deepIndexOf = function(el){
  for (var i = 0; i < this.length; i++){
    if (el === this[i]){
      return i;
    }else if (isArray(this[i]) && isArray(el)){
      if (this[i].length === el.length){
        var equal = true;
        for (var j = 0; j < el.length; j++){
          if (this[i][j] != el[j]){
            equal = false;
            break;
          }
        }
        if (equal){
          return i;
        }
      }
    }
  }
  return -1;
}
