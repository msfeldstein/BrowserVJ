class SphereSphereComposition extends Composition
  name: "Spherize"
  setup: (@renderer) ->
    @scene = new THREE.Scene
    @scene.fog = new THREE.FogExp2( 0x000000, 0.0005 );

    @camera = new THREE.PerspectiveCamera(75, @renderer.domElement.width / @renderer.domElement.height, 1, 10000)
    @camera.position.z = 1000;

    @origin = new THREE.Vector3 0, 0, 0
    @group = new THREE.Object3D
    @scene.add @group
    

    sprite = new THREE.ImageUtils.loadTexture("assets/disc.png")
    sprite.premultiplyAlpha = true
    sprite.needsUpdate = true
    geometry = new THREE.Geometry
    @material = new THREE.ParticleSystemMaterial({size: 35, map: sprite, transparent: true})
    @material.blending = THREE.AdditiveBlending
    @material.opacity = 0.2
    @material.color.setHSL( 1.0, 0.3, 0.7 );
    for size in [400]
      res = 80
      skeleton = new THREE.SphereGeometry(size, res, res)
      for vertex in skeleton.vertices
        geometry.vertices.push vertex
      
      @particles = new THREE.ParticleSystem geometry, @material
      @particles.sortParticles = true
      @group.add @particles
    
  update: () =>
    @group.rotation.y += 0.001
    @group.rotation.z += 0.0001
    @group.rotation.x += 0.00014

  addCube: (group, position) ->
    mesh = new THREE.Mesh @sphereGeometry, @sphereMaterial
    mesh.position = position
    mesh.lookAt @origin
    @group.add mesh

