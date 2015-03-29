class @BadTVPass extends EffectPassBase
  @effectName: "Bad TV"

  constructor: () ->
    super()
    extend @, GLMethods
    window.eff = @
    @parser = new ISFParser()
    @parser.parse(@ISFFragmentShader, @ISFVertexShader)

    @enabled = true
    @renderToScreen = false
    @needsSwap = true
    
    @uniforms = THREE.UniformsUtils.clone @findUniforms()
    for key, uniformDesc of @uniforms
      if uniformDesc.input
        input = uniformDesc.input
        @inputs.push input
        @listenTo @, "change:#{input.name}", @_inputsChanged
        @set(input.name, input.default || 0)

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene  = new THREE.Scene();

    @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), null)
    @scene.add @quad
    @startTime = Date.now()

  _uniformsChanged: (obj) ->
    for name, value of obj.changed
      uniformDesc = _.find(@uniforms, ((u) -> u.input?.name == name))
      @uniforms[uniformDesc.input.uniform].value = value

  findUniforms: () ->
    # DEFAULT: 0.5MAX: 1MIN: 0NAME: "noiseLevel"TYPE: "float"
    # should be
    # {type: "f", value: 0|THREE.Vector}
    uniforms = {}
    for isfInput in @parser.inputs
      uniform = @typeToUniform(isfInput.TYPE)
      uniform.input = {
        name: isfInput.NAME,
        type: uniform.inputType,
        min: isfInput.MIN || uniform.defaultMin,
        max: isfInput.MAX || uniform.defaultMax,
        default: isfInput.DEFAULT || uniform.default
      }
      uniforms[isfInput.NAME] = uniform
    uniforms

  typeToUniform: (type) ->
    switch type
      when "float" then {type: "f", value: 0, inputType: "number", defaultMin: 0, defaultMax: 1, default: 0.5}
      when "vec2" then {type: "v2", value: new THREE.Vector2}
      when "vec3" then {type: "v3", value: new THREE.Vector3}
      when "vec4" then {type: "v4", value: new THREE.Vector4}
      when "bool" then {type: "i", value: 0}
      when "image" then {type: "t", value: null, inputType: "image"}

  render: (renderer, writeBuffer, readBuffer, delta) =>
    @gl = renderer.context
    @ISFRenderer ||= new ISFRenderer renderer.context, @parser, writeBuffer
    # @ISFRenderer.setUniform("inputImage", readBuffer.__webglTexture)
    # @ISFRenderer.setUniform("inputImage", readBuffer.__webglTexture)
    # @ISFRenderer.render renderer.context.canvas.width, renderer.context.canvas.height, null
 

  ISFVertexShader: """
    varying vec2 left_coord;
    varying vec2 right_coord;
    varying vec2 above_coord;
    varying vec2 below_coord;

    varying vec2 lefta_coord;
    varying vec2 righta_coord;
    varying vec2 leftb_coord;
    varying vec2 rightb_coord;

    void main()
    {
      vv_vertShaderInit();
      vec2 texc = vec2(vv_FragNormCoord[0],vv_FragNormCoord[1]);
      vec2 d = 1.0/RENDERSIZE;
      
      left_coord = clamp(vec2(texc.xy + vec2(-d.x , 0)),0.0,1.0);
      right_coord = clamp(vec2(texc.xy + vec2(d.x , 0)),0.0,1.0);
      above_coord = clamp(vec2(texc.xy + vec2(0,d.y)),0.0,1.0);
      below_coord = clamp(vec2(texc.xy + vec2(0,-d.y)),0.0,1.0);
      
      d = 1.0/RENDERSIZE;
      lefta_coord = clamp(vec2(texc.xy + vec2(-d.x , d.x)),0.0,1.0);
      righta_coord = clamp(vec2(texc.xy + vec2(d.x , d.x)),0.0,1.0);
      leftb_coord = clamp(vec2(texc.xy + vec2(-d.x , -d.x)),0.0,1.0);
      rightb_coord = clamp(vec2(texc.xy + vec2(d.x , -d.x)),0.0,1.0);
    }
  """

  ISFFragmentShader: """/*{
      "CREDIT": "by VIDVOX",
      "CATEGORIES": [
        "Glitch"
      ],
      "INPUTS": [
        {
          "NAME": "inputImage",
          "TYPE": "image"
        },
        {
          "NAME": "noiseLevel",
          "TYPE": "float",
          "MIN": 0.0,
          "MAX": 1.0,
          "DEFAULT": 0.5
        },
        {
          "NAME": "distortion1",
          "TYPE": "float",
          "MIN": 0.0,
          "MAX": 5.0,
          "DEFAULT": 1.0
        },
        {
          "NAME": "distortion2",
          "TYPE": "float",
          "MIN": 0.0,
          "MAX": 5.0,
          "DEFAULT": 5.0
        },
        {
          "NAME": "speed",
          "TYPE": "float",
          "MIN": 0.0,
          "MAX": 1.0,
          "DEFAULT": 0.3
        },
        {
          "NAME": "scroll",
          "TYPE": "float",
          "MIN": 0.0,
          "MAX": 1.0,
          "DEFAULT": 0.0
        },
        {
          "NAME": "scanLineThickness",
          "TYPE": "float",
          "MIN": 1.0,
          "MAX": 50.0,
          "DEFAULT": 25.0
        },
        {
          "NAME": "scanLineIntensity",
          "TYPE": "float",
          "MIN": 0.0,
          "MAX": 1.0,
          "DEFAULT": 0.5
        },
        {
          "NAME": "scanLineOffset",
          "TYPE": "float",
          "MIN": 0.0,
          "MAX": 1.0,
          "DEFAULT": 0.0
        }   
      ]
    }*/

    //  Adapted from http://www.airtightinteractive.com/demos/js/badtvshader/js/BadTVShader.js
    //  Also uses adopted Ashima WebGl Noise: https://github.com/ashima/webgl-noise

    /*
     * The MIT License
     * 
     * Copyright (c) 2014 Felix Turner
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     * 
    */

        
    // Start Ashima 2D Simplex Noise

    const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);

    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec2 mod289(vec2 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec3 permute(vec3 x) {
      return mod289(((x*34.0)+1.0)*x);
    }

    float snoise(vec2 v)  {
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);

      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;

      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))+ i.x + vec3(0.0, i1.x, 1.0 ));

      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;

      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;

      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // End Ashima 2D Simplex Noise

    const float tau = 6.28318530718;

    //  use this pattern for scan lines

    vec2 pattern(vec2 pt) {
      float s = 0.0;
      float c = 1.0;
      vec2 tex = pt * RENDERSIZE;
      vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * (1.0/scanLineThickness);
      float d = point.y;

      return vec2(sin(d + scanLineOffset * tau + cos(pt.x * tau)), cos(d + scanLineOffset * tau + sin(pt.y * tau)));
    }

    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec2 p = vv_FragNormCoord;
      float ty = TIME*speed;
      float yt = p.y - ty;

      //smooth distortion
      float offset = snoise(vec2(yt*3.0,0.0))*0.2;
      // boost distortion
      offset = pow( offset*distortion1,3.0)/max(distortion1,0.001);
      //add fine grain distortion
      offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;
      //combine distortion on X with roll on Y
      vec2 adjusted = vec2(fract(p.x + offset),fract(p.y-scroll) );
      vec4 result = IMG_NORM_PIXEL(inputImage, adjusted);
      vec2 pat = pattern(adjusted);
      vec3 shift = scanLineIntensity * vec3(0.3 * pat.x, 0.59 * pat.y, 0.11) / 2.0;
      result.rgb = (1.0 + scanLineIntensity / 2.0) * result.rgb + shift + (rand(adjusted * TIME) - 0.5) * noiseLevel;
      gl_FragColor = vec4(1.0);

    }
  """
