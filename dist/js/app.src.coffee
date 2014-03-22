class @ShaderPassBase
  constructor: (initialValues) ->
    @enabled = true
    @uniforms = THREE.UniformsUtils.clone @findUniforms(@fragmentShader)
    for key, value of initialValues
      @uniforms[key].value = value

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


class Composition extends Backbone.Model
  constructor: () ->
    super()
    @generateThumbnail()

  generateThumbnail: () ->
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 0, transparent: true})
    renderer.setSize(140, 90)
    @setup renderer
    renderer.render @scene, @camera
    @thumbnail = document.createElement('img')
    @thumbnail.src = renderer.domElement.toDataURL()
    @trigger "thumbnail-available"


class GLSLComposition extends Composition
  setup: (@renderer) ->
    @uniforms = THREE.UniformsUtils.clone @findUniforms(@fragmentShader)
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

SPEED = 1 / 20000

class @Wanderer
  constructor: (@mesh) ->
    requestAnimationFrame(@update);
    @seed = Math.random() * 1000
  update: (t) =>
    t = t * SPEED + @seed
    @mesh.x = noise.simplex2(t, 0) * 600
    @mesh.y = noise.simplex2(0, t) * 300
    @mesh.z = noise.simplex2(t * 1.1 + 300, 0) * 100
    requestAnimationFrame(@update);

class BlobbyComposition extends Composition
  setup: (@renderer) ->
    @time = 0
    @scene = new THREE.Scene
    @scene.fog = new THREE.FogExp2( 0x000000, 0.0005 );
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    @camera.position.z = 1000;

    sprite = new THREE.ImageUtils.loadTexture("assets/disc.png")
    sprite.premultiplyAlpha = true
    sprite.needsUpdate = true
    geometry = new THREE.Geometry
    for i in [0..3000]
      vtx = new THREE.Vector3
      vtx.x = 500 * Math.random() - 250
      vtx.y = 500 * Math.random() - 250
      vtx.z = 500 * Math.random() - 250
      vtx.seed = i
      geometry.vertices.push vtx
    material = new THREE.ParticleSystemMaterial({size: 135, map: sprite, transparent: true})
    material.color.setHSL( 1.0, 0.3, 0.7 );
    material.opacity = 0.1
    material.blending = THREE.AdditiveBlending
    @particles = new THREE.ParticleSystem geometry, material
    @particles.sortParticles = true
    @scene.add @particles

  update: () ->
    @time += .001
    @particles.rotation.y += 0.001
    for vertex in @particles.geometry.vertices
      vertex.x = noise.simplex2(@time, vertex.seed) * 500 * (Math.abs(Math.sin(@time * 25)) + .01)
      vertex.y = noise.simplex2(vertex.seed, @time) * 500 * (Math.abs(Math.sin(@time * 25)) + .01)
      vertex.z = noise.simplex2(@time + vertex.seed, vertex.seed) * 500 * (Math.abs(Math.sin(@time * 25)) + .01)


class CircleGrower extends GLSLComposition
  setup: (@renderer) ->
    super(@renderer)
    @uniforms.circleSize.value = 300

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
      vec2 pos = mod(gl_FragCoord.xy, vec2(circleSize)) - vec2(circleSize / 2.0);
      float dist = sqrt(dot(pos, pos));
      dist = mod(dist + time * -1.0, circleSize + 1.0) * 2.0;
      
      gl_FragColor = (sin(dist / 25.0) > 0.0) 
          ? vec4(.90, .90, .90, 1.0)
          : vec4(0.0);
    }
  """
class SphereSphereComposition extends Composition
  setup: (@renderer) ->
    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    @camera.position.z = 1000;
    @origin = new THREE.Vector3 0, 0, 0
    @group = new THREE.Object3D
    @scene.add @group
    @sphereGeometry = new THREE.SphereGeometry(10, 32, 32)
    @sphereMaterial = new THREE.MeshPhongMaterial({
      transparent: false
      opacity: 1
      color: 0xDA8258
      specular: 0xD67484
      shininess: 10
      ambient: 0xAAAAAA
      shading: THREE.FlatShading
    })
    for size in [400]#[200, 300, 400]
      res = 50
      skeleton = new THREE.SphereGeometry(size, res, res)
      for vertex in skeleton.vertices
        @addCube @group, vertex

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

  addCube: (group, position) ->
    mesh = new THREE.Mesh @sphereGeometry, @sphereMaterial
    mesh.position = position
    mesh.lookAt @origin
    @group.add mesh


class VideoComposition extends Backbone.Model
  constructor: (@videoFile) ->
    super()
    if @videoFile
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
    uniformValues: [
      {uniform: "rShift", name: "Red Shift", start: -1, end: 1, default: -1}
      {uniform: "gShift", name: "Green Shift", start: -1, end: 1, default: 0}
      {uniform: "bShift", name: "Blue Shift", start: -1, end: 1, default: 1}
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

class MirrorPass extends ShaderPassBase
  name: "Mirror"
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

class @ShaderPassBase
  constructor: (initialValues) ->
    @enabled = true
    @uniforms = THREE.UniformsUtils.clone @findUniforms(@fragmentShader)
    for key, value of initialValues
      @uniforms[key].value = value

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


noise.seed(Math.random())

$ ->
  window.application = new App

class App extends Backbone.Model
  constructor: () ->
    @renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, clearAlpha: 1, transparent: true})
    @renderer.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(@renderer.domElement);

    @gui = new dat.gui.GUI

    @initCompositions()
    @initPostProcessing()
    @initStats()
    @setComposition new BlobbyComposition

  animate: () =>
    @composition?.update()
    @composer.render()
    @stats.update()
    requestAnimationFrame @animate

  initCompositions: () ->
    @compositionPicker = new CompositionPicker
    document.body.appendChild @compositionPicker.render()
    @compositionPicker.addComposition new CircleGrower
    @compositionPicker.addComposition new SphereSphereComposition
    @compositionPicker.addComposition new BlobbyComposition
  
  initPostProcessing: () ->
    @composer = new THREE.EffectComposer(@renderer)
    @renderModel = new THREE.RenderPass(new THREE.Scene, new THREE.PerspectiveCamera)
    @renderModel.renderToScreen = true
    @composer.addPass @renderModel
    @addEffect new MirrorPass
    @addEffect new InvertPass
    @addEffect new ChromaticAberration
    @addEffect new BadTVPass
    @addEffect p = new ShroomPass
    p.enabled = true
    p.renderToScreen = true

  initStats: () ->
    @stats = new Stats
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.left = '0px'
    @stats.domElement.style.top = '0px'
    document.body.appendChild @stats.domElement

  setComposition: (comp) ->
    @composition = comp
    @composition.setup(@renderer)
    @renderModel.scene = @composition.scene
    @renderModel.camera = @composition.camera
    requestAnimationFrame @animate
    
  addEffect: (effect) ->
    effect.enabled = false
    @composer.addPass effect
    f = @gui.addFolder effect.name
    f.add(effect, "enabled")
    if effect.options
      for values in effect.options
        if values.default then effect[values.property] = values.default
        f.add(effect, values.property, values.start, values.end).name(values.name) 
    if effect.uniformValues
      for values in effect.uniformValues
        if values.default
          effect.uniforms[values.uniform].value = values.default
        f.add(effect.uniforms[values.uniform], "value", values.start, values.end).name(values.name)

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
class CompositionPicker extends Backbone.View
  className: 'composition-picker'

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

