class SphereSphereComposition
  setup: (@renderer) ->
    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    @camera.position.z = 1000;
    @origin = new THREE.Vector3 0, 0, 0
    @group = new THREE.Object3D
    @scene.add @group
    @sphereGeometry = new THREE.SphereGeometry(10, 32, 32)
    @sphereMaterial = new THREE.MeshPhongMaterial({
      transparent: false
      opacity: 1
      color: 0xDA8258
      specular: 0xD67484
      shininess: 10
      ambient: 0xAAAAAA
      shading: THREE.FlatShading
    })
    for size in [400]#[200, 300, 400]
      res = 50
      skeleton = new THREE.SphereGeometry(size, res, res)
      for vertex in skeleton.vertices
        @addCube @group, vertex

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

  addCube: (group, position) ->
    mesh = new THREE.Mesh @sphereGeometry, @sphereMaterial
    mesh.position = position
    mesh.lookAt @origin
    @group.add mesh

