class @Particle
  constructor: (pr, vr) ->
    @velocity = new THREE.Vector3(@rand(vr), @rand(vr ), @rand(vr))
    @position = new THREE.Vector3(@rand(pr), @rand(pr), @rand(pr))
    cubesize = 7
    geometry = new THREE.SphereGeometry(cubesize, cubesize, cubesize);
    cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        wireframe: true
        transparent: true
        opacity: 1
        visible: true
    });
    @mesh = new THREE.Mesh(geometry, cubeMaterial);
    @mesh.position = @position
    loopF @update

  update: () =>
    @position.add(@velocity)
    @velocity.add(@position.clone().multiplyScalar(-.0001))
  rand: (size) ->
    Math.random() * size * 2 - size