class CircleGrower extends GLSLComposition
  name: "Circles"
  setup: (@renderer) ->
    super(@renderer)
    @color = new THREE.Color(@get("Color"))


  inputs: [
    {name: "Color", type: "color", default: "#ffffff"}
    {name: "Speed", type: "number", min: -1, max: 1, default: 0.4}
  ]

  uniformValues: [
    {uniform: "circleSize", name: "Number Of Circles", type: "number", min: 0, max: 1, default: .3}
  ]

  "change:Color": (obj, val) =>
    @color.setStyle(val)

  update: () ->
    @uniforms.uSize.value.set(@renderer.domElement.width, @renderer.domElement.height)
    @uniforms.time.value += @get("Speed")
    @uniforms.color.value.set(@color.r, @color.g, @color.b, 1)
  
  fragmentShader: """
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform float circleSize;
    uniform vec4 color;
    uniform float time;
    void main (void)
    {
      float numCircles = circleSize * 10.0;
      float cSize = 1.0 / numCircles;
      vec2 pos = mod(vUv.xy * 2.0 - 1.0, vec2(cSize)) * numCircles - vec2(cSize * numCircles / 2.0);
      float dist = sqrt(dot(pos, pos));
      dist = dist * numCircles + time * -.050;

      gl_FragColor = sin(dist * 2.0) > 0.0 ? color : vec4(0.0);

    }
  """