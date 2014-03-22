noise.seed(Math.random())

$ ->
  window.application = new App

class App extends Backbone.Model
  constructor: () ->
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 1, transparent: true})
    @renderer.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(@renderer.domElement);

    @gui = new dat.gui.GUI

    @initCompositions()
    @initPostProcessing()
    @initStats()
    @initMicrophone()
    @setComposition new BlobbyComposition

  animate: () =>
    @composition?.update({audio: @audioVisualizer.level})
    @composer.render()
    @stats.update()
    requestAnimationFrame @animate

  initCompositions: () ->
    @compositionPicker = new CompositionPicker
    document.body.appendChild @compositionPicker.render()
    @compositionPicker.addComposition new CircleGrower
    @compositionPicker.addComposition new SphereSphereComposition
    @compositionPicker.addComposition new BlobbyComposition
  
  initPostProcessing: () ->
    @composer = new THREE.EffectComposer(@renderer)
    @renderModel = new THREE.RenderPass(new THREE.Scene, new THREE.PerspectiveCamera)
    @renderModel.renderToScreen = true
    @composer.addPass @renderModel
    @addEffect new MirrorPass
    @addEffect new InvertPass
    @addEffect new ChromaticAberration
    @addEffect new BadTVPass
    @addEffect p = new ShroomPass
    p.enabled = true
    p.renderToScreen = true

  initStats: () ->
    @stats = new Stats
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.left = '0px'
    @stats.domElement.style.top = '0px'
    document.body.appendChild @stats.domElement

  initMicrophone: () ->
    @audioVisualizer = new AudioVisualizer
    document.body.appendChild @audioVisualizer.render()

  startAudio: (stream) =>
    mediaStreamSource = @context.createMediaStreamSource(stream)
    mediaStreamSource.connect @analyzer

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
    if effect.options
      for values in effect.options
        if values.default then effect[values.property] = values.default
        f.add(effect, values.property, values.start, values.end).name(values.name) 
    if effect.uniformValues
      for values in effect.uniformValues
        if values.default
          effect.uniforms[values.uniform].value = values.default
        f.add(effect.uniforms[values.uniform], "value", values.start, values.end).name(values.name)
