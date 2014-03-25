class SphereSphereComposition extends Composition
  name: "Spherize"
  setup: (@renderer) ->
    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    @camera.position.z = 1000;
    @origin = new THREE.Vector3 0, 0, 0
    @group = new THREE.Object3D
    @scene.add @group
    

    sprite = new THREE.ImageUtils.loadTexture("assets/disc.png")
    sprite.premultiplyAlpha = true
    sprite.needsUpdate = true
    geometry = new THREE.Geometry
    for size in [400]
      res = 80
      skeleton = new THREE.SphereGeometry(size, res, res)
      for vertex in skeleton.vertices
        geometry.vertices.push vertex
      material = new THREE.ParticleSystemMaterial({size: 35, map: sprite, transparent: true})
      material.blending = THREE.AdditiveBlending
      material.opacity = 0.2
      @particles = new THREE.ParticleSystem geometry, material
      @particles.sortParticles = true
      @group.add @particles

    light = new THREE.SpotLight 0xFFFFFF
    light.position.set 1000, 1000, 300
    @scene.add light

    light = new THREE.AmbientLight 0x222222
    @scene.add light

    ambient = new THREE.PointLight( 0x444444, 1, 10000 );
    ambient.position.set 500, 500, 500
    @scene.add ambient

    ambient = new THREE.PointLight( 0x444444, 1, 10000 );
    ambient.position.set -500, 500, 500
    @scene.add ambient
  update: () ->
    @group.rotation.y += 0.001
    @group.rotation.z += 0.0001
    @group.rotation.x += 0.00014

  addCube: (group, position) ->
    mesh = new THREE.Mesh @sphereGeometry, @sphereMaterial
    mesh.position = position
    mesh.lookAt @origin
    @group.add mesh
