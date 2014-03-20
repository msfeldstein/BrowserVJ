class RGBShiftPass
  constructor: (r,g,b) ->
    shader = new RGBShiftShader
    @uniforms = THREE.UniformsUtils.clone shader.uniforms
    @uniforms['uRedShift'].value = r
    @uniforms['uGreenShift'].value = g
    @uniforms['uBlueShift'].value = b

    @material = new THREE.ShaderMaterial {
      uniforms: @uniforms
      vertexShader: shader.vertexShader
      fragmentShader: shader.fragmentShader
    }

    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene  = new THREE.Scene();

    @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), null)
    @scene.add @quad

  render: (renderer, writeBuffer, readBuffer, delta) ->
    @uniforms['uTex'].value = readBuffer
    @uniforms['uSize'].value.set(readBuffer.width, readBuffer.height)
    @quad.material = @material
    if @renderToScreen
      renderer.render @scene, @camera
    else
      renderer.render @scene, @camera, writeBuffer, false

class RGBShiftShader
  uniforms: {
    uTex: {type: 't', value: null}
    uSize: {type: 'v2', value: new THREE.Vector2( 256, 256 )}
    uRedShift: {type: 'f', value: 0.0}
    uGreenShift: {type: 'f', value: 0.0}
    uBlueShift: {type: 'f', value: 1.0}

  }
  
  vertexShader: """
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  """

  fragmentShader: """
    uniform sampler2D uTex;
    uniform float uRedShift;
    uniform float uGreenShift;
    uniform float uBlueShift;
    uniform vec2 uSize;

    varying vec2 vUv;

    void main() {
      float r = texture2D(uTex, (vUv - 0.5) * vec2(uRedShift, 1.0) + 0.5).r;
      float g = texture2D(uTex, (vUv - 0.5) * vec2(uGreenShift, 1.0) + 0.5).g;
      float b = texture2D(uTex, (vUv - 0.5) * vec2(uBlueShift, 1.0) + 0.5).b;
      
      gl_FragColor = vec4(r,g,b,1.0);
    }
  """