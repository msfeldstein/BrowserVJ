class BlurPass extends ShaderPassBase
  @name: "Blur"
  fragmentShader: """
    uniform float blurX;
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform sampler2D uTex;

    const float blurSize = 1.0/512.0; // I've chosen this size because this will result in that every step will be one pixel wide if the RTScene texture is of size 512x512
     
    void main(void)
    {
       vec4 sum = vec4(0.0);
     
       // blur in y (vertical)
       // take nine samples, with the distance blurSize between them
       sum += texture2D(uTex, vec2(vUv.x - 4.0*blurX, vUv.y)) * 0.05;
       sum += texture2D(uTex, vec2(vUv.x - 3.0*blurX, vUv.y)) * 0.09;
       sum += texture2D(uTex, vec2(vUv.x - 2.0*blurX, vUv.y)) * 0.12;
       sum += texture2D(uTex, vec2(vUv.x - blurX, vUv.y)) * 0.15;
       sum += texture2D(uTex, vec2(vUv.x, vUv.y)) * 0.16;
       sum += texture2D(uTex, vec2(vUv.x + blurX, vUv.y)) * 0.15;
       sum += texture2D(uTex, vec2(vUv.x + 2.0*blurX, vUv.y)) * 0.12;
       sum += texture2D(uTex, vec2(vUv.x + 3.0*blurX, vUv.y)) * 0.09;
       sum += texture2D(uTex, vec2(vUv.x + 4.0*blurX, vUv.y)) * 0.05;
     
       gl_FragColor = sum;
    }
  """
