class InvertPass extends ShaderPassBase
  @effectName: "Invert"

  fragmentShader: """
    uniform float amount; //input name: "Invert Amount", type: "number", min: 0, max: 1, default: 0
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform sampler2D uTex;

    void main (void)
    {
        vec4 color = texture2D(uTex, vUv);
        color = (1.0 - amount) * color + (amount) * (1.0 - color);
        gl_FragColor = vec4(color.rgb, color.a);
    }
  """
