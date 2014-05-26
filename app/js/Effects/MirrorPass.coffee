class @MirrorPass extends ShaderPassBase
  @effectName: "Mirror"
  
  fragmentShader: """
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform sampler2D uTex;

    void main (void)
    {
      vec4 color = texture2D(uTex, vUv);
      vec2 flipPos = vec2(0.0);
      flipPos.x = 1.0 - vUv.x;
      flipPos.y = vUv.y;
      gl_FragColor = color + texture2D(uTex, flipPos);
    }
  """
