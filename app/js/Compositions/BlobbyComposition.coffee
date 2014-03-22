SPEED = 1 / 20000

class @Wanderer
  constructor: (@mesh) ->
    requestAnimationFrame(@update);
    @seed = Math.random() * 1000
  update: (t) =>
    t = t * SPEED + @seed
    @mesh.x = noise.simplex2(t, 0) * 600
    @mesh.y = noise.simplex2(0, t) * 300
    @mesh.z = noise.simplex2(t * 1.1 + 300, 0) * 100
    requestAnimationFrame(@update);

class BlobbyComposition extends Composition
  setup: (@renderer) ->
    @time = 0
    @scene = new THREE.Scene
    @scene.fog = new THREE.FogExp2( 0x000000, 0.0005 );
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    @camera.position.z = 1000;

    sprite = new THREE.ImageUtils.loadTexture("assets/disc.png")
    sprite.premultiplyAlpha = true
    sprite.needsUpdate = true
    geometry = new THREE.Geometry
    for i in [0..3000]
      vtx = new THREE.Vector3
      vtx.x = 500 * Math.random() - 250
      vtx.y = 500 * Math.random() - 250
      vtx.z = 500 * Math.random() - 250
      vtx.seed = i
      geometry.vertices.push vtx
    material = new THREE.ParticleSystemMaterial({size: 135, map: sprite, transparent: true})
    material.color.setHSL( 1.0, 0.3, 0.7 );
    material.opacity = 0.1
    material.blending = THREE.AdditiveBlending
    @particles = new THREE.ParticleSystem geometry, material
    @particles.sortParticles = true
    @scene.add @particles

  update: () ->
    @time += .001
    @particles.rotation.y += 0.001
    for vertex in @particles.geometry.vertices
      vertex.x = noise.simplex2(@time, vertex.seed) * 500 * (Math.abs(Math.sin(@time * 25)) + .01)
      vertex.y = noise.simplex2(vertex.seed, @time) * 500 * (Math.abs(Math.sin(@time * 25)) + .01)
      vertex.z = noise.simplex2(@time + vertex.seed, vertex.seed) * 500 * (Math.abs(Math.sin(@time * 25)) + .01)

