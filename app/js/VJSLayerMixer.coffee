class VJSLayerMixer extends Backbone.Model
  initialize: () ->
    super()
    @output = @get("output")
    @canvas = @get("canvas")
    @canvas.width = @output.offsetWidth
    @canvas.height = @output.offsetHeight
    $(window).resize () =>
      @canvas.width = @output.offsetWidth
      @canvas.height = @output.offsetHeight
    @initRenderer()


  initRenderer: () =>
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 0, transparent: true, canvas: @canvas})
    outputWindow = document.querySelector(".output-frame")
    @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)
    $(window).resize () =>
      @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)
    @composer = new THREE.EffectComposer(@renderer)
    @compositePass = new VJSMixerRenderPass(@get("layers"))
    @compositePass.setup(@renderer)
    @composer.addPass @compositePass

  render: () =>
    for layer in @get("layers")
      layer.render()
    @compositePass.render(@renderer)
class VJSMixerRenderPass
  constructor: (@layers) ->
    @layerSets = []

  setup: (@renderer) ->
    @enabled = true
    @renderToScreen = true
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene = new THREE.Scene
    for layer in @layers
      material = new THREE.MeshBasicMaterial(map: layer.texture())
      material.depthTest = false
      material.transparent = true;
      quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material)
      @scene.add quad
      @layerSets.push(layer: layer, material: material)

  render: (renderer, writeBuffer, readBuffer, delta) =>
    for layerSet in @layerSets
      mat = layerSet.material
      layer = layerSet.layer
      mat.blending = THREE["#{layer.get('Blend Mode')}Blending"]
      mat.opacity = layer.get("opacity")
    renderer.render(@scene, @camera);
