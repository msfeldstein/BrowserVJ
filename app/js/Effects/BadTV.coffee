class BadTVPass extends ShaderPassBase
  name: "TV Roll"
  constructor: () ->
    super()
    @uniforms.distortion.value = 1
    @uniforms.distortion2.value = .3
    @time = 0

  uniformValues: [
    {uniform: "rollSpeed", name: "Roll Speed", start: 0, end: .01, default: .001}
    {uniform: "speed", name: "Speed", start: 0, end: .1, default: .1}
  ]

  update: () ->
    @time += 1
    @uniforms.time.value = @time

  fragmentShader: """
    uniform sampler2D uTex;
    uniform float time;
    uniform float distortion;
    uniform float distortion2;
    uniform float speed;
    uniform float rollSpeed;
    varying vec2 vUv;
    
    #{ShaderPassBase.ashimaNoiseFunctions}

    void main() {

      vec2 p = vUv;
      float ty = time*speed;
      float yt = p.y - ty;

      //smooth distortion
      float offset = snoise(vec2(yt*3.0,0.0))*0.2;
      // boost distortion
      offset = pow( offset*distortion,3.0)/distortion;
      //add fine grain distortion
      offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;
      //combine distortion on X with roll on Y
      gl_FragColor = texture2D(uTex,  vec2(fract(p.x + offset),fract(p.y-time*rollSpeed) ));
    }
  """