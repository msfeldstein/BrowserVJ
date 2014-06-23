# Automatically render frames, or dont run, and only render when user presses 'r'
RUN = true
# Which class of composition to automatically launch
AUTO_LAUNCH_COMP = null

noise.seed(Math.random())

$ ->
  window.CompositionClasses = [SphereReplication, CircleGrower, SphereSphereComposition, BlobbyComposition, FlameComposition]
  window.application = new App

class App extends Backbone.Model
  constructor: () ->
    window.application = @

    @globalSignals = {}

    @initStats()
    @initSignals()

    @initLayers()

    requestAnimationFrame @animate

    $(".pop-out").click @popout
    if !RUN
        $(document).keydown (e) =>
            if e.keyCode == 82 then @animate()

  animate: () =>
    time = Date.now()
    @signalManager.update(time)
    @mixer.render()
    @stats.update()
    if RUN then requestAnimationFrame @animate

  initLayers: () ->
    @libraryView = new VJSLibraryView()
    canvas = document.querySelector('#output')
    frame = document.querySelector(".output-frame")
    @layer1 = new VJSLayer(name: "Layer 1", canvas: canvas, frame: frame)
    if AUTO_LAUNCH_COMP
      @layer1.setComposition(new AUTO_LAUNCH_COMP)
    @layer1View = new VJSLayerView({model: @layer1})
    @layer2 = new VJSLayer(name: "Layer 2", canvas: canvas, frame: frame)
    @layer2View = new VJSLayerView({model: @layer2})
    outputWindow = document.querySelector(".output-frame")
    @mixer = new VJSLayerMixer({output: outputWindow, canvas: canvas, frame: frame, layers:[@layer1, @layer2]})

    tabs = [
      {name: "Layer 1", view: @layer1View.render()}
      {name: "Layer 2", view: @layer2View.render()}
      {name: "Library", view: @libraryView.render()}
      {name: "Output", view: document.createElement('div')}
    ]

    tabs = new TabSet(document.querySelector('.layers-section'), tabs)

  initStats: () ->
    @stats = new Stats
    document.body.appendChild @stats.domElement

  initSignals: () ->
    @signalManager = new SignalManager
    
    @signalManagerView = new SignalManagerView(model:@signalManager)
    @signalManager.add @midi = new MIDI
    @signalManager.add @clock = new Clock
    @signalManager.add @gamepad = new Gamepad
    @signalManager.add @audio = new AudioInput
    @signalManager.add @keyboard = new Keyboard

    @globalSignals.Clock = @clock
    @globalSignals.Keyboard = @keyboard
    @globalSignals.Audio = @audio

    filters = document.createElement('div')
    filters.textContent = "Filter content"

    set = [
        {name: "Signals", view: @signalManagerView.render()}
    ]

    tabset = new TabSet(document.querySelector('.signal-section'), set)

    @valueBinder = new ValueBinder(model: @signalManager)

