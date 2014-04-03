THREE.EffectComposer.prototype.removePass = function(pass) {
  var index = this.passes.indexOf(pass);
  if (index != -1) {
    this.passes.splice(index, 1);
  }
}

THREE.EffectComposer.prototype.movePass = function(pass, newIndex) {
  var index = this.passes.indexOf(pass);
  if (index != -1) {
    this.passes.splice(index, 1);
    this.passes.splice(newIndex, 0, pass)
  }
}