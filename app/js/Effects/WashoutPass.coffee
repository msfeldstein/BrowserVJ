class WashoutPass extends ShaderPassBase
  fragmentShader: """
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform float amount;
    uniform sampler2D uTex;

    void main (void)
    {
      vec4 color = texture2D(uTex, vUv);
      gl_FragColor = color * (1.0 + amount);
    }
  """
