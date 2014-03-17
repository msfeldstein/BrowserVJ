camera = scene = renderer = buffer = controls = 0
geometry = material =  mesh = 0;
plexus = 0

options = {
    mirror: false
    feedback: 0
}

init = () ->
    noise.seed(Math.random())

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];
    controls.addEventListener( 'change', animate );


    scene = new THREE.Scene();

    cubesize = 7
    geometry = new THREE.SphereGeometry(cubesize, cubesize, cubesize);
    cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        wireframe: true
        transparent: true
        opacity: .1
        visible: true
    });

    plexus = new Plexus(scene, {thresh:200})

    addMesh = () ->
        mesh = new THREE.Mesh(geometry, cubeMaterial);
        scene.add(mesh);
        wanderer = new Wanderer(mesh)
        plexus.addElement mesh

    # addMesh = () ->
    #     particle = new Particle(300, 5)
    #     scene.add(particle.mesh)
    #     plexus.addElement(particle)

    for i in [1..24]
        addMesh()

    buffer = new THREE.CanvasRenderer();
    buffer.setSize(window.innerWidth, window.innerHeight);

    renderer = new THREE.CanvasRenderer();
    renderer.autoClear = false
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    require ['js/dat.gui.min.js'], (GUI) ->
        gui = new dat.gui.GUI
        gui.add(options, "feedback", 0, 1)
        gui.add(options, "mirror")
        fieldset = gui.addFolder('Dots')
        fieldset.add(cubeMaterial, 'visible')
        fieldset.add(cubeMaterial, 'opacity', 0, 1)
        fieldset = gui.addFolder('Lines')


update = () ->
    plexus.update()
    controls.update();

animate = () ->
    canvas = renderer.domElement
    ctx = canvas.getContext("2d")
    ctx.fillStyle = "rgba(0,0,0,#{1-options.feedback})"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    buffer.render(scene, camera);
    ctx.drawImage(buffer.domElement, 0, 0)
    if options.mirror
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(buffer.domElement, 0, 0)

window.loopF = (fn) ->
    f = () ->
        fn()
        requestAnimationFrame(f)
    f()

$ ->
    init()
    loopF update
    loopF animate

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
class ParticleWanderer
  constructor: (scene) ->
    
class @Plexus
  constructor: (@scene, @opts = {thresh: 200}) ->
    @elements = []
    @tris = []
    @trianglePool = []

  addElement: (e) ->
    @elements.push e
    e.neighbors = {}

  newLine: () ->
    geometry = new THREE.Geometry
    geometry.vertices.push new THREE.Vector3 0,0,0
    geometry.vertices.push new THREE.Vector3 0,0,0
    lineMaterial = new THREE.LineBasicMaterial {transparent: true, color:0xFFFFFF}
    line = new THREE.Line geometry, lineMaterial
    line

  newTriangle: (el1, el2, el3) ->
    mesh = @trianglePool.pop()
    if !mesh
      geometry = new THREE.Geometry
      triMaterial = new THREE.MeshNormalMaterial {opacity: 1, color: 0xFFFFFF}
      geometry.faces.push new THREE.Face3(0, 1, 2)
      mesh = new THREE.Mesh(geometry, triMaterial)
    mesh.geometry.vertices = [el1.position, el2.position, el3.position]
    d1 = Math.abs(el1.position.distanceTo(el2.position))
    d2 = Math.abs(el1.position.distanceTo(el3.position))
    d3 = Math.abs(el2.position.distanceTo(el3.position))
    minDist = Math.max(d1, Math.max(d2, d3))
    mesh.material.opacity =  (@opts.thresh - minDist) / @opts.thresh
    mesh

  update: () ->
    # Find all the lines
    for el, i in @elements
      el.neighborArray = [] # Sorted so we can use the same algo as in openframeworks
      j = i + 1
      while j < @elements.length
        el2 = @elements[j]
        distance = Math.abs(el.position.distanceTo(el2.position))
        existing = el.neighbors[el2.uuid]
        if distance < @opts.thresh && distance > 1
          if not existing
            line = @newLine()
            line.geometry.vertices = [el.position, el2.position]
            @scene.add line
            existing = el.neighbors[el2.uuid] = {el: el2, line: line}
          el.neighborArray.push existing
          existing.line.material.opacity = (@opts.thresh - distance) / @opts.thresh
        else
          if existing
            @scene.remove existing.line
            delete el.neighbors[el2.uuid]
        j++

    # Find all the triangles
    for tri in @tris
      @scene.remove tri
      @trianglePool.push tri

    @tris = []
    for first in @elements
      for second in first.neighborArray
        for third in first.neighborArray
          if second.el.neighbors[third.el.uuid]
            tri = @newTriangle first, second.el, third.el
            @scene.add tri
            @tris.push tri


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