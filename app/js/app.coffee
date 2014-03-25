noise.seed(Math.random())

$ ->
  window.application = new App

class App extends Backbone.Model
  constructor: () ->
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 1, transparent: true})
    outputWindow = document.querySelector(".output")
    @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)

    outputWindow.appendChild(@renderer.domElement);

    @initCompositions()
    @initEffects()
    @initStats()
    @initMicrophone()
    @initSignals()
    @setComposition new CircleGrower
    requestAnimationFrame @animate

    $(window).resize () =>
        @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)

  animate: () =>
    time = Date.now()
    @signalManager.update(time)
    @composition?.update({audio: @audioVisualizer.level || 0})
    @composer.render()
    @stats.update()
    requestAnimationFrame @animate

  initCompositions: () ->
    @compositionPicker = new CompositionPicker
    @compositionPicker.addComposition new CircleGrower
    @compositionPicker.addComposition new SphereSphereComposition
    @compositionPicker.addComposition new BlobbyComposition
    @compositionPicker.addComposition new FlameComposition

    @inspector = new CompositionInspector
  
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

    @effectsPanel = new EffectsPanel(model: @effectsManager)
    @effectsManager.addEffectToStack new ChromaticAberration

  initStats: () ->
    @stats = new Stats
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.right = '20px'
    @stats.domElement.style.top = '0px'
    document.body.appendChild @stats.domElement

  initMicrophone: () ->
    @audioInputNode = new AudioInputNode
    @audioVisualizer = new AudioVisualizer model: @audioInputNode

  initSignals: () ->
    @signalManager = new SignalManager
    @signalManager.registerSignal LFO
    @signalManagerView = new SignalManagerView(model:@signalManager)
    @signalManager.add new LFO
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

