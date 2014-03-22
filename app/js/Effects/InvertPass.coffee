class InvertPass extends ShaderPassBase
  name: "Invert"
  @name: "Invert"
  uniformValues: [
    {uniform: "amount", name: "Invert Amount", start: 0, end: 1}
  ]
  fragmentShader: """
    uniform float amount;
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
