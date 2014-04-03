class InkPass extends ShaderPassBase
  @effectName: "Ink"

  fragmentShader: """
    uniform sampler2D uTex;
    uniform float strength; //input name: "Strength", type: "number", min: 0, max: 10, default: 0.2
    uniform vec2 uSize;
    varying vec2 vUv;
    void main() {
        vec2 dx = vec2(1.0 / uSize.x, 0.0);
        vec2 dy = vec2(0.0, 1.0 / uSize.y);
        vec4 color = texture2D(uTex, vUv);
        float bigTotal = 0.0;
        float smallTotal = 0.0;
        vec3 bigAverage = vec3(0.0);
        vec3 smallAverage = vec3(0.0);
        for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
                vec3 sample = texture2D(uTex, vUv + dx * x + dy * y).rgb;
                bigAverage += sample;
                bigTotal += 1.0;
                if (abs(x) + abs(y) < 2.0) {
                    smallAverage += sample;
                    smallTotal += 1.0;
                }
            }
        }
        vec3 edge = max(vec3(0.0), bigAverage / bigTotal - smallAverage / smallTotal);
        gl_FragColor = vec4(color.rgb - dot(edge, edge) * strength * 100000.0, color.a);
    }
  """