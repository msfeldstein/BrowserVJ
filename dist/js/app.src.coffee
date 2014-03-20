class @ShaderPassBase
  constructor: (initialValues) ->
    @enabled = true
    @uniforms = THREE.UniformsUtils.clone @findUniforms(@fragmentShader)
    console.log @uniforms
    for key, value of initialValues
      @uniforms[key].value = value

    @material = new THREE.ShaderMaterial {
      uniforms: @uniforms
      vertexShader: @vertexShader
      fragmentShader: @fragmentShader
    }

    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene  = new THREE.Scene();

    @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), null)
    @scene.add @quad

  render: (renderer, writeBuffer, readBuffer, delta) ->
    @update?()
    if !@enabled
      writeBuffer = readBuffer
      return
    @uniforms['uTex'].value = readBuffer
    @uniforms['uSize'].value.set(readBuffer.width, readBuffer.height)
    @quad.material = @material
    if @renderToScreen
      renderer.render @scene, @camera
    else
      renderer.render @scene, @camera, writeBuffer, false

  standardUniforms: {
    uTex: {type: 't', value: null}
    uSize: {type: 'v2', value: new THREE.Vector2( 256, 256 )}
  }
  
  vertexShader: """
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  """

  findUniforms: (shader) ->
    lines = shader.split("\n")
    uniforms = {}
    for line in lines
      if (line.indexOf("uniform") == 0)
        console.log line
        tokens = line.split(" ")
        name = tokens[2].substring(0, tokens[2].length - 1)
        uniforms[name] = @typeToUniform tokens[1]
    uniforms

  typeToUniform: (type) ->
    switch type
      when "float" then {type: "f", value: 0}
      when "vec2" then {type: "v2", value: new THREE.Vector2}
      when "vec3" then {type: "v3", value: new THREE.Vector3}
      when "vec4" then {type: "v4", value: new THREE.Vector4}
      when "sampler2D" then {type: "t", value: null}


class @ShroomPass extends ShaderPassBase
  update: () ->
    @uniforms.StartRad.value += 0.01
    
  fragmentShader: """
    // Constants
    const float C_PI    = 3.1415;
    const float C_2PI   = 2.0 * C_PI;
    const float C_2PI_I = 1.0 / (2.0 * C_PI);
    const float C_PI_2  = C_PI / 2.0;

    uniform float StartRad;
    uniform float freq;
    uniform float amp;
    uniform vec2 uSize;
    varying vec2 vUv;

    uniform sampler2D uTex;

    void main (void)
    {
        vec2  perturb;
        float rad;
        vec4  color;

        // Compute a perturbation factor for the x-direction
        rad = (vUv.s + vUv.t - 1.0 + StartRad) * freq;

        // Wrap to -2.0*PI, 2*PI
        rad = rad * C_2PI_I;
        rad = fract(rad);
        rad = rad * C_2PI;

        // Center in -PI, PI
        if (rad >  C_PI) rad = rad - C_2PI;
        if (rad < -C_PI) rad = rad + C_2PI;

        // Center in -PI/2, PI/2
        if (rad >  C_PI_2) rad =  C_PI - rad;
        if (rad < -C_PI_2) rad = -C_PI - rad;

        perturb.x  = (rad - (rad * rad * rad / 6.0)) * amp;

        // Now compute a perturbation factor for the y-direction
        rad = (vUv.s - vUv.t + StartRad) * freq;

        // Wrap to -2*PI, 2*PI
        rad = rad * C_2PI_I;
        rad = fract(rad);
        rad = rad * C_2PI;

        // Center in -PI, PI
        if (rad >  C_PI) rad = rad - C_2PI;
        if (rad < -C_PI) rad = rad + C_2PI;

        // Center in -PI/2, PI/2
        if (rad >  C_PI_2) rad =  C_PI - rad;
        if (rad < -C_PI_2) rad = -C_PI - rad;

        perturb.y  = (rad - (rad * rad * rad / 6.0)) * amp;
        vec2 pos = vUv.st;
        pos.x = 1.0 - pos.x;
        color = texture2D(uTex, perturb + pos);

        gl_FragColor = vec4(color.rgb, color.a);
    }
  """

class @ShaderPassBase
  constructor: (initialValues) ->
    @enabled = true
    @uniforms = THREE.UniformsUtils.clone @findUniforms(@fragmentShader)
    console.log @uniforms
    for key, value of initialValues
      @uniforms[key].value = value

    @material = new THREE.ShaderMaterial {
      uniforms: @uniforms
      vertexShader: @vertexShader
      fragmentShader: @fragmentShader
    }

    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene  = new THREE.Scene();

    @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), null)
    @scene.add @quad

  render: (renderer, writeBuffer, readBuffer, delta) ->
    @update?()
    if !@enabled
      writeBuffer = readBuffer
      return
    @uniforms['uTex'].value = readBuffer
    @uniforms['uSize'].value.set(readBuffer.width, readBuffer.height)
    @quad.material = @material
    if @renderToScreen
      renderer.render @scene, @camera
    else
      renderer.render @scene, @camera, writeBuffer, false

  standardUniforms: {
    uTex: {type: 't', value: null}
    uSize: {type: 'v2', value: new THREE.Vector2( 256, 256 )}
  }
  
  vertexShader: """
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  """

  findUniforms: (shader) ->
    lines = shader.split("\n")
    uniforms = {}
    for line in lines
      if (line.indexOf("uniform") == 0)
        console.log line
        tokens = line.split(" ")
        name = tokens[2].substring(0, tokens[2].length - 1)
        uniforms[name] = @typeToUniform tokens[1]
    uniforms

  typeToUniform: (type) ->
    switch type
      when "float" then {type: "f", value: 0}
      when "vec2" then {type: "v2", value: new THREE.Vector2}
      when "vec3" then {type: "v3", value: new THREE.Vector3}
      when "vec4" then {type: "v4", value: new THREE.Vector4}
      when "sampler2D" then {type: "t", value: null}


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
class Gamepad
  @FACE_1: 0
  @FACE_2: 1
  @FACE_3: 2
  @FACE_4: 3
  @LEFT_SHOULDER: 4
  @RIGHT_SHOULDER: 5
  @LEFT_SHOULDER_BOTTOM: 6
  @RIGHT_SHOULDER_BOTTOM: 7
  @SELECT: 8
  @START: 9
  @LEFT_ANALOGUE_STICK: 10
  @RIGHT_ANALOGUE_STICK: 11
  @PAD_TOP: 12
  @PAD_BOTTOM: 13
  @PAD_LEFT: 14
  @PAD_RIGHT: 15
  @STICK_1: 16
  @STICK_2: 17

  @BUTTONS = [@FACE_1, @FACE_2, @FACE_3, @FACE_4, @LEFT_SHOULDER, @RIGHT_SHOULDER, @LEFT_SHOULDER_BOTTOM, @RIGHT_SHOULDER_BOTTOM, @SELECT, @START, @LEFT_ANALOGUE_STICK, @RIGHT_ANALOGUE_STICK, @PAD_TOP, @PAD_BOTTOM, @PAD_LEFT, @PAD_RIGHT]

  constructor: () ->
    @pad = null
    @callbacks = {}
    @callbacks[Gamepad.STICK_1] = []
    @callbacks[Gamepad.STICK_2] = []
    @buttonStates = {}
    for button in Gamepad.BUTTONS
      @buttonStates[button] = 0
    requestAnimationFrame @checkForPad

  checkForPad: () =>
    if navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0]
      @pad = navigator.webkitGetGamepads()[0]
      requestAnimationFrame @checkButtons
    else
      requestAnimationFrame @checkForPad

  checkButtons: () =>
    @pad = navigator.webkitGetGamepads()[0]
    requestAnimationFrame @checkButtons
    for button in Gamepad.BUTTONS
      if @callbacks[button] && @buttonStates[button] != @pad.buttons[button]
        @buttonStates[button] = @pad.buttons[button]
        for buttonId, callback of @callbacks[button]
          callback(@pad.buttons[button])
    for callback in @callbacks[Gamepad.STICK_1]
      callback({x:@pad.axes[0],y:@pad.axes[1]})
    for callback in @callbacks[Gamepad.STICK_2]
      callback({x:@pad.axes[2],y:@pad.axes[3]})


  addEventListener: (button, callback) ->
    if !@callbacks[button] then @callbacks[button] = []
    @callbacks[button].push callback

class RGBShiftPass
  constructor: (r,g,b) ->
    shader = new RGBShiftShader
    @uniforms = THREE.UniformsUtils.clone shader.uniforms
    @uniforms['uRedShift'].value = r
    @uniforms['uGreenShift'].value = g
    @uniforms['uBlueShift'].value = b

    @material = new THREE.ShaderMaterial {
      uniforms: @uniforms
      vertexShader: shader.vertexShader
      fragmentShader: shader.fragmentShader
    }

    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene  = new THREE.Scene();

    @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), null)
    @scene.add @quad

  render: (renderer, writeBuffer, readBuffer, delta) ->
    @uniforms['uTex'].value = readBuffer
    @uniforms['uSize'].value.set(readBuffer.width, readBuffer.height)
    @quad.material = @material
    if @renderToScreen
      renderer.render @scene, @camera
    else
      renderer.render @scene, @camera, writeBuffer, false

class RGBShiftShader
  uniforms: {
    uTex: {type: 't', value: null}
    uSize: {type: 'v2', value: new THREE.Vector2( 256, 256 )}
    uRedShift: {type: 'f', value: 0.0}
    uGreenShift: {type: 'f', value: 0.0}
    uBlueShift: {type: 'f', value: 1.0}

  }
  
  vertexShader: """
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  """

  fragmentShader: """
    uniform sampler2D uTex;
    uniform float uRedShift;
    uniform float uGreenShift;
    uniform float uBlueShift;
    uniform vec2 uSize;

    varying vec2 vUv;

    void main() {
      float r = texture2D(uTex, (vUv - 0.5) * vec2(uRedShift, 1.0) + 0.5).r;
      float g = texture2D(uTex, (vUv - 0.5) * vec2(uGreenShift, 1.0) + 0.5).g;
      float b = texture2D(uTex, (vUv - 0.5) * vec2(uBlueShift, 1.0) + 0.5).b;
      
      gl_FragColor = vec4(r,g,b,1.0);
    }
  """