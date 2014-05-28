sketch = """
/*{
  "CREDIT": "by macromeez",
  "CATEGORIES": [
  ],
  "INPUTS": [
    {
      "NAME":"c",
      "TYPE": "color"
    }
  ]
}*/
const float PI = 3.1415;

//
// GLSL textureless classic 2D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-08-22
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;  
  g01 *= norm.y;  
  g10 *= norm.z;  
  g11 *= norm.w;  

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

// Classic Perlin noise, periodic variant
float pnoise(vec2 P, vec2 rep)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, rep.xyxy); // To create noise with explicit period
  Pi = mod289(Pi);        // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;  
  g01 *= norm.y;  
  g10 *= norm.z;  
  g11 *= norm.w;  

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}
void main() {
  vec2 pos = vv_FragNormCoord.xy;
  float r = distance(pos, vec2(0.5));
  float theta = (atan(pos.x - 0.5, pos.y - 0.5) + PI) / (2.0 * PI);
  if (cnoise(vec2(mod(theta * 33.0, PI), TIME / 3.0)) > 0.1)
    gl_FragColor = vec4(c);
  else if (r > 0.25 && r < 0.29)
    gl_FragColor = vec4(1.0);
  else
    gl_FragColor = vec4(0.0);
}

"""

class @ISFComposition extends Composition
  constructor: (file) ->
    super()
    if file
      reader = new FileReader
      reader.file = file
      reader.onload = @fileLoaded
      reader.readAsText(file)
      window.file = file
    else
      @name = "An ISF Comp"
      @loadSource sketch

  fileLoaded: (e) =>
    reader = e.target
    @name = reader.file.name
    @loadSource(reader.result)

  loadSource: (sketch) ->
    window.isfComp = @
    @isf = new ISFParser
    @isf.parse(sketch)
    @fragmentShader = @isf.fragmentShader
    @vertexShader = @isf.vertexShader
    @uniformValues = []
    for input in @isf.inputs
      @uniformValues.push {
        name: input.NAME,
        type: @isfTypeToUniformType(input.TYPE)
        default: @isfUniformDefault(input)
        min: input.MIN || 0
        max: input.MAX || 1
        uniform: input.NAME
      }
    @startTime = (new Date()).getTime() / 1000
    @uniforms = THREE.UniformsUtils.clone @findUniforms(@fragmentShader)
    for uniformDesc in @uniformValues
      @inputs.push {name: uniformDesc.name, type: uniformDesc.type, min: uniformDesc.min, max: uniformDesc.max, default: uniformDesc.default}
      @listenTo @, "change:#{uniformDesc.name}", @_uniformsChanged
      @set uniformDesc.name, uniformDesc.default

  isfTypeToUniformType: (inType) ->
    {
      "color": "color",
      "float": "number"
    }[inType]

  isfUniformDefault: (input) ->
    switch input.TYPE
      when "number" then input.DEFAULT || 0
      when "color" then input.DEFAULT || [1,1,1,1]
      when "bool" then !!input.DEFAULT
      when "event" then !!input.DEFAULT
      when "long" then input.DEFAULT || 0

  update: () ->
    super()
    if !@uniforms then return
    if @uniforms.RENDERSIZE
      @uniforms.RENDERSIZE.value.set(@renderer.domElement.width, @renderer.domElement.height)
    if @uniforms.TIME
      @uniforms.TIME.value = (new Date().getTime()) / 1000 - @startTime
  setup: (renderer) ->
    @renderer = renderer
    @material = new THREE.ShaderMaterial {
      uniforms: @uniforms
      vertexShader: @vertexShader
      fragmentShader: @fragmentShader
    }

    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene = new THREE.Scene

    @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), null)
    @quad.material = @material
    @scene.add @quad

  bindToKey: (property, target, targetProperty) ->
    @listenTo target, "change:#{targetProperty}", @createBinding(property)

  createBinding: (property) =>
    (signal, value) =>
      @set property.name, value

  _uniformsChanged: (obj) =>
    for name, value of obj.changed
      uniformDesc = _.find(@uniformValues, ((u) -> u.name == name))
      @uniforms[uniformDesc.uniform].value = value

  vertexShader: """
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  """

  findUniforms: (shader) ->
    lines = shader.split("\n")
    uniforms = {}
    for line in lines
      if (line.indexOf("uniform") == 0)
        tokens = line.split(" ")
        name = tokens[2].substring(0, tokens[2].length - 1)
        uniforms[name] = @typeToUniform tokens[1]
    uniforms

  typeToUniform: (type) ->
    switch type
      when "float" then {type: "f", value: 0}
      when "vec2" then {type: "v2", value: new THREE.Vector2}
      when "vec3" then {type: "v3", value: new THREE.Vector3}
      when "vec4" then {type: "v4", value: new THREE.Vector4}
      when "bool" then {type: "i", value: 0}
      when "sampler2D" then {type: "t", value: null}
