camera = scene = renderer = 0
geometry = material =  mesh = 0;
plexus = 0

init = () ->
    noise.seed(Math.random())

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    cubesize = 10
    geometry = new THREE.CubeGeometry(cubesize, cubesize, cubesize);
    material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    });

    plexus = new Plexus(scene)

    addMesh = () ->
        mesh = new THREE.Mesh(geometry, material);
        #scene.add(mesh);
        wanderer = new Wanderer(mesh)
        plexus.addElement mesh

    for i in [1..24]
        addMesh()

    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

update = () ->
    plexus.update()

animate = () ->
    renderer.render(scene, camera);

loopF = (fn) ->
    f = () ->
        fn()
        requestAnimationFrame(f)
    f()

$ ->
    init()
    loopF update
    loopF animate