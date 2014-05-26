class @Passthrough extends ShaderPassBase
  @effectName: "Passthrough"

  fragmentShader: """
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform sampler2D uTex;

    void main (void)
    {
        gl_FragColor = texture2D(uTex, vUv);
    }
  """
