class KaleidoscopePass extends ShaderPassBase
  name: "Kaleidoscope"
  @name: "Kaleidoscope"
  fragmentShader: """
    uniform float amount;
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform float size; //input name: "Number of Sections", type: "number", min:1, max:12, default:6, step:1
    uniform sampler2D uTex;
    uniform float time;
    uniform float fromCenter; //input name: "From Center", type: "boolean", toggle:true, default: true

    const float NUM_SIDES = 6.0;
    const float PI = 3.14159265359;
    const float DEG_TO_RAD = PI / 180.0;

    vec2 Kaleidoscope( vec2 uv, float n, float bias ) {
      float angle = PI / n;
      
      float r = length( uv );
      float a = atan( uv.y, uv.x ) / angle;
      
      a = mix( fract( a ), 1.0 - fract( a ), mod( floor( a ), 2.0 ) ) * angle;
      
      return vec2( cos( a ), sin( a ) ) * r;
    }


    void main(void)
    {
      vec2 uv = mix(vUv, vUv * 2.0 - 1.0, fromCenter);
      uv = Kaleidoscope( uv * 2.0, size, time * 0.5 );
      gl_FragColor =  texture2D(uTex,uv*.5);
    }
  """
