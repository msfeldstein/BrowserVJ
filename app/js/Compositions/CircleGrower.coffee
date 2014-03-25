class CircleGrower extends GLSLComposition
  name: "Circles"
  setup: (@renderer) ->
    super(@renderer)

  uniformValues: [
    {uniform: "circleSize", name: "Number Of Circles", min: 0, max: 1, default: .2}
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
      float numCircles = circleSize * 10.0;
      float cSize = 1.0 / numCircles;
      vec2 pos = mod(vUv.xy * 2.0 - 1.0, vec2(cSize)) * numCircles - vec2(cSize * numCircles / 2.0);
      float dist = sqrt(dot(pos, pos));
      dist = dist * numCircles + time * -.050;

      gl_FragColor = sin(dist * 2.0) > 0.0 ? vec4(1.0) : vec4(0.0);

    }
  """