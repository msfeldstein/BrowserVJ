class VJSLayer extends Backbone.Model
  inputs: [
    {name: "opacity", type: "number", min: 0, max: 1, default: 1}
    {name: "Blend Mode", type: "select", options: ['source-over','source-in','source-out','source-atop','destination-over','destination-in','destination-out','destination-atop','lighter','darker','copy','xor'], default: "source-over"}
  ]
  constructor: (@name) ->
    super(opacity: 1)
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 0, transparent: true})
    # @renderer.setClearColor(0x000000, 0)
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
    parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
    renderTarget = new THREE.WebGLRenderTarget( @renderer.domElement.width, @renderer.domElement.height, parameters );
    @composer = new THREE.EffectComposer(@renderer, renderTarget)
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