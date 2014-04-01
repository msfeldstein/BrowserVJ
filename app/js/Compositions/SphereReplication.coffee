class SphereReplication extends Composition
  name: "Sphere Replication"

  inputs: [
    {name: "Trigger", type: "boolean", toggle: false}
  ]
  setup: (@renderer) ->
    @scene = new THREE.Scene

    @camera = new THREE.PerspectiveCamera(75, @renderer.domElement.width / @renderer.domElement.height, 1, 10000)
    @camera.position.z = 1000;

    @origin = new THREE.Vector3 0, 0, 0
    @group = new THREE.Object3D
    @scene.add @group
    

    @material = new THREE.MeshBasicMaterial(transparent: true)
    @material.blending = THREE.AdditiveBlending
    @material.opacity = 0.3
    @cubeGeometry = new THREE.CubeGeometry(20, 20, 20)

    geometry = new THREE.Geometry
    
    @group = new THREE.Object3D
    @scene.add(@group)

    steps = 10
    spacing = 50
    arr = [-steps/2..steps/2]
    @cubes = []
    for x in arr

      for y in arr
        for z in arr
          pos = new THREE.Vector3(x * spacing, y * spacing, z * spacing)
          @addCube(@group, pos)

    sprite = new THREE.ImageUtils.loadTexture("assets/disc.png")
    sprite.needsUpdate = true
    

  "change:Trigger": (obj,val) =>
    if val
      for cube in @cubes
        if Math.random() > 0.8
          cube.material.opacity = 1

  addCube: (group, pos) ->
    material = new THREE.MeshBasicMaterial(transparent: true)
    material.blending = THREE.AdditiveBlending
    material.opacity = 0.3
    cube = new THREE.Mesh(@cubeGeometry, material)
    cube.position = pos
    @cubes.push(cube)
    group.add(cube)

  update: () ->
    for cube in @cubes
      if cube.material.opacity > .3
        cube.material.opacity -= .03
    @group.rotation.x += .001
    @group.rotation.y += .00133
    @group.rotation.z += .00143