

noise.seed(Math.random())

$ ->
  window.CompositionClasses = [CircleGrower, SphereSphereComposition, BlobbyComposition, FlameComposition]
  window.application = new App

class App extends Backbone.Model
  constructor: () ->
    window.application = @

    @initStats()
    @initSignals()

    @initLayers()

    requestAnimationFrame @animate

    $(".pop-out").click @popout

  popout: () =>
    @outputWindow = window.open("/output.html")

  setOutputCanvas: (canvas) =>
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 1, transparent: true, canvas: canvas})
    @composer.renderer = @renderer
    @initEffects()

  animate: () =>
    time = Date.now()
    @signalManager.update(time)
    @mixer.render()
    @stats.update()
    requestAnimationFrame @animate

  initLayers: () ->
    @layer1 = new VJSLayer("Layer 1")
    @layer1View = new VJSLayerView({model: @layer1})
    @layer2 = new VJSLayer("Layer 2")
    @layer2View = new VJSLayerView({model: @layer2})
    outputWindow = document.querySelector(".output-frame")
    @mixer = new VJSLayerMixer({output: outputWindow, layers:[@layer1, @layer2]})

    tabs = [
      {name: "Layer 1", view: @layer1View.render()}
      {name: "Layer 2", view: @layer2View.render()}
      {name: "Output", view: document.createElement('div')}
    ]

    tabs = new TabSet(document.querySelector('.layers-section'), tabs)

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

