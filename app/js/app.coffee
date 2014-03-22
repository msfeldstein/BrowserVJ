noise.seed(Math.random())

$ ->
  window.application = new App

class App extends Backbone.Model
  constructor: () ->
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 0, transparent: true})
    @renderer.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(@renderer.domElement);

    @gui = new dat.gui.GUI

    @initCompositions()
    @initPostProcessing()
    @initStats()

  animate: () =>
    @composition?.update()
    @composer.render()
    @stats.update()
    requestAnimationFrame @animate

  initCompositions: () ->
    @compositionPicker = new CompositionPicker
    document.body.appendChild @compositionPicker.render()
    @compositionPicker.addComposition new CircleGrower
    @compositionPicker.addComposition new SphereSphereComposition
  
  initPostProcessing: () ->
    @composer = new THREE.EffectComposer(@renderer)
    @renderModel = new THREE.RenderPass(new THREE.Scene, new THREE.PerspectiveCamera)
    @renderModel.renderToScreen = true
    @composer.addPass @renderModel
    @addEffect new MirrorPass
    @addEffect new InvertPass
    @addEffect p = new ShroomPass
    p.enabled = true
    p.renderToScreen = true

  initStats: () ->
    @stats = new Stats
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.left = '0px'
    @stats.domElement.style.top = '0px'
    document.body.appendChild @stats.domElement

  setComposition: (comp) ->
    @composition = comp
    @composition.setup(@renderer)
    @renderModel.scene = @composition.scene
    @renderModel.camera = @composition.camera
    requestAnimationFrame @animate
    
  addEffect: (effect) ->
    effect.enabled = false
    @composer.addPass effect
    f = @gui.addFolder effect.name
    f.add(effect, "enabled")
    if effect.uniformValues
      for values in effect.uniformValues
        f.add(effect.uniforms[values.uniform], "value", values.start, values.end).name(values.name)
