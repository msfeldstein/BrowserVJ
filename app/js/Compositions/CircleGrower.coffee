class CircleGrower extends GLSLComposition
  name: "Circles"
  setup: (@renderer) ->
    super(@renderer)

  uniformValues: [
    {uniform: "circleSize", name: "Number Of Circles", min: 1, max: 10, default: 4}
  ]

  update: () ->
    @uniforms['uSize'].value.set(@renderer.domElement.width, @renderer.domElement.height)
    @uniforms['time'].value += 1
  
  fragmentShader: """
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform float circleSize;
    uniform float time;
    void main (void)
    {
      float cSize = 1.0 / circleSize;
      vec2 pos = mod(vUv.xy * 2.0 - 1.0, vec2(cSize)) * circleSize - vec2(cSize * circleSize / 2.0);
      float dist = sqrt(dot(pos, pos));
      dist = dist * circleSize + time * -.050;

      gl_FragColor = sin(dist * 2.0) > 0.0 ? vec4(1.0) : vec4(0.0);

    }
  """