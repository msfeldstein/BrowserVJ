THREE.EffectComposer.prototype.removePass = function(pass) {
  var index = this.passes.indexOf(pass);
  if (index != -1) {
    this.passes.splice(index, 1);
  }
}