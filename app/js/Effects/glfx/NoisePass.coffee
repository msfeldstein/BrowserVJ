class NoisePass extends ShaderPassBase
  @effectName: "Add Noise"

  fragmentShader: """
    uniform sampler2D uTex;
    uniform float time;
    uniform float amount; //input name: "Amount", type: "number", min: 0, max: 1
    varying vec2 vUv;
    float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }
    void main() {
      vec4 color = texture2D(uTex, vUv);
      
      float diff = (rand(vUv + time) - 0.5) * amount;
      color.r += diff;
      color.g += diff;
      color.b += diff;
      
      gl_FragColor = color;
    }
  """