camera = scene = renderer = buffer = 0
geometry = material =  mesh = 0;
plexus = 0

options = {
    mirror: false
    feedback: false
}

init = () ->
    noise.seed(Math.random())

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    cubesize = 10
    geometry = new THREE.CubeGeometry(cubesize, cubesize, cubesize);
    cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
        transparent: true
        opacity: 1
        visible: false
    });

    plexus = new Plexus(scene)

    addMesh = () ->
        mesh = new THREE.Mesh(geometry, cubeMaterial);
        scene.add(mesh);
        wanderer = new Wanderer(mesh)
        plexus.addElement mesh

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
        gui.add(options, "feedback")
        gui.add(options, "mirror")
        fieldset = gui.addFolder('Dots')
        fieldset.add(cubeMaterial, 'visible')
        fieldset.add(cubeMaterial, 'opacity', 0, 1)
        fieldset = gui.addFolder('Lines')


update = () ->
    plexus.update()

animate = () ->
    canvas = renderer.domElement
    ctx = canvas.getContext("2d")
    if options.feedback
        ctx.fillStyle = "rgba(0,0,0,0.1)"
    else
        ctx.fillStyle = "rgb(0,0,0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    buffer.render(scene, camera);
    ctx.drawImage(buffer.domElement, 0, 0)
    if options.mirror
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(buffer.domElement, 0, 0)

loopF = (fn) ->
    f = () ->
        fn()
        requestAnimationFrame(f)
    f()

$ ->
    init()
    loopF update
    loopF animate