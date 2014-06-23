_V = {}
_V.div = function(className, text) {
  var d = document.createElement('div');
  d.className = className;
  d.textContent = text || "";
  return d;
}