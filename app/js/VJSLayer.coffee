class VJSLayer extends VJSBindable
  readonly: true
  inputs: [
    {name: "opacity", type: "number", min: 0, max: 1, default: 1}
    {name: "Blend Mode", type: "select", options: ['Normal', 'Additive', 'Subtractive', 'Multiply', 'AdditiveAlpha'], default: 'Normal'}
  ]
  constructor: (properties) ->
    super()
    @name = properties.name || "Layer #{@cid}"
    canvas = properties.canvas
    @renderer = new THREE.WebGLRenderer({ antialiasing: true, alpha: true, clearAlpha: 0, transparent: true, canvas: canvas})
    outputWindow = properties.frame
    @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)
    $(window).resize () =>
      @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)

    @initCompositions()
    @initEffects()

  render: () =>
    if @get("composition")
      @get("composition")?.update()
      @composer.render()

  output: () =>
    @renderer.domElement

  texture: () =>
    @composer.writeBuffer

  initCompositions: () ->
    @compositionPicker = new CompositionPicker(@)
    for clazz in CompositionClasses
      @compositionPicker.addComposition new clazz

  initEffects: () ->
    parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
    @renderTarget = new THREE.WebGLRenderTarget( @renderer.domElement.width, @renderer.domElement.height, parameters );
    @composer = new THREE.EffectComposer(@renderer, @renderTarget)
    @renderModel = new THREE.RenderPass(new THREE.Scene, new THREE.PerspectiveCamera)
    @renderModel.emptyScene = @renderModel.scene
    @renderModel.emptyCamera = @renderModel.camera
    @renderModel.enabled = true
    @composer.addPass @renderModel

    # Todo: Why can't we render without this?
    passthrough = new Passthrough
    passthrough.enabled = true
    passthrough.renderToScreen = true
    @composer.addPass passthrough

    @effectsManager = new EffectsManager @composer
    @effectsPanel = new EffectsPanel(model: @effectsManager)

  eject: () =>
    @setComposition(null)

  setComposition: (comp) ->
    @unload(@get("composition"))
    @set("composition", comp)
    if comp
      comp.set("active", true)
      @listenTo(comp, "destroy", @eject)
      comp.setup(@renderer)
      @renderModel.scene = comp.scene
      @renderModel.camera = comp.camera
    else
      @renderModel.scene = @renderModel.emptyScene
      @renderModel.camera = @renderModel.emptyCamera
      @renderer.clearTarget(@renderTarget, true, true, true)

  unload: (comp) ->
    if comp
      comp.set("active", false)
      @stopListening comp

  load: (effects) ->
    for effect in effects
      @effectsManager.add(effect)

  serialize: () =>
    properties = super
    properties.effects = @effectsManager.serialize()
    properties

  unserialize: (state) =>
    for effectInfo in state.effects
      effect = VJSBindable.inflate(effectInfo)
      @effectsManager.addEffectToStack effect
    state.effects
