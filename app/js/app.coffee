

noise.seed(Math.random())

$ ->
  window.CompositionClasses = [CircleGrower, SphereSphereComposition, BlobbyComposition, FlameComposition]
  window.application = new App

class App extends Backbone.Model
  constructor: () ->
    window.application = @
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 1, transparent: true})
    outputWindow = document.querySelector(".output")
    @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)

    outputWindow.appendChild(@renderer.domElement);

    @initCompositions()
    @initEffects()
    @initStats()
    @initSignals()

    requestAnimationFrame @animate

    $(".pop-out").click @popout

    $(window).resize () =>
        @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)

  popout: () =>
    @outputWindow = window.open("/output.html")

  setOutputCanvas: (canvas) =>
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 1, transparent: true, canvas: canvas})
    @composer.renderer = @renderer
    @initEffects()

  animate: () =>
    time = Date.now()
    @signalManager.update(time)
    @composition?.update()
    @composer.render()
    @stats.update()
    requestAnimationFrame @animate

  initCompositions: () ->
    @compositionPicker = new CompositionPicker
    for clazz in CompositionClasses
      @compositionPicker.addComposition new clazz
    @inspector = new CompositionInspector
    compositionPicker2 = new CompositionPicker
    for clazz in CompositionClasses
      compositionPicker2.addComposition new clazz

    tabs = [
      {name: "Layer 1", view: @compositionPicker.render()}
      {name: "Layer 2", view: compositionPicker2.render()}
      {name: "Output", view: document.createElement('div')}
    ]

    tabs = new TabSet(document.querySelector('.layers-section'), tabs)
  
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

  initStats: () ->
    @stats = new Stats
    document.body.appendChild @stats.domElement

  initSignals: () ->
    @signalManager = new SignalManager
    @signalManager.registerSignal LFO
    @signalManager.registerSignal Clock
    @signalManager.registerSignal Palette
    @signalManager.registerSignal ColorGenerator
    @signalManager.registerSignal Sequencer
    
    @signalManagerView = new SignalManagerView(model:@signalManager)
    @signalManager.add @midi = new MIDI
    @signalManager.add @clock = new Clock
    @signalManager.add @gamepad = new Gamepad
    @signalManager.add @audio = new AudioInput
    @signalManager.add new Sequencer

    filters = document.createElement('div')
    filters.textContent = "Filter content"

    set = [
        {name: "Signals", view: @signalManagerView.render()}
        {name: "Signal Filters", view: filters}
    ]

    tabset = new TabSet(document.querySelector('.signal-section'), set)

    @valueBinder = new ValueBinder(model: @signalManager)


  startAudio: (stream) =>
    mediaStreamSource = @context.createMediaStreamSource(stream)
    mediaStreamSource.connect @analyzer

  setComposition: (comp) ->
    @composition = comp
    @composition.setup(@renderer)
    @inspector.setComposition @composition
    @renderModel.scene = @composition.scene
    @renderModel.camera = @composition.camera

