class @FeedbackPass extends EffectPassBase
  @effectName: "Feedback"

  inputs: [
    {name: "Opacity", type: "number", min: 0, max: 1, default: 0.5}
  ]
  constructor: (height, width) ->
    super()
    @needsSwap = true
    @enabled = true
    parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false , depthBuffer: false};
    canvas = document.querySelector('#output')
    @fboWrite = new THREE.WebGLRenderTarget( canvas.width, canvas.height, parameters );
    @fboRead = new THREE.WebGLRenderTarget( canvas.width, canvas.height, parameters );
    
    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene = new THREE.Scene
    @feedbackMaterial = new THREE.MeshBasicMaterial(map: @fboRead)
    @feedbackMaterial.depthTest = false
    @feedbackMaterial.transparent = true;
    quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), @feedbackMaterial)
    @scene.add quad

    @drawMaterial = new THREE.MeshBasicMaterial()
    @drawMaterial.depthTest = false
    @drawMaterial.transparent = true;
    quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), @drawMaterial)
    @scene.add quad

  swapBuffers: () ->
    tmp = @fboWrite
    @fboWrite = @fboRead
    @fboRead = tmp

  render: (renderer, writeBuffer, readBuffer, delta) ->
    @feedbackMaterial.map = @fboRead
    @feedbackMaterial.opacity = @get("Opacity")
    @drawMaterial.map = readBuffer
    renderer.render @scene, @camera, writeBuffer, false
    renderer.render @scene, @camera, @fboWrite, false
    @swapBuffers()
