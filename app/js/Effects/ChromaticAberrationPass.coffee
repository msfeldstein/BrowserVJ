class ChromaticAberration extends ShaderPassBase
    name: "Chromatic Aberration"
    @name: "Chromatic Aberration"
    uniformValues: [
      {uniform: "rShift", name: "Red Shift", start: -1, end: 1, default: -.2}
      {uniform: "gShift", name: "Green Shift", start: -1, end: 1, default: 0}
      {uniform: "bShift", name: "Blue Shift", start: -1, end: 1, default: .21}
    ]
    fragmentShader: """
      uniform float rShift;
      uniform float gShift;
      uniform float bShift;
      uniform vec2 uSize;
      varying vec2 vUv;
      uniform sampler2D uTex;

      void main (void)
      {
          float r = texture2D(uTex, vUv + vec2(rShift * 0.01, 0.0)).r;
          float g = texture2D(uTex, vUv + vec2(gShift * 0.01, 0.0)).g;
          float b = texture2D(uTex, vUv + vec2(bShift * 0.01, 0.0)).b;
          float a = max(r, max(g, b));
          gl_FragColor = vec4(r, g, b, a);
      }
    """
