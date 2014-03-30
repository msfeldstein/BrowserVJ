class VJSLayer extends Backbone.Model
  constructor: () ->
    super()
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 1, transparent: true})
    outputWindow = document.querySelector(".output-frame")
    @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)
    $(window).resize () =>
      @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)

    @initCompositions()
    @initEffects()

  render: () =>
    @get("composition")?.update()
    @composer.render()

  output: () =>
    @renderer.domElement

  initCompositions: () ->
    @compositionPicker = new CompositionPicker(@)
    for clazz in CompositionClasses
      @compositionPicker.addComposition new clazz

  initEffects: () ->
    @composer = new THREE.EffectComposer(@renderer)
    @renderModel = new THREE.RenderPass(new THREE.Scene, new THREE.PerspectiveCamera)
    @renderModel.enabled = true
    @composer.addPass @renderModel

    # Todo: Why can we render without this?
    passthrough = new Passthrough
    passthrough.enabled = true
    passthrough.renderToScreen = true
    @composer.addPass passthrough

    @effectsManager = new EffectsManager @composer
    @effectsManager.registerEffect MirrorPass
    @effectsManager.registerEffect InvertPass
    @effectsManager.registerEffect ChromaticAberration
    @effectsManager.registerEffect MirrorPass
    @effectsManager.registerEffect DotRollPass
    @effectsManager.registerEffect KaleidoscopePass
    @effectsManager.registerEffect ShroomPass

    @effectsPanel = new EffectsPanel(model: @effectsManager)

  eject: () =>
    @setComposition(null)

  setComposition: (comp) ->
    @unload(@get("composition"))
    @set("composition", comp)
    if comp
      @listenTo(comp, "destroy", @eject)
      comp.setup(@renderer)
      @renderModel.scene = comp.scene
      @renderModel.camera = comp.camera

  unload: (comp) ->
    @stopListening comp