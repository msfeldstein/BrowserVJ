camera = scene = renderer = controls = null

renderModel = composer = rgbShift = shroomPass = gui = null
gamepad = null

# Add options here to use with dat.gui
options = {

}

_init = () ->
    noise.seed(Math.random())

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    # _useTrackball(camera)
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 0, transparent: true})
    renderer.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(renderer.domElement);

    gui = new dat.gui.GUI

    setup(scene)
    initPostProcessing()
    gamepad = new Gamepad
    window.gamepad = gamepad
    gamepad.addEventListener Gamepad.STICK_1, (val) ->
        if Math.abs(val.y) < 0.04 then val.y = 0
        rgbShift.uniforms.uRedShift.value = rgbShift.uniforms.uBlueShift.value  = rgbShift.uniforms.uGreenShift.value = 1 + val.y

    gamepad.addEventListener Gamepad.RIGHT_SHOULDER, (val) ->
        console.log val

initPostProcessing = () ->
    composer = new THREE.EffectComposer(renderer)
    renderModel = new THREE.RenderPass(scene, camera)
    renderModel.renderToScreen = true
    composer.addPass renderModel
    shroomPass = new ShroomPass(amp: .01, StartRad: 0, freq: 10)
    shroomPass.renderToScreen = true
    gui.add shroomPass.uniforms.amp, "value", 0, 0.05
    composer.addPass shroomPass

_useTrackball = (camera) ->
    controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];
    controls.addEventListener( 'change', _animate );

_update = (t) ->
    controls?.update();
    update()

_animate = () ->
    # renderer.clear()
    composer.render()
    # renderer.render(scene, camera)

window.loopF = (fn) ->
    f = () ->
        fn()
        requestAnimationFrame(f)
    f()

$ ->
    _init()
    loopF _update
    loopF _animate