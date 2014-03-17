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