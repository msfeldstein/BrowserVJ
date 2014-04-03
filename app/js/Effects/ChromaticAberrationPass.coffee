class ChromaticAberration extends ShaderPassBase
    @effectName: "Chromatic Aberration"

    fragmentShader: """
      uniform float rShift; //input name: "Red Shift", type: "number", min: 0, max: 1, default: 0.5
      uniform float gShift; //input name: "Green Shift", type: "number", min: 0, max: 1, default: 0.5
      uniform float bShift; //input name: "Blue Shift", type: "number", min: 0, max: 1, default: 0.5
      uniform vec2 uSize;
      varying vec2 vUv;
      uniform sampler2D uTex;

      void main (void)
      {
          float r = texture2D(uTex, vUv + vec2((2.0 * rShift - 1.0) * 0.05, 0.0)).r;
          float g = texture2D(uTex, vUv + vec2((2.0 * gShift - 1.0) * 0.05, 0.0)).g;
          float b = texture2D(uTex, vUv + vec2((2.0 * bShift - 1.0) * 0.05, 0.0)).b;
          float a = max(r, max(g, b));
          gl_FragColor = vec4(r, g, b, a);
      }
    """
