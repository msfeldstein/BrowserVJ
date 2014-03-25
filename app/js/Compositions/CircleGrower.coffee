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
      float cSize = uSize.x / circleSize;
      vec2 pos = mod(gl_FragCoord.xy, vec2(cSize)) - vec2(cSize / 2.0);
      float dist = sqrt(dot(pos, pos));
      dist = mod(dist + time * -1.0, cSize + 1.0) * 2.0;
      
      gl_FragColor = (sin(dist / 25.0) > 0.0) 
          ? vec4(.90, .90, .90, 1.0)
          : vec4(0.0);
    }
  """