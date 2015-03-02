class CubeReplication extends Composition
  name: "Cube Replication"

  inputs: [
    {name: "Trigger", type: "boolean", toggle: false}
    {name: "Color", type: "color", default: "#ffffff"}
  ]
  setup: (@renderer) ->
    @scene = new THREE.Scene

    @camera = new THREE.PerspectiveCamera(75, @renderer.domElement.width / @renderer.domElement.height, 1, 10000)
    @camera.position.z = 1000;

    @origin = new THREE.Vector3 0, 0, 0
    @group = new THREE.Object3D
    @scene.add @group

    @matColor = new THREE.Color
    @material = new THREE.MeshBasicMaterial(transparent: true, color: @matColor)
    @material.blending = THREE.AdditiveBlending
    @material.opacity = 0.3
    cubeSize = 40
    @cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)

    @group = new THREE.Object3D
    @scene.add(@group)

    steps = 10
    spacing = 100
    arr = [-steps/2..steps/2]
    @cubes = []
    for x in arr
      for y in arr
        for z in arr 
          @addCube @group, new THREE.Vector3(x * spacing, y * spacing, z * spacing)

  "change:Trigger": (obj,val) =>
    if val
      for cube in @cubes
        if Math.random() > 0.8
          cube.material.opacity = 1

  "change:Color": (obj, val) =>
    for cube in @cubes
      cube.material.color.setStyle(val)

  addCube: (group, pos) ->
    material = new THREE.MeshBasicMaterial(transparent: true)
    material.blending = THREE.AdditiveBlending
    material.opacity = 0.3
    cube = new THREE.Mesh(@cubeGeometry, material)
    
    @cubes.push(cube)
    group.add(cube)
    cube.position.set(pos.x, pos.y, pos.z)

  update: () ->
    for cube in @cubes
      if cube.material.opacity > .3
        cube.material.opacity -= .03
    @group.rotation.x += .001
    @group.rotation.y += .00133
    @group.rotation.z += .00143
