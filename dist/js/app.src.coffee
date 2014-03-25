class Composition extends Backbone.Model
  constructor: () ->
    super()
    @inputs = @inputs || []
    @outputs = @outputs || []
    @generateThumbnail()
    for input in @inputs
      @set input.name, input.default

  bindToKey: (property, target, targetProperty) ->
    @listenTo target, "change:#{targetProperty}", () =>
      @set property.name, target.get(targetProperty)

  generateThumbnail: () ->
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 1, transparent: true})
    renderer.setSize(640, 480)
    @setup renderer
    renderer.setClearColor( 0xffffff, 0 )
    renderer.render @scene, @camera

    @thumbnail = document.createElement('img')
    @thumbnail.src = renderer.domElement.toDataURL()
    @trigger "thumbnail-available"


class GLSLComposition extends Composition
  uniformValues: []
  constructor: () ->
    super()
    @uniforms = THREE.UniformsUtils.clone @findUniforms(@fragmentShader)
    for uniformDesc in @uniformValues
      @inputs.push {name: uniformDesc.name, type: "number", min: uniformDesc.min, max: uniformDesc.max, default: uniformDesc.default}
      @listenTo @, "change:#{uniformDesc.name}", @_uniformsChanged
      @set uniformDesc.name, uniformDesc.default
      # TODO shouldn't need to do this here, but since it is setup multiple times
      # the change isn't triggered
      @uniforms[uniformDesc.uniform].value = uniformDesc.default 

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

  setup: (renderer) ->
    @renderer = renderer

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

class EffectPassBase extends Backbone.Model
  constructor: () ->
    super()
    @uniformValues = @uniformValues || []
    @options = @options || []
    @inputs = @inputs || []
    @outputs = @outputs || []

    @bindings = {}

  bindToKey: (property, target, targetProperty) ->
    @listenTo target, "change:#{targetProperty}", @createBinding(property)

  createBinding: (property) =>
    (signal, value) =>
      @set property.name, value

class ShaderPassBase extends EffectPassBase
  constructor: (initialValues) ->
    super()
    @enabled = true
    @uniforms = THREE.UniformsUtils.clone @findUniforms(@fragmentShader)
    for uniformDesc in @uniformValues
      @inputs.push {name: uniformDesc.name, type: "number", min: uniformDesc.min, max: uniformDesc.max, default: uniformDesc.default}
      @listenTo @, "change:#{uniformDesc.name}", @_uniformsChanged
      @set uniformDesc.name, uniformDesc.default

    @material = new THREE.ShaderMaterial {
      uniforms: @uniforms
      vertexShader: @vertexShader
      fragmentShader: @fragmentShader
    }

    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene  = new THREE.Scene();

    @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), null)
    @scene.add @quad

  _uniformsChanged: (obj) ->
    for name, value of obj.changed
      uniformDesc = _.find(@uniformValues, ((u) -> u.name == name))
      @uniforms[uniformDesc.uniform].value = value


  render: (renderer, writeBuffer, readBuffer, delta) ->
    @update?()
    if !@enabled
      writeBuffer = readBuffer
      return
    @uniforms['uTex'].value = readBuffer
    if @uniforms['uSize'] then @uniforms['uSize'].value.set(readBuffer.width, readBuffer.height)
    @quad.material = @material
    if @renderToScreen
      renderer.render @scene, @camera
    else
      renderer.render @scene, @camera, writeBuffer, false

  standardUniforms: {
    uTex: {type: 't', value: null}
    uSize: {type: 'v2', value: new THREE.Vector2( 256, 256 )}
  }
  
  vertexShader: """
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  """

  @ashimaNoiseFunctions: """
    //
    // Description : Array and textureless GLSL 2D simplex noise function.
    //      Author : Ian McEwan, Ashima Arts.
    //  Maintainer : ijm
    //     Lastmod : 20110822 (ijm)
    //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
    //               Distributed under the MIT License. See LICENSE file.
    //               https://github.com/ashima/webgl-noise
    // 

    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec2 mod289(vec2 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec3 permute(vec3 x) {
      return mod289(((x*34.0)+1.0)*x);
    }

    float snoise(vec2 v)
      {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
    // First corner
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
      vec2 i1;
      //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
      //i1.y = 1.0 - i1.x;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      // x0 = x0 - 0.0 + 0.0 * C.xx ;
      // x1 = x0 - i1 + 1.0 * C.xx ;
      // x2 = x0 - 1.0 + 2.0 * C.xx ;
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;

    // Permutations
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
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


class VJSSignal extends Backbone.Model
  inputs: []
  outputs: []
  constructor: () ->
    super()
    for input in @inputs
      @set input.name, input.default

  update: (time) ->
    # Override
class AudioInputNode extends Backbone.Model
  @MAX_AUDIO_LEVEL: 200
  constructor: () ->
    super()
    navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia_({audio: true}, @startAudio, (()->))
    @context = new webkitAudioContext()
    @analyzer = @context.createAnalyser()
    @set "selectedFreq", 500

  startAudio: (stream) =>
    mediaStreamSource = @context.createMediaStreamSource(stream)
    mediaStreamSource.connect @analyzer
    requestAnimationFrame @update

  update: () =>
    requestAnimationFrame @update
    if !@data
      @data = new Uint8Array(@analyzer.frequencyBinCount)
      @set "data", @data
    @analyzer.getByteFrequencyData(@data);
    @set "peak", @data[@get('selectedFreq')] / AudioInputNode.MAX_AUDIO_LEVEL
    @trigger "change:data"

SPEED = 1 / 20000

class BlobbyComposition extends Composition
  name: "Blobby"

  inputs: [
    {name: "Level", type: "number", min: 0, max: 1, default: 0}
    {name: "Speed", type: "number", min: 0, max: 1, default: .1}
  ]
  setup: (@renderer) ->
    @time = 0
    @scene = new THREE.Scene
    @scene.fog = new THREE.FogExp2( 0x000000, 0.0005 );
    @camera = new THREE.PerspectiveCamera(75, @renderer.domElement.width / @renderer.domElement.height, 1, 10000);
    @camera.position.z = 1000;

    sprite = new THREE.ImageUtils.loadTexture("assets/disc.png")
    sprite.premultiplyAlpha = true
    sprite.needsUpdate = true
    geometry = new THREE.Geometry
    for i in [0..1000]
      vtx = new THREE.Vector3
      vtx.x = 500 * Math.random() - 250
      vtx.y = 500 * Math.random() - 250
      vtx.z = 500 * Math.random() - 250
      vtx.seed = i
      geometry.vertices.push vtx
    material = new THREE.ParticleSystemMaterial({size: 135, map: sprite, transparent: true})
    material.color.setHSL( 1.0, 0.3, 0.7 );
    material.opacity = 0.2
    material.blending = THREE.AdditiveBlending
    @particles = new THREE.ParticleSystem geometry, material
    @particles.sortParticles = true
    @scene.add @particles

  update: () ->
    @time += .01 * @get("Speed")
    @particles.rotation.y += 0.01

    a = @get("Level") * 500
    a = a + 1
    a = Math.max a, 60
    for vertex in @particles.geometry.vertices
      vertex.x = noise.simplex2(@time, vertex.seed) * a
      vertex.y = noise.simplex2(vertex.seed, @time) * a
      vertex.z = noise.simplex2(@time + vertex.seed, vertex.seed) * a


class CircleGrower extends GLSLComposition
  name: "Circles"
  setup: (@renderer) ->
    super(@renderer)

  uniformValues: [
    {uniform: "circleSize", name: "Number Of Circles", min: 1, max: 10, default: 4}
  ]

  update: () ->
    @uniforms['uSize'].value.set(@renderer.domElement.width, @renderer.domElement.height)
    @uniforms['time'].value += 1
  
  fragmentShader: """
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform float circleSize;
    uniform float time;
    void main (void)
    {
      float cSize = 1.0 / circleSize;
      vec2 pos = mod(vUv.xy * 2.0 - 1.0, vec2(cSize)) * circleSize - vec2(cSize * circleSize / 2.0);
      float dist = sqrt(dot(pos, pos));
      dist = dist * circleSize + time * -.050;

      gl_FragColor = sin(dist * 2.0) > 0.0 ? vec4(1.0) : vec4(0.0);

    }
  """
class FlameComposition extends GLSLComposition
  name: "Flame"
  update: () ->
    @uniforms['uSize'].value.set(@renderer.domElement.width, @renderer.domElement.height)
    @uniforms['time'].value += .04
  fragmentShader: """
    const int _VolumeSteps = 32;
    const float _StepSize = 0.1; 
    const float _Density = 0.2;

    const float _SphereRadius = 2.0;
    const float _NoiseFreq = 1.0;
    const float _NoiseAmp = 3.0;
    const vec3 _NoiseAnim = vec3(0, -1.0, 0);
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform float time;


    // iq's nice integer-less noise function

    // matrix to rotate the noise octaves
    mat3 m = mat3( 0.00,  0.80,  0.60,
                  -0.80,  0.36, -0.48,
                  -0.60, -0.48,  0.64 );

    float hash( float n )
    {
        return fract(sin(n)*43758.5453);
    }


    float noise( in vec3 x )
    {
        vec3 p = floor(x);
        vec3 f = fract(x);

        f = f*f*(3.0-2.0*f);

        float n = p.x + p.y*57.0 + 113.0*p.z;

        float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                            mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                        mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                            mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
        return res;
    }

    float fbm( vec3 p )
    {
        float f;
        f = 0.5000*noise( p ); p = m*p*2.02;
        f += 0.2500*noise( p ); p = m*p*2.03;
        f += 0.1250*noise( p ); p = m*p*2.01;
        f += 0.0625*noise( p );
        //p = m*p*2.02; f += 0.03125*abs(noise( p )); 
        return f;
    }

    // returns signed distance to surface
    float distanceFunc(vec3 p)
    { 
      float d = length(p) - _SphereRadius;  // distance to sphere
      
      // offset distance with pyroclastic noise
      //p = normalize(p) * _SphereRadius; // project noise point to sphere surface
      d += fbm(p*_NoiseFreq + _NoiseAnim*time) * _NoiseAmp;
      return d;
    }

    // color gradient 
    // this should be in a 1D texture really
    vec4 gradient(float x)
    {
      // no constant array initializers allowed in GLES SL!
      const vec4 c0 = vec4(2, 2, 1, 1); // yellow
      const vec4 c1 = vec4(1, 0, 0, 1); // red
      const vec4 c2 = vec4(0, 0, 0, 0);   // black
      const vec4 c3 = vec4(0, 0.5, 1, 0.5);   // blue
      const vec4 c4 = vec4(0, 0, 0, 0);   // black
      
      x = clamp(x, 0.0, 0.999);
      float t = fract(x*4.0);
      vec4 c;
      if (x < 0.25) {
        c =  mix(c0, c1, t);
      } else if (x < 0.5) {
        c = mix(c1, c2, t);
      } else if (x < 0.75) {
        c = mix(c2, c3, t);
      } else {
        c = mix(c3, c4, t);   
      }
      //return vec4(x);
      //return vec4(t);
      return c;
    }

    // shade a point based on distance
    vec4 shade(float d)
    { 
      // lookup in color gradient
      return gradient(d);
      //return mix(vec4(1, 1, 1, 1), vec4(0, 0, 0, 0), smoothstep(1.0, 1.1, d));
    }

    // procedural volume
    // maps position to color
    vec4 volumeFunc(vec3 p)
    {
      float d = distanceFunc(p);
      return shade(d);
    }

    // ray march volume from front to back
    // returns color
    vec4 rayMarch(vec3 rayOrigin, vec3 rayStep, out vec3 pos)
    {
      vec4 sum = vec4(0, 0, 0, 0);
      pos = rayOrigin;
      for(int i=0; i<_VolumeSteps; i++) {
        vec4 col = volumeFunc(pos);
        col.a *= _Density;
        //col.a = min(col.a, 1.0);
        
        // pre-multiply alpha
        col.rgb *= col.a;
        sum = sum + col*(1.0 - sum.a);  
    #if 0
        // exit early if opaque
              if (sum.a > _OpacityThreshold)
                    break;
    #endif    
        pos += rayStep;
      }
      return sum;
    }

    void main(void)
    {
        vec2 p = (vUv.xy)*2.0-1.0;
      
        float rotx = time * .05;
        float roty = time * .04;

        float zoom = 4.0;

        // camera
        vec3 ro = zoom*normalize(vec3(cos(roty), cos(rotx), sin(roty)));
        vec3 ww = normalize(vec3(0.0,0.0,0.0) - ro);
        vec3 uu = normalize(cross( vec3(0.0,1.0,0.0), ww ));
        vec3 vv = normalize(cross(ww,uu));
        vec3 rd = normalize( p.x*uu + p.y*vv + 1.5*ww );

        ro += rd*2.0;
      
        // volume render
        vec3 hitPos;
        vec4 col = rayMarch(ro, rd*_StepSize, hitPos);
        //vec4 col = gradient(p.x);
          
        gl_FragColor = col;
    }
  """
class SphereSphereComposition extends Composition
  name: "Spherize"
  setup: (@renderer) ->
    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    @camera.position.z = 1000;
    @origin = new THREE.Vector3 0, 0, 0
    @group = new THREE.Object3D
    @scene.add @group
    

    sprite = new THREE.ImageUtils.loadTexture("assets/disc.png")
    sprite.premultiplyAlpha = true
    sprite.needsUpdate = true
    geometry = new THREE.Geometry
    for size in [400]
      res = 80
      skeleton = new THREE.SphereGeometry(size, res, res)
      for vertex in skeleton.vertices
        geometry.vertices.push vertex
      material = new THREE.ParticleSystemMaterial({size: 35, map: sprite, transparent: true})
      material.blending = THREE.AdditiveBlending
      material.opacity = 0.2
      @particles = new THREE.ParticleSystem geometry, material
      @particles.sortParticles = true
      @group.add @particles

    light = new THREE.SpotLight 0xFFFFFF
    light.position.set 1000, 1000, 300
    @scene.add light

    light = new THREE.AmbientLight 0x222222
    @scene.add light

    ambient = new THREE.PointLight( 0x444444, 1, 10000 );
    ambient.position.set 500, 500, 500
    @scene.add ambient

    ambient = new THREE.PointLight( 0x444444, 1, 10000 );
    ambient.position.set -500, 500, 500
    @scene.add ambient
  update: () ->
    @group.rotation.y += 0.001
    @group.rotation.z += 0.0001
    @group.rotation.x += 0.00014

  addCube: (group, position) ->
    mesh = new THREE.Mesh @sphereGeometry, @sphereMaterial
    mesh.position = position
    mesh.lookAt @origin
    @group.add mesh

class VideoComposition extends Backbone.Model
  name: "Video"
  constructor: (@videoFile) ->
    super()
    if @videoFile
      @name = @videoFile.name
      videoTag = document.createElement('video')
      videoTag.src = URL.createObjectURL(@videoFile)
      videoTag.addEventListener 'loadeddata', (e) =>
        videoTag.currentTime = videoTag.duration / 2
        canvas = document.createElement('canvas')
        canvas.width = videoTag.videoWidth
        canvas.height = videoTag.videoHeight
        context = canvas.getContext('2d')
        f = () =>
          if videoTag.readyState != videoTag.HAVE_ENOUGH_DATA
            setTimeout f, 100
            return
          context.drawImage videoTag, 0, 0
          @thumbnail = document.createElement('img')
          @thumbnail.src = canvas.toDataURL()
          videoTag.pause()
          videoTag = null
          @trigger "thumbnail-available"
        setTimeout f, 100


  setup: (@renderer) ->
    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene = new THREE.Scene

    @video = document.createElement 'video'
    if @videoFile
      @video.src = URL.createObjectURL(@videoFile)
    else
      @video.src = "assets/timescapes.mp4"
    @video.load()
    @video.play()
    @video.volume = 0
    window.video = @video
    @video.addEventListener 'loadeddata', () =>
      @videoImage = document.createElement 'canvas'
      @videoImage.width = @video.videoWidth
      @videoImage.height = @video.videoHeight

      @videoImageContext = @videoImage.getContext('2d')
      @videoTexture = new THREE.Texture(@videoImage)
      @videoTexture.minFilter = THREE.LinearFilter;
      @videoTexture.magFilter = THREE.LinearFilter;
      @material = new THREE.MeshBasicMaterial(map: @videoTexture)


      @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), @material)
      @scene.add @quad

  update: () ->
    if @videoTexture
      @videoImageContext.drawImage @video, 0, 0
      @videoTexture.needsUpdate = true
class BadTVPass extends ShaderPassBase
  name: "TV Roll"
  constructor: () ->
    super()
    @uniforms.distortion.value = 1
    @uniforms.distortion2.value = .3
    @time = 0

  uniformValues: [
    {uniform: "rollSpeed", name: "Roll Speed", start: 0, end: .01, default: .001}
    {uniform: "speed", name: "Speed", start: 0, end: .1, default: .1}
  ]

  update: () ->
    @time += 1
    @uniforms.time.value = @time

  fragmentShader: """
    uniform sampler2D uTex;
    uniform float time;
    uniform float distortion;
    uniform float distortion2;
    uniform float speed;
    uniform float rollSpeed;
    varying vec2 vUv;
    
    #{ShaderPassBase.ashimaNoiseFunctions}

    void main() {

      vec2 p = vUv;
      float ty = time*speed;
      float yt = p.y - ty;

      //smooth distortion
      float offset = snoise(vec2(yt*3.0,0.0))*0.2;
      // boost distortion
      offset = pow( offset*distortion,3.0)/distortion;
      //add fine grain distortion
      offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;
      //combine distortion on X with roll on Y
      gl_FragColor = texture2D(uTex,  vec2(fract(p.x + offset),fract(p.y-time*rollSpeed) ));
    }
  """
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

class ChromaticAberration extends ShaderPassBase
    name: "Chromatic Aberration"
    @name: "Chromatic Aberration"
    uniformValues: [
      {uniform: "rShift", name: "Red Shift", min: -1, max: 1, default: -.2}
      {uniform: "gShift", name: "Green Shift", min: -1, max: 1, default: -.2}
      {uniform: "bShift", name: "Blue Shift", min: -1, max: 1, default: -.2}
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

class InvertPass extends ShaderPassBase
  name: "Invert"
  @name: "Invert"
  uniformValues: [
    {uniform: "amount", name: "Invert Amount", min: 0, max: 1, default: 0}
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

class MirrorPass extends ShaderPassBase
  name: "Mirror"
  @name: "Mirror"
  fragmentShader: """
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform sampler2D uTex;

    void main (void)
    {
      vec4 color = texture2D(uTex, vUv);
      vec2 flipPos = vec2(0.0);
      flipPos.x = 1.0 - vUv.x;
      flipPos.y = vUv.y;
      gl_FragColor = color + texture2D(uTex, flipPos);
    }
  """

class ShroomPass extends ShaderPassBase
  constructor: () ->
    super amp: 0, StartRad: 0, freq: 10

  name: "Wobble"
  @name: "Wobble"
  uniformValues: [
    {uniform: "amp", name: "Strength", start: 0, end: 0.01}
  ]
  options: [
    {property: "speed", name: "Speed", start: .001, end: .01, default: 0.005}
  ]
  update: () ->
    @uniforms.StartRad.value += @speed
    
  fragmentShader: """
    // Constants
    const float C_PI    = 3.1415;
    const float C_2PI   = 2.0 * C_PI;
    const float C_2PI_I = 1.0 / (2.0 * C_PI);
    const float C_PI_2  = C_PI / 2.0;

    uniform float StartRad;
    uniform float freq;
    uniform float amp;
    uniform vec2 uSize;
    varying vec2 vUv;

    uniform sampler2D uTex;

    void main (void)
    {
        vec2  perturb;
        float rad;
        vec4  color;

        // Compute a perturbation factor for the x-direction
        rad = (vUv.s + vUv.t - 1.0 + StartRad) * freq;

        // Wrap to -2.0*PI, 2*PI
        rad = rad * C_2PI_I;
        rad = fract(rad);
        rad = rad * C_2PI;

        // Center in -PI, PI
        if (rad >  C_PI) rad = rad - C_2PI;
        if (rad < -C_PI) rad = rad + C_2PI;

        // Center in -PI/2, PI/2
        if (rad >  C_PI_2) rad =  C_PI - rad;
        if (rad < -C_PI_2) rad = -C_PI - rad;

        perturb.x  = (rad - (rad * rad * rad / 6.0)) * amp;

        // Now compute a perturbation factor for the y-direction
        rad = (vUv.s - vUv.t + StartRad) * freq;

        // Wrap to -2*PI, 2*PI
        rad = rad * C_2PI_I;
        rad = fract(rad);
        rad = rad * C_2PI;

        // Center in -PI, PI
        if (rad >  C_PI) rad = rad - C_2PI;
        if (rad < -C_PI) rad = rad + C_2PI;

        // Center in -PI/2, PI/2
        if (rad >  C_PI_2) rad =  C_PI - rad;
        if (rad < -C_PI_2) rad = -C_PI - rad;

        perturb.y  = (rad - (rad * rad * rad / 6.0)) * amp;
        vec2 pos = vUv.st;
        pos.x = 1.0 - pos.x;
        color = texture2D(uTex, perturb + pos);

        gl_FragColor = vec4(color.rgb, color.a);
    }
  """

class WashoutPass extends ShaderPassBase
  fragmentShader: """
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform float amount;
    uniform sampler2D uTex;

    void main (void)
    {
      vec4 color = texture2D(uTex, vUv);
      gl_FragColor = color * (1.0 + amount);
    }
  """

class Passthrough extends ShaderPassBase
  name: "Passthrough"
  @name: "Passthrough"
  fragmentShader: """
    uniform vec2 uSize;
    varying vec2 vUv;
    uniform sampler2D uTex;

    void main (void)
    {
        gl_FragColor = texture2D(uTex, vUv);
    }
  """

class Node
  constructor: () ->
    @inputs = []
    @outputs = []


noise.seed(Math.random())

$ ->
  window.application = new App

class App extends Backbone.Model
  constructor: () ->
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 1, transparent: true})
    outputWindow = document.querySelector(".output")
    @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)

    outputWindow.appendChild(@renderer.domElement);

    @initCompositions()
    @initEffects()
    @initStats()
    @initMicrophone()
    @initSignals()
    @setComposition new CircleGrower
    requestAnimationFrame @animate

    $(window).resize () =>
        @renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight)

  animate: () =>
    time = Date.now()
    @signalManager.update(time)
    @composition?.update({audio: @audioVisualizer.level || 0})
    @composer.render()
    @stats.update()
    requestAnimationFrame @animate

  initCompositions: () ->
    @compositionPicker = new CompositionPicker
    @compositionPicker.addComposition new CircleGrower
    @compositionPicker.addComposition new SphereSphereComposition
    @compositionPicker.addComposition new BlobbyComposition
    @compositionPicker.addComposition new FlameComposition

    @inspector = new CompositionInspector
  
  initEffects: () ->
    @composer = new THREE.EffectComposer(@renderer)
    @renderModel = new THREE.RenderPass(new THREE.Scene, new THREE.PerspectiveCamera)
    @renderModel.enabled = true
    @composer.addPass @renderModel

    # Todo: Why can we render without this?
    passthrough = new Passthrough
    passthrough.enabled = true
    passthrough.renderToScreen = true
    @composer.addPass passthrough

    @effectsManager = new EffectsManager @composer
    @effectsManager.registerEffect MirrorPass
    @effectsManager.registerEffect InvertPass
    @effectsManager.registerEffect ChromaticAberration
    @effectsManager.registerEffect MirrorPass

    @effectsPanel = new EffectsPanel(model: @effectsManager)
    @effectsManager.addEffectToStack new ChromaticAberration

  initStats: () ->
    @stats = new Stats
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.right = '20px'
    @stats.domElement.style.top = '0px'
    document.body.appendChild @stats.domElement

  initMicrophone: () ->
    @audioInputNode = new AudioInputNode
    @audioVisualizer = new AudioVisualizer model: @audioInputNode

  initSignals: () ->
    @signalManager = new SignalManager
    @signalManager.registerSignal LFO
    @signalManagerView = new SignalManagerView(model:@signalManager)
    @signalManager.add new LFO
    @valueBinder = new ValueBinder(model: @signalManager)

  startAudio: (stream) =>
    mediaStreamSource = @context.createMediaStreamSource(stream)
    mediaStreamSource.connect @analyzer

  setComposition: (comp) ->
    @composition = comp
    @composition.setup(@renderer)
    @inspector.setComposition @composition
    @renderModel.scene = @composition.scene
    @renderModel.camera = @composition.camera


class Gamepad
  @FACE_1: 0
  @FACE_2: 1
  @FACE_3: 2
  @FACE_4: 3
  @LEFT_SHOULDER: 4
  @RIGHT_SHOULDER: 5
  @LEFT_SHOULDER_BOTTOM: 6
  @RIGHT_SHOULDER_BOTTOM: 7
  @SELECT: 8
  @START: 9
  @LEFT_ANALOGUE_STICK: 10
  @RIGHT_ANALOGUE_STICK: 11
  @PAD_TOP: 12
  @PAD_BOTTOM: 13
  @PAD_LEFT: 14
  @PAD_RIGHT: 15
  @STICK_1: 16
  @STICK_2: 17

  @BUTTONS = [@FACE_1, @FACE_2, @FACE_3, @FACE_4, @LEFT_SHOULDER, @RIGHT_SHOULDER, @LEFT_SHOULDER_BOTTOM, @RIGHT_SHOULDER_BOTTOM, @SELECT, @START, @LEFT_ANALOGUE_STICK, @RIGHT_ANALOGUE_STICK, @PAD_TOP, @PAD_BOTTOM, @PAD_LEFT, @PAD_RIGHT]

  constructor: () ->
    @pad = null
    @callbacks = {}
    @callbacks[Gamepad.STICK_1] = []
    @callbacks[Gamepad.STICK_2] = []
    @buttonStates = {}
    for button in Gamepad.BUTTONS
      @buttonStates[button] = 0
    requestAnimationFrame @checkForPad

  checkForPad: () =>
    if navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0]
      @pad = navigator.webkitGetGamepads()[0]
      requestAnimationFrame @checkButtons
    else
      requestAnimationFrame @checkForPad

  checkButtons: () =>
    @pad = navigator.webkitGetGamepads()[0]
    requestAnimationFrame @checkButtons
    for button in Gamepad.BUTTONS
      if @callbacks[button] && @buttonStates[button] != @pad.buttons[button]
        @buttonStates[button] = @pad.buttons[button]
        for buttonId, callback of @callbacks[button]
          callback(@pad.buttons[button])
    for callback in @callbacks[Gamepad.STICK_1]
      callback({x:@pad.axes[0],y:@pad.axes[1]})
    for callback in @callbacks[Gamepad.STICK_2]
      callback({x:@pad.axes[2],y:@pad.axes[3]})


  addEventListener: (button, callback) ->
    if !@callbacks[button] then @callbacks[button] = []
    @callbacks[button].push callback

class RGBShiftPass
  constructor: (r,g,b) ->
    shader = new RGBShiftShader
    @uniforms = THREE.UniformsUtils.clone shader.uniforms
    @uniforms['uRedShift'].value = r
    @uniforms['uGreenShift'].value = g
    @uniforms['uBlueShift'].value = b

    @material = new THREE.ShaderMaterial {
      uniforms: @uniforms
      vertexShader: shader.vertexShader
      fragmentShader: shader.fragmentShader
    }

    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene  = new THREE.Scene();

    @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), null)
    @scene.add @quad

  render: (renderer, writeBuffer, readBuffer, delta) ->
    @uniforms['uTex'].value = readBuffer
    @uniforms['uSize'].value.set(readBuffer.width, readBuffer.height)
    @quad.material = @material
    if @renderToScreen
      renderer.render @scene, @camera
    else
      renderer.render @scene, @camera, writeBuffer, false

class RGBShiftShader
  uniforms: {
    uTex: {type: 't', value: null}
    uSize: {type: 'v2', value: new THREE.Vector2( 256, 256 )}
    uRedShift: {type: 'f', value: 0.0}
    uGreenShift: {type: 'f', value: 0.0}
    uBlueShift: {type: 'f', value: 1.0}

  }
  
  vertexShader: """
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  """

  fragmentShader: """
    uniform sampler2D uTex;
    uniform float uRedShift;
    uniform float uGreenShift;
    uniform float uBlueShift;
    uniform vec2 uSize;

    varying vec2 vUv;

    void main() {
      float r = texture2D(uTex, (vUv - 0.5) * vec2(uRedShift, 1.0) + 0.5).r;
      float g = texture2D(uTex, (vUv - 0.5) * vec2(uGreenShift, 1.0) + 0.5).g;
      float b = texture2D(uTex, (vUv - 0.5) * vec2(uBlueShift, 1.0) + 0.5).b;
      
      gl_FragColor = vec4(r,g,b,1.0);
    }
  """

class AudioVisualizer extends Backbone.View
  el: ".audio-analyzer"

  events:
    "mousemove canvas": "drag"
    "mouseout canvas": "mouseOut"
    "click canvas": "clickCanvas"

  initialize: () ->
    @canvas = document.createElement 'canvas'
    @el.appendChild @canvas
    @canvas.width = @el.offsetWidth
    @canvas.height = 200
    @hoveredFreq = null
    @listenTo @model, "change:data", @update

  update: () =>
    data = @model.get('data')
    selectedFreq = @model.get('selectedFreq')
    if !data then return
    @scale = @canvas.width / data.length

    ctx = @canvas.getContext('2d')
    ctx.save()
    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.fillRect(0, 0, @canvas.width, @canvas.height);
    ctx.translate(0, @canvas.height)
    ctx.scale @scale, @scale
    ctx.translate(0, -@canvas.height)
    ctx.beginPath()
    ctx.strokeStyle = "#FF0000"
    ctx.moveTo 0, @canvas.height
    for amp, i in data
      ctx.lineTo(i, @canvas.height - amp)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = "#FF0000"
    ctx.moveTo selectedFreq, @canvas.height
    ctx.lineTo selectedFreq, 0
    ctx.stroke()

    if @hoveredFreq
      ctx.beginPath()
      ctx.strokeStyle = "#FFFFFF"
      ctx.moveTo @hoveredFreq, 0
      ctx.lineTo @hoveredFreq, @canvas.height
      ctx.stroke()

    
    @level = @model.get('peak') * @canvas.height
    ctx.restore()
    ctx.fillStyle = "#FF0000"
    ctx.fillRect @canvas.width - 10, @canvas.height - @level, 10, @canvas.height    

  render: () =>
    @el

  drag: (e) =>
    @hoveredFreq = parseInt(e.offsetX / @scale)

  mouseOut: (e) =>
    @hoveredFreq = null

  clickCanvas: (e) =>
    @model.set "selectedFreq", parseInt(e.offsetX / @scale)


class CompositionInspector extends Backbone.View
  el: ".inspector"
  initialize: () ->
    @label = @el.querySelector('.label')
    @stack = @el.querySelector('.stack')
  
  setComposition: (composition) ->
    view = new SignalUIBase(model: composition)
    @stack.innerHTML = ''
    @stack.appendChild view.render()

  render: () =>


class CompositionPicker extends Backbone.View
  el: ".composition-picker"

  events:
    "dragover": "dragover"
    "dragleave": "dragleave"
    "drop": "drop"
  
  constructor: () ->
    super()
    @compositions = []
  dragover: (e) =>
    e.preventDefault()
    @el.classList.add 'dragover'

  dragleave: (e) =>
    e.preventDefault()
    @el.classList.remove 'dragover'
  
  drop:  (e) =>
    e.preventDefault()
    @el.classList.remove 'dragover'
    file = e.originalEvent.dataTransfer.files[0]
    composition = new VideoComposition file
    @addComposition composition

  addComposition: (comp) ->
    slot = new CompositionSlot(model: comp)
    @el.appendChild slot.render()

  render: () =>
    @el

class CompositionSlot extends Backbone.View
  className: 'slot'
  events:
    "click img": "launch"

  initialize: () =>
    super()
    @listenTo @model, "thumbnail-available", @render

  render: () =>
    @$el.html(@model.thumbnail)
    @el

  launch: () =>
    application.setComposition @model


class EffectsManager extends Backbone.Model
  constructor: (@composer) ->
    super()
    @effectClasses = []
    @stack = []

  registerEffect: (effectClass) ->
    @effectClasses.push effectClass
    @trigger "change"

  addEffectToStack: (effect) ->
    @stack.push effect
    @composer.insertPass effect, @composer.passes.length - 1
    @trigger "add-effect", effect

class EffectParameter extends Backbone.Model


class EffectControl extends Backbone.View
  className: "effect-control"
  initialize: () ->

  render: () ->
    @el.textContent = @model.get("name")

class EffectsPanel extends Backbone.View
  el: ".effects"
  events:
    "change .add-effect": "addEffect"
  initialize: () ->
    @addButton = document.createElement 'select'
    @addButton.className = 'add-effect'
    @stack = document.createElement 'div'
    @el.appendChild @stack
    @el.appendChild @addButton
    @listenTo @model, "change", @render
    @listenTo @model, "add-effect", @insertEffectPanel
    @render()

  insertEffectPanel: (effect) =>
    effectParameter = new SignalUIBase model: effect
    @stack.appendChild effectParameter.render()

  addEffect: (e) =>
    if e.target.value != -1
      @model.addEffectToStack new @model.effectClasses[e.target.value]
      e.target.selectedIndex = 0

  render: () =>
    @addButton.innerHTML = "<option value=-1>Add Effect</option>"
    for effect, i in @model.effectClasses
      option = document.createElement 'option'
      option.value = i
      option.textContent = effect.name
      @addButton.appendChild option
    

class LFO extends VJSSignal
  inputs: [
    {name: "period", type: "number", min: 0, max: 10, default: 2}
    {name: "type", type: "select", options: ["Sin", "Square", "Triangle", "Sawtooth Up", "Sawtooth Down"], default: "Sin"}
  ]
  outputs: [
    {name: "value", type: "number", min: 0, max: 1}
  ]
  name: "LFO"
  initialize: () ->
    super()
    
  update: (time) ->
    time = time / 1000
    period = @get("period")
    value = 0
    switch @get("type")
      when "Sin"
        value = Math.sin(Math.PI * time / (period)) * .5 + .5
      when "Square"
        value = Math.round(Math.sin(Math.PI * time / (period)) * .5 + .5)
      when "Sawtooth Up"
        value = (time / period)
        value = value - Math.floor(value)
      when "Sawtooth Down"
        value = (time / period)
        value = 1 - (value - Math.floor(value))

    @set "value", value

class SignalManager extends Backbone.Collection
  constructor: () ->
    super([], {model: VJSSignal})
    @signalClasses = []

  registerSignal: (signalClass) ->
    @signalClasses.push signalClass
    @trigger 'change:registration'

  update: (time) ->
    for signal in @models
      signal.update(time)

class SignalManagerView extends Backbone.View
  el: ".signals"
  events:
    "change .add-signal": "addSignal"

  initialize: () ->
    @views = []
    @listenTo @model, "add", @createSignalView
    @listenTo @model, "change:registration", @render
    @addButton = document.createElement 'select'
    @addButton.className = 'add-signal'
    @stack = document.createElement 'div'
    @el.appendChild @stack
    @el.appendChild @addButton
    @render()

  addSignal: (e) =>
    if e.target.value != -1
      @model.add new @model.signalClasses[e.target.value]
      e.target.selectedIndex = 0

  render: () =>
    @addButton.innerHTML = "<option value=-1>Add Signal</option>"
    for signal, i in @model.signalClasses
      option = document.createElement 'option'
      option.value = i
      option.textContent = signal.name
      @addButton.appendChild option

  createSignalView: (signal) =>
    @views.push view = new SignalUIBase(model: signal)
    @stack.appendChild view.render()
class SignalUIBase extends Backbone.View
  className: "signal-set"

  initialize: () ->
    console.log @model
    @el.appendChild arrow = document.createElement 'div'
    arrow.className = "arrow"
    @el.appendChild label = document.createElement 'div'
    label.textContent = @model.name
    label.className = 'label'
    arrow.addEventListener 'click', @clickLabel
    for input in @model.inputs
      @el.appendChild div = document.createElement 'div'
      div.className = "signal"
      div.textContent = input.name
      if input.type == "number"
        div.appendChild @newSlider(@model, input).render()
      else if input.type == "select"
        div.appendChild @newSelect(@model, input).render()

    if @model.outputs?.length > 0
      @el.appendChild document.createElement 'hr'
    for output in @model.outputs
      @el.appendChild div = document.createElement 'div'
      div.className = "signal"
      div.textContent = output.name
      if output.type == "number"
        div.appendChild @newSlider(@model, output).render()

  clickLabel: () =>
    @$el.toggleClass 'hidden'

  render: () ->
    @el

  newSlider: (model, input) ->
    slider = new VJSSlider(model, input)

  newSelect: (model, input) ->
    new VJSSelect(model, input)
# Model is a module, being an effect or a signal patch
class VJSSlider extends Backbone.View
  events: 
    "click .slider": "click"
    "mousedown .slider": "dragBegin"

  constructor:(model, @property) ->
    super(model: model)

  initialize: () ->
    div = document.createElement 'div'
    div.className = 'slider'
    div.appendChild @level = document.createElement 'div'
    @level.className = 'level'
    @el.appendChild div
    @$el.on "contextmenu", @showBindings

    @max = @property.max
    @min = @property.min
    @listenTo @model, "change:#{@property.name}", @render
    @render()

  dragBegin: (e) =>
    $(document).on 
      'mousemove': @dragMove
      'mouseup': @dragEnd
    @click(e)

  dragMove: (e) =>
    @click(e)

  dragEnd: (e) =>
    $(document).off
      'mousemove': @dragMove
      'mouseup': @dragEnd

  click: (e) =>
    x = e.pageX - @el.offsetLeft
    percent = x / @el.clientWidth
    value = (@max - @min) * percent + @min
    value = Math.clamp(value, @min, @max)
    @model.set(@property.name, value)

  render: () => 
    value = @model.get(@property.name)
    percent = (value - @min) / (@max - @min) * 100
    @level.style.width = "#{percent}%"
    @el

  showBindings: (e) =>
    e.preventDefault()
    el = window.application.valueBinder.render()
    window.application.valueBinder.show(@model, @property)
    el.style.top = e.pageY + "px"
    el.style.left = e.pageX + "px"

class VJSSelect extends Backbone.View
  events: 
    "change select": "change"
  constructor: (model, @property) ->
    super(model: model)

  initialize: () ->
    @el.appendChild div = document.createElement 'div'
    div.appendChild select = document.createElement 'select'
    for option in @property.options
      select.appendChild opt = document.createElement 'option'
      opt.value = option
      opt.textContent = option

  change: (e) =>
    @model.set(@property.name, e.target.value)
    
  render: () =>
    @el
class ValueBinder extends Backbone.View
  className: "popup"
  events: 
    "click .binding-row": "clickRow"

  initialize: () ->
    document.body.appendChild @el

  render: () =>
    @el.textContent = "Bindings"
    @el.appendChild document.createElement 'hr'
    for signal in @model.models
      row = document.createElement 'div'
      row.className = 'binding-label'
      row.textContent = signal.name
      @el.appendChild row
      for output in signal.outputs
        @el.appendChild outputRow = document.createElement 'div'
        outputRow.className = 'binding-row'
        outputRow.textContent = output.name
        outputRow.signal = signal
        outputRow.property = output.name
    @el

  clickRow: (e) =>
    target = e.target
    signal = target.signal
    property = target.property
    observer = @currentModel
    console.log observer, observer.bind
    observer.bindToKey @currentProperty, signal, property
    @hide()

  show: (model, property) =>
    @currentModel = model
    @currentProperty = property
    $(document).on "keydown", @keydown
    $(document).on "mousedown", @mousedown
    @$el.show()
  
  hide: () =>
    $(document).off "keydown", @keydown
    $(document).off "mousedown", @mousedown
    @$el.hide()

  mousedown: (e) =>
    if $(e.target).closest(".popup").length == 0
      @hide()

  keydown: (e) =>
    if e.keyCode == 27
      @hide()



Math.clamp = (val, min, max) ->
  Math.min(max, Math.max(val, min))


