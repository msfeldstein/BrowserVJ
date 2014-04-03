class DotRollPass extends ShaderPassBase
  @effectName: "Rolling Dot Screen"
  
  constructor: () ->
    super()
    @time = 0

  update: () ->
    @time += 1
    @uniforms.time.value = @time

  fragmentShader: """
    uniform sampler2D uTex;
    uniform float rollSpeed;
    uniform float time;
    varying vec2 vUv;
    uniform vec2 uSize;

    const float circleSize = 17.0;
    void main() {
      vec2 p = mod(gl_FragCoord.xy, vec2(circleSize));
      p -= vec2(circleSize / 2.0);
      float dist = sqrt(dot(p, p));
      if (dist + 3.0 < circleSize / 2.1)
        gl_FragColor = texture2D(uTex, vUv);
      else
        discard;
    }
  """