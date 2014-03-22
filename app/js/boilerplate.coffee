renderer = null

composition = bokehPass = renderModel = composer = rgbShift = shroomPass = gui = stats = null
gamepad = null

# Add options here to use with dat.gui
options = {

}

_init = () ->
  noise.seed(Math.random())
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 0, transparent: true})
  renderer.setSize(window.innerWidth, window.innerHeight)

  document.body.appendChild(renderer.domElement);

  gui = new dat.gui.GUI

  initPostProcessing()
  gamepad = new Gamepad
  window.gamepad = gamepad
  gamepad.addEventListener Gamepad.STICK_1, (val) ->
    if Math.abs(val.y) < 0.04 then val.y = 0
    rgbShift.uniforms.uRedShift.value = rgbShift.uniforms.uBlueShift.value  = rgbShift.uniforms.uGreenShift.value = 1 + val.y

  gamepad.addEventListener Gamepad.RIGHT_SHOULDER, (val) ->
    console.log val

  stats = new Stats
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.left = '0px'
  stats.domElement.style.top = '0px'

  document.body.appendChild stats.domElement

  setComposition(new SphereSphereComposition)

  compositionPicker = new CompositionPicker
  document.body.appendChild compositionPicker.domElement
  

window.setComposition = (comp) ->
  composition = comp
  composition.setup(renderer)
  renderModel.scene = composition.scene
  renderModel.camera = composition.camera
  

initPostProcessing = () ->
  composer = new THREE.EffectComposer(renderer)
  renderModel = new THREE.RenderPass(new THREE.Scene, new THREE.PerspectiveCamera)
  renderModel.renderToScreen = true
  composer.addPass renderModel

  
  addEffect new MirrorPass
  addEffect new InvertPass
  addEffect p = new ShroomPass
  p.enabled = true
  p.renderToScreen = true

addEffect = (effect) ->
  effect.enabled = false
  composer.addPass effect
  f = gui.addFolder effect.name
  f.add(effect, "enabled")
  if effect.uniformValues
    for values in effect.uniformValues
      f.add(effect.uniforms[values.uniform], "value", values.start, values.end).name(values.name)

_update = (t) ->
  composition.update()

_animate = () ->
  # renderer.clear()
  composer.render()
  stats.update()
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