renderer = null

composition = renderModel = composer = gui = stats = null

_init = () ->
  noise.seed(Math.random())
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 0, transparent: true})
  renderer.setSize(window.innerWidth, window.innerHeight)

  document.body.appendChild(renderer.domElement);

  gui = new dat.gui.GUI

  initPostProcessing()
  initCompositions()

  stats = new Stats
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.left = '0px'
  stats.domElement.style.top = '0px'

  document.body.appendChild stats.domElement

initCompositions = () ->
  compositionPicker = new CompositionPicker
  document.body.appendChild compositionPicker.domElement
  compositionPicker.addComposition new CircleGrower
  compositionPicker.addComposition new SphereSphereComposition

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
  composition?.update()

_animate = () ->
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