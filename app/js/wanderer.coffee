SPEED = 1 / 20000

class @Wanderer
  constructor: (@mesh) ->
    requestAnimationFrame(@update);
    @seed = Math.random() * 1000
  update: (t) =>
    t = t * SPEED + @seed
    @mesh.position.x = noise.simplex2(t, 0) * 600
    @mesh.position.y = noise.simplex2(0, t) * 300
    @mesh.position.z = noise.simplex2(t * 1.1 + 300, 0) * 100
    requestAnimationFrame(@update);