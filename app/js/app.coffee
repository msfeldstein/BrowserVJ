scene = group = null
geometry = new THREE.CubeGeometry(20, 20, 2)
geometry = new THREE.SphereGeometry(10, 32, 32)
origin = new THREE.Vector3 0, 0, 0
addCube = (group, position) ->
  material = new THREE.MeshPhongMaterial({
    transparent: false
    opacity: 1
    color: 0xDA8258
    specular: 0xD67484
    shininess: 10
    ambient: 0xAAAAAA
    shading: THREE.FlatShading
  })
  mesh = new THREE.Mesh geometry, material
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.position = position
  mesh.lookAt origin
  group.add mesh

addFace = (group, face, skeleton) ->
  material = new THREE.MeshBasicMaterial({
    transparent: true, opacity: 0.3, color: 0xFFFFFF, side: THREE.DoubleSide
  })
  v1 = skeleton.vertices[face.a].clone()
  v2 = skeleton.vertices[face.b].clone()
  v3 = skeleton.vertices[face.c].clone()
  d1 = v1.distanceTo(v2)
  d2 = v1.distanceTo(v3)
  d3 = v2.distanceTo(v3)
  p1 = p2 = null
  if d1 > d2 && d1 > d3
    p1 = v1
    p2 = v2
  else if d2 > d1 && d2 > d3
    p1 = v1
    p2 = v3
  else
    p1 = v2
    p2 = v3
  geometry = new THREE.Geometry
  geometry.vertices.push p1
  geometry.vertices.push p2
  geometry = new THREE.SphereGeometry 20, 8, 8
  lineMaterial = new THREE.LineBasicMaterial {transparent: true, linewidth: 5, opacity: 0.5,color:0xFFFFFF, linecap: "butt"}
  line = new THREE.Line geometry, lineMaterial
  group.add line

@setup = (s) ->
  scene = s
  group = new THREE.Object3D
  scene.add group
  for size in [400]#[200, 300, 400]
    res = 50
    skeleton = new THREE.SphereGeometry(size, res, res)
    for vertex in skeleton.vertices
      addCube group, vertex

  light = new THREE.SpotLight 0xFFFFFF
  light.position.set 1000, 1000, 300
  scene.add light

  light = new THREE.AmbientLight 0x222222
  scene.add light

  ambient = new THREE.PointLight( 0x444444, 1, 10000 );
  ambient.position.set 500, 500, 500
  scene.add ambient

  ambient = new THREE.PointLight( 0x444444, 1, 10000 );
  ambient.position.set -500, 500, 500
  scene.add ambient
@update = (scene) ->
  group.rotation.y += 0.001