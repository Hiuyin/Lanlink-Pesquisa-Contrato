
exports.unicoItem = function (array) {
    return array.filter(function (elem, pos, arr) {
      return arr.indexOf(elem) == pos;
    });
  }


