(function() {
  var App, AudioInputNode, AudioVisualizer, BadTVPass, BlobbyComposition, BlurPass, ChromaticAberration, CircleGrower, Composition, CompositionInspector, CompositionPicker, CompositionSlot, EffectControl, EffectParameter, EffectPassBase, EffectsManager, EffectsPanel, FlameComposition, GLSLComposition, Gamepad, InvertPass, LFO, MirrorPass, Node, Passthrough, RGBShiftPass, RGBShiftShader, SPEED, ShaderPassBase, ShroomPass, SignalManager, SignalManagerView, SignalUIBase, SphereSphereComposition, VJSSelect, VJSSignal, VJSSlider, ValueBinder, VideoComposition, WashoutPass,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Composition = (function(_super) {
    __extends(Composition, _super);

    function Composition() {
      var input, _i, _len, _ref;
      Composition.__super__.constructor.call(this);
      this.inputs = this.inputs || [];
      this.outputs = this.outputs || [];
      this.generateThumbnail();
      _ref = this.inputs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        this.set(input.name, input["default"]);
      }
    }

    Composition.prototype.bindToKey = function(property, target, targetProperty) {
      return this.listenTo(target, "change:" + targetProperty, (function(_this) {
        return function() {
          return _this.set(property.name, target.get(targetProperty));
        };
      })(this));
    };

    Composition.prototype.generateThumbnail = function() {
      var renderer;
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        clearAlpha: 1,
        transparent: true
      });
      renderer.setSize(640, 480);
      this.setup(renderer);
      renderer.setClearColor(0xffffff, 0);
      renderer.render(this.scene, this.camera);
      this.thumbnail = document.createElement('img');
      this.thumbnail.src = renderer.domElement.toDataURL();
      return this.trigger("thumbnail-available");
    };

    return Composition;

  })(Backbone.Model);

  GLSLComposition = (function(_super) {
    __extends(GLSLComposition, _super);

    GLSLComposition.prototype.uniformValues = [];

    function GLSLComposition() {
      this._uniformsChanged = __bind(this._uniformsChanged, this);
      this.createBinding = __bind(this.createBinding, this);
      var uniformDesc, _i, _len, _ref;
      GLSLComposition.__super__.constructor.call(this);
      this.uniforms = THREE.UniformsUtils.clone(this.findUniforms(this.fragmentShader));
      _ref = this.uniformValues;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        uniformDesc = _ref[_i];
        this.inputs.push({
          name: uniformDesc.name,
          type: "number",
          min: uniformDesc.min,
          max: uniformDesc.max,
          "default": uniformDesc["default"]
        });
        this.listenTo(this, "change:" + uniformDesc.name, this._uniformsChanged);
        this.set(uniformDesc.name, uniformDesc["default"]);
        this.uniforms[uniformDesc.uniform].value = uniformDesc["default"];
      }
      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader
      });
      this.enabled = true;
      this.renderToScreen = false;
      this.needsSwap = true;
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.scene = new THREE.Scene;
      this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
      this.quad.material = this.material;
      this.scene.add(this.quad);
    }

    GLSLComposition.prototype.setup = function(renderer) {
      return this.renderer = renderer;
    };

    GLSLComposition.prototype.bindToKey = function(property, target, targetProperty) {
      return this.listenTo(target, "change:" + targetProperty, this.createBinding(property));
    };

    GLSLComposition.prototype.createBinding = function(property) {
      return (function(_this) {
        return function(signal, value) {
          return _this.set(property.name, value);
        };
      })(this);
    };

    GLSLComposition.prototype._uniformsChanged = function(obj) {
      var name, uniformDesc, value, _ref, _results;
      _ref = obj.changed;
      _results = [];
      for (name in _ref) {
        value = _ref[name];
        uniformDesc = _.find(this.uniformValues, (function(u) {
          return u.name === name;
        }));
        _results.push(this.uniforms[uniformDesc.uniform].value = value);
      }
      return _results;
    };

    GLSLComposition.prototype.vertexShader = "varying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

    GLSLComposition.prototype.findUniforms = function(shader) {
      var line, lines, name, tokens, uniforms, _i, _len;
      lines = shader.split("\n");
      uniforms = {};
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (line.indexOf("uniform") === 0) {
          tokens = line.split(" ");
          name = tokens[2].substring(0, tokens[2].length - 1);
          uniforms[name] = this.typeToUniform(tokens[1]);
        }
      }
      return uniforms;
    };

    GLSLComposition.prototype.typeToUniform = function(type) {
      switch (type) {
        case "float":
          return {
            type: "f",
            value: 0
          };
        case "vec2":
          return {
            type: "v2",
            value: new THREE.Vector2
          };
        case "vec3":
          return {
            type: "v3",
            value: new THREE.Vector3
          };
        case "vec4":
          return {
            type: "v4",
            value: new THREE.Vector4
          };
        case "bool":
          return {
            type: "i",
            value: 0
          };
        case "sampler2D":
          return {
            type: "t",
            value: null
          };
      }
    };

    return GLSLComposition;

  })(Composition);

  EffectPassBase = (function(_super) {
    __extends(EffectPassBase, _super);

    function EffectPassBase() {
      this.createBinding = __bind(this.createBinding, this);
      EffectPassBase.__super__.constructor.call(this);
      this.uniformValues = this.uniformValues || [];
      this.options = this.options || [];
      this.inputs = this.inputs || [];
      this.outputs = this.outputs || [];
      this.bindings = {};
    }

    EffectPassBase.prototype.bindToKey = function(property, target, targetProperty) {
      return this.listenTo(target, "change:" + targetProperty, this.createBinding(property));
    };

    EffectPassBase.prototype.createBinding = function(property) {
      return (function(_this) {
        return function(signal, value) {
          return _this.set(property.name, value);
        };
      })(this);
    };

    return EffectPassBase;

  })(Backbone.Model);

  ShaderPassBase = (function(_super) {
    __extends(ShaderPassBase, _super);

    function ShaderPassBase(initialValues) {
      var uniformDesc, _i, _len, _ref;
      ShaderPassBase.__super__.constructor.call(this);
      this.enabled = true;
      this.uniforms = THREE.UniformsUtils.clone(this.findUniforms(this.fragmentShader));
      _ref = this.uniformValues;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        uniformDesc = _ref[_i];
        this.inputs.push({
          name: uniformDesc.name,
          type: "number",
          min: uniformDesc.min,
          max: uniformDesc.max,
          "default": uniformDesc["default"]
        });
        this.listenTo(this, "change:" + uniformDesc.name, this._uniformsChanged);
        this.set(uniformDesc.name, uniformDesc["default"]);
      }
      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader
      });
      this.enabled = true;
      this.renderToScreen = false;
      this.needsSwap = true;
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.scene = new THREE.Scene();
      this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
      this.scene.add(this.quad);
    }

    ShaderPassBase.prototype._uniformsChanged = function(obj) {
      var name, uniformDesc, value, _ref, _results;
      _ref = obj.changed;
      _results = [];
      for (name in _ref) {
        value = _ref[name];
        uniformDesc = _.find(this.uniformValues, (function(u) {
          return u.name === name;
        }));
        _results.push(this.uniforms[uniformDesc.uniform].value = value);
      }
      return _results;
    };

    ShaderPassBase.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {
      if (typeof this.update === "function") {
        this.update();
      }
      if (!this.enabled) {
        writeBuffer = readBuffer;
        return;
      }
      this.uniforms['uTex'].value = readBuffer;
      if (this.uniforms['uSize']) {
        this.uniforms['uSize'].value.set(readBuffer.width, readBuffer.height);
      }
      this.quad.material = this.material;
      if (this.renderToScreen) {
        return renderer.render(this.scene, this.camera);
      } else {
        return renderer.render(this.scene, this.camera, writeBuffer, false);
      }
    };

    ShaderPassBase.prototype.standardUniforms = {
      uTex: {
        type: 't',
        value: null
      },
      uSize: {
        type: 'v2',
        value: new THREE.Vector2(256, 256)
      }
    };

    ShaderPassBase.prototype.vertexShader = "varying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

    ShaderPassBase.ashimaNoiseFunctions = "//\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n// \n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n  return mod289(((x*34.0)+1.0)*x);\n}\n\nfloat snoise(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289(i); // Avoid truncation effects in permutation\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n    + i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n";

    ShaderPassBase.prototype.findUniforms = function(shader) {
      var line, lines, name, tokens, uniforms, _i, _len;
      lines = shader.split("\n");
      uniforms = {};
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (line.indexOf("uniform") === 0) {
          tokens = line.split(" ");
          name = tokens[2].substring(0, tokens[2].length - 1);
          uniforms[name] = this.typeToUniform(tokens[1]);
        }
      }
      return uniforms;
    };

    ShaderPassBase.prototype.typeToUniform = function(type) {
      switch (type) {
        case "float":
          return {
            type: "f",
            value: 0
          };
        case "vec2":
          return {
            type: "v2",
            value: new THREE.Vector2
          };
        case "vec3":
          return {
            type: "v3",
            value: new THREE.Vector3
          };
        case "vec4":
          return {
            type: "v4",
            value: new THREE.Vector4
          };
        case "bool":
          return {
            type: "i",
            value: 0
          };
        case "sampler2D":
          return {
            type: "t",
            value: null
          };
      }
    };

    return ShaderPassBase;

  })(EffectPassBase);

  VJSSignal = (function(_super) {
    __extends(VJSSignal, _super);

    VJSSignal.prototype.inputs = [];

    VJSSignal.prototype.outputs = [];

    function VJSSignal() {
      var input, _i, _len, _ref;
      VJSSignal.__super__.constructor.call(this);
      _ref = this.inputs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        this.set(input.name, input["default"]);
      }
    }

    VJSSignal.prototype.update = function(time) {};

    return VJSSignal;

  })(Backbone.Model);

  AudioInputNode = (function(_super) {
    __extends(AudioInputNode, _super);

    AudioInputNode.MAX_AUDIO_LEVEL = 200;

    function AudioInputNode() {
      this.update = __bind(this.update, this);
      this.startAudio = __bind(this.startAudio, this);
      AudioInputNode.__super__.constructor.call(this);
      navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      navigator.getUserMedia_({
        audio: true
      }, this.startAudio, (function() {}));
      this.context = new webkitAudioContext();
      this.analyzer = this.context.createAnalyser();
      this.set("selectedFreq", 500);
    }

    AudioInputNode.prototype.startAudio = function(stream) {
      var mediaStreamSource;
      mediaStreamSource = this.context.createMediaStreamSource(stream);
      mediaStreamSource.connect(this.analyzer);
      return requestAnimationFrame(this.update);
    };

    AudioInputNode.prototype.update = function() {
      requestAnimationFrame(this.update);
      if (!this.data) {
        this.data = new Uint8Array(this.analyzer.frequencyBinCount);
        this.set("data", this.data);
      }
      this.analyzer.getByteFrequencyData(this.data);
      this.set("peak", this.data[this.get('selectedFreq')] / AudioInputNode.MAX_AUDIO_LEVEL);
      return this.trigger("change:data");
    };

    return AudioInputNode;

  })(Backbone.Model);

  SPEED = 1 / 20000;

  BlobbyComposition = (function(_super) {
    __extends(BlobbyComposition, _super);

    function BlobbyComposition() {
      return BlobbyComposition.__super__.constructor.apply(this, arguments);
    }

    BlobbyComposition.prototype.name = "Blobby";

    BlobbyComposition.prototype.inputs = [
      {
        name: "Level",
        type: "number",
        min: 0,
        max: 1,
        "default": 0
      }, {
        name: "Speed",
        type: "number",
        min: 0,
        max: 1,
        "default": .1
      }
    ];

    BlobbyComposition.prototype.setup = function(renderer) {
      var geometry, i, material, sprite, vtx, _i;
      this.renderer = renderer;
      this.time = 0;
      this.scene = new THREE.Scene;
      this.scene.fog = new THREE.FogExp2(0x000000, 0.0005);
      this.camera = new THREE.PerspectiveCamera(75, this.renderer.domElement.width / this.renderer.domElement.height, 1, 10000);
      this.camera.position.z = 1000;
      sprite = new THREE.ImageUtils.loadTexture("assets/disc.png");
      sprite.premultiplyAlpha = true;
      sprite.needsUpdate = true;
      geometry = new THREE.Geometry;
      for (i = _i = 0; _i <= 1000; i = ++_i) {
        vtx = new THREE.Vector3;
        vtx.x = 500 * Math.random() - 250;
        vtx.y = 500 * Math.random() - 250;
        vtx.z = 500 * Math.random() - 250;
        vtx.seed = i;
        geometry.vertices.push(vtx);
      }
      material = new THREE.ParticleSystemMaterial({
        size: 135,
        map: sprite,
        transparent: true
      });
      material.color.setHSL(1.0, 0.3, 0.7);
      material.opacity = 0.2;
      material.blending = THREE.AdditiveBlending;
      this.particles = new THREE.ParticleSystem(geometry, material);
      this.particles.sortParticles = true;
      return this.scene.add(this.particles);
    };

    BlobbyComposition.prototype.update = function() {
      var a, vertex, _i, _len, _ref, _results;
      this.time += .01 * this.get("Speed");
      this.particles.rotation.y += 0.01;
      a = this.get("Level") * 500;
      a = a + 1;
      a = Math.max(a, 60);
      _ref = this.particles.geometry.vertices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        vertex.x = noise.simplex2(this.time, vertex.seed) * a;
        vertex.y = noise.simplex2(vertex.seed, this.time) * a;
        _results.push(vertex.z = noise.simplex2(this.time + vertex.seed, vertex.seed) * a);
      }
      return _results;
    };

    return BlobbyComposition;

  })(Composition);

  CircleGrower = (function(_super) {
    __extends(CircleGrower, _super);

    function CircleGrower() {
      return CircleGrower.__super__.constructor.apply(this, arguments);
    }

    CircleGrower.prototype.name = "Circles";

    CircleGrower.prototype.setup = function(renderer) {
      this.renderer = renderer;
      return CircleGrower.__super__.setup.call(this, this.renderer);
    };

    CircleGrower.prototype.uniformValues = [
      {
        uniform: "circleSize",
        name: "Number Of Circles",
        min: 1,
        max: 10,
        "default": 4
      }
    ];

    CircleGrower.prototype.update = function() {
      this.uniforms['uSize'].value.set(this.renderer.domElement.width, this.renderer.domElement.height);
      return this.uniforms['time'].value += 1;
    };

    CircleGrower.prototype.fragmentShader = "uniform vec2 uSize;\nvarying vec2 vUv;\nuniform float circleSize;\nuniform float time;\nvoid main (void)\n{\n  float cSize = 1.0 / circleSize;\n  vec2 pos = mod(vUv.xy * 2.0 - 1.0, vec2(cSize)) * circleSize - vec2(cSize * circleSize / 2.0);\n  float dist = sqrt(dot(pos, pos));\n  dist = dist * circleSize + time * -.050;\n\n  gl_FragColor = sin(dist * 2.0) > 0.0 ? vec4(1.0) : vec4(0.0);\n\n}";

    return CircleGrower;

  })(GLSLComposition);

  FlameComposition = (function(_super) {
    __extends(FlameComposition, _super);

    function FlameComposition() {
      return FlameComposition.__super__.constructor.apply(this, arguments);
    }

    FlameComposition.prototype.name = "Flame";

    FlameComposition.prototype.update = function() {
      this.uniforms['uSize'].value.set(this.renderer.domElement.width, this.renderer.domElement.height);
      return this.uniforms['time'].value += .04;
    };

    FlameComposition.prototype.fragmentShader = "const int _VolumeSteps = 32;\nconst float _StepSize = 0.1; \nconst float _Density = 0.2;\n\nconst float _SphereRadius = 2.0;\nconst float _NoiseFreq = 1.0;\nconst float _NoiseAmp = 3.0;\nconst vec3 _NoiseAnim = vec3(0, -1.0, 0);\nuniform vec2 uSize;\nvarying vec2 vUv;\nuniform float time;\n\n\n// iq's nice integer-less noise function\n\n// matrix to rotate the noise octaves\nmat3 m = mat3( 0.00,  0.80,  0.60,\n              -0.80,  0.36, -0.48,\n              -0.60, -0.48,  0.64 );\n\nfloat hash( float n )\n{\n    return fract(sin(n)*43758.5453);\n}\n\n\nfloat noise( in vec3 x )\n{\n    vec3 p = floor(x);\n    vec3 f = fract(x);\n\n    f = f*f*(3.0-2.0*f);\n\n    float n = p.x + p.y*57.0 + 113.0*p.z;\n\n    float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),\n                        mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),\n                    mix(mix( hash(n+113.0), hash(n+114.0),f.x),\n                        mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);\n    return res;\n}\n\nfloat fbm( vec3 p )\n{\n    float f;\n    f = 0.5000*noise( p ); p = m*p*2.02;\n    f += 0.2500*noise( p ); p = m*p*2.03;\n    f += 0.1250*noise( p ); p = m*p*2.01;\n    f += 0.0625*noise( p );\n    //p = m*p*2.02; f += 0.03125*abs(noise( p )); \n    return f;\n}\n\n// returns signed distance to surface\nfloat distanceFunc(vec3 p)\n{ \n  float d = length(p) - _SphereRadius;  // distance to sphere\n  \n  // offset distance with pyroclastic noise\n  //p = normalize(p) * _SphereRadius; // project noise point to sphere surface\n  d += fbm(p*_NoiseFreq + _NoiseAnim*time) * _NoiseAmp;\n  return d;\n}\n\n// color gradient \n// this should be in a 1D texture really\nvec4 gradient(float x)\n{\n  // no constant array initializers allowed in GLES SL!\n  const vec4 c0 = vec4(2, 2, 1, 1); // yellow\n  const vec4 c1 = vec4(1, 0, 0, 1); // red\n  const vec4 c2 = vec4(0, 0, 0, 0);   // black\n  const vec4 c3 = vec4(0, 0.5, 1, 0.5);   // blue\n  const vec4 c4 = vec4(0, 0, 0, 0);   // black\n  \n  x = clamp(x, 0.0, 0.999);\n  float t = fract(x*4.0);\n  vec4 c;\n  if (x < 0.25) {\n    c =  mix(c0, c1, t);\n  } else if (x < 0.5) {\n    c = mix(c1, c2, t);\n  } else if (x < 0.75) {\n    c = mix(c2, c3, t);\n  } else {\n    c = mix(c3, c4, t);   \n  }\n  //return vec4(x);\n  //return vec4(t);\n  return c;\n}\n\n// shade a point based on distance\nvec4 shade(float d)\n{ \n  // lookup in color gradient\n  return gradient(d);\n  //return mix(vec4(1, 1, 1, 1), vec4(0, 0, 0, 0), smoothstep(1.0, 1.1, d));\n}\n\n// procedural volume\n// maps position to color\nvec4 volumeFunc(vec3 p)\n{\n  float d = distanceFunc(p);\n  return shade(d);\n}\n\n// ray march volume from front to back\n// returns color\nvec4 rayMarch(vec3 rayOrigin, vec3 rayStep, out vec3 pos)\n{\n  vec4 sum = vec4(0, 0, 0, 0);\n  pos = rayOrigin;\n  for(int i=0; i<_VolumeSteps; i++) {\n    vec4 col = volumeFunc(pos);\n    col.a *= _Density;\n    //col.a = min(col.a, 1.0);\n    \n    // pre-multiply alpha\n    col.rgb *= col.a;\n    sum = sum + col*(1.0 - sum.a);  \n#if 0\n    // exit early if opaque\n          if (sum.a > _OpacityThreshold)\n                break;\n#endif    \n    pos += rayStep;\n  }\n  return sum;\n}\n\nvoid main(void)\n{\n    vec2 p = (vUv.xy)*2.0-1.0;\n  \n    float rotx = time * .05;\n    float roty = time * .04;\n\n    float zoom = 4.0;\n\n    // camera\n    vec3 ro = zoom*normalize(vec3(cos(roty), cos(rotx), sin(roty)));\n    vec3 ww = normalize(vec3(0.0,0.0,0.0) - ro);\n    vec3 uu = normalize(cross( vec3(0.0,1.0,0.0), ww ));\n    vec3 vv = normalize(cross(ww,uu));\n    vec3 rd = normalize( p.x*uu + p.y*vv + 1.5*ww );\n\n    ro += rd*2.0;\n  \n    // volume render\n    vec3 hitPos;\n    vec4 col = rayMarch(ro, rd*_StepSize, hitPos);\n    //vec4 col = gradient(p.x);\n      \n    gl_FragColor = col;\n}";

    return FlameComposition;

  })(GLSLComposition);

  SphereSphereComposition = (function(_super) {
    __extends(SphereSphereComposition, _super);

    function SphereSphereComposition() {
      return SphereSphereComposition.__super__.constructor.apply(this, arguments);
    }

    SphereSphereComposition.prototype.name = "Spherize";

    SphereSphereComposition.prototype.setup = function(renderer) {
      var ambient, geometry, light, material, res, size, skeleton, sprite, vertex, _i, _j, _len, _len1, _ref, _ref1;
      this.renderer = renderer;
      this.scene = new THREE.Scene;
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      this.camera.position.z = 1000;
      this.origin = new THREE.Vector3(0, 0, 0);
      this.group = new THREE.Object3D;
      this.scene.add(this.group);
      sprite = new THREE.ImageUtils.loadTexture("assets/disc.png");
      sprite.premultiplyAlpha = true;
      sprite.needsUpdate = true;
      geometry = new THREE.Geometry;
      _ref = [400];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        size = _ref[_i];
        res = 80;
        skeleton = new THREE.SphereGeometry(size, res, res);
        _ref1 = skeleton.vertices;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          vertex = _ref1[_j];
          geometry.vertices.push(vertex);
        }
        material = new THREE.ParticleSystemMaterial({
          size: 35,
          map: sprite,
          transparent: true
        });
        material.blending = THREE.AdditiveBlending;
        material.opacity = 0.2;
        this.particles = new THREE.ParticleSystem(geometry, material);
        this.particles.sortParticles = true;
        this.group.add(this.particles);
      }
      light = new THREE.SpotLight(0xFFFFFF);
      light.position.set(1000, 1000, 300);
      this.scene.add(light);
      light = new THREE.AmbientLight(0x222222);
      this.scene.add(light);
      ambient = new THREE.PointLight(0x444444, 1, 10000);
      ambient.position.set(500, 500, 500);
      this.scene.add(ambient);
      ambient = new THREE.PointLight(0x444444, 1, 10000);
      ambient.position.set(-500, 500, 500);
      return this.scene.add(ambient);
    };

    SphereSphereComposition.prototype.update = function() {
      this.group.rotation.y += 0.001;
      this.group.rotation.z += 0.0001;
      return this.group.rotation.x += 0.00014;
    };

    SphereSphereComposition.prototype.addCube = function(group, position) {
      var mesh;
      mesh = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
      mesh.position = position;
      mesh.lookAt(this.origin);
      return this.group.add(mesh);
    };

    return SphereSphereComposition;

  })(Composition);

  VideoComposition = (function(_super) {
    __extends(VideoComposition, _super);

    VideoComposition.prototype.name = "Video";

    function VideoComposition(videoFile) {
      var videoTag;
      this.videoFile = videoFile;
      VideoComposition.__super__.constructor.call(this);
      if (this.videoFile) {
        this.name = this.videoFile.name;
        videoTag = document.createElement('video');
        videoTag.src = URL.createObjectURL(this.videoFile);
        videoTag.addEventListener('loadeddata', (function(_this) {
          return function(e) {
            var canvas, context, f;
            videoTag.currentTime = videoTag.duration / 2;
            canvas = document.createElement('canvas');
            canvas.width = videoTag.videoWidth;
            canvas.height = videoTag.videoHeight;
            context = canvas.getContext('2d');
            f = function() {
              if (videoTag.readyState !== videoTag.HAVE_ENOUGH_DATA) {
                setTimeout(f, 100);
                return;
              }
              context.drawImage(videoTag, 0, 0);
              _this.thumbnail = document.createElement('img');
              _this.thumbnail.src = canvas.toDataURL();
              videoTag.pause();
              videoTag = null;
              return _this.trigger("thumbnail-available");
            };
            return setTimeout(f, 100);
          };
        })(this));
      }
    }

    VideoComposition.prototype.setup = function(renderer) {
      this.renderer = renderer;
      this.enabled = true;
      this.renderToScreen = false;
      this.needsSwap = true;
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.scene = new THREE.Scene;
      this.video = document.createElement('video');
      if (this.videoFile) {
        this.video.src = URL.createObjectURL(this.videoFile);
      } else {
        this.video.src = "assets/timescapes.mp4";
      }
      this.video.load();
      this.video.play();
      this.video.volume = 0;
      window.video = this.video;
      return this.video.addEventListener('loadeddata', (function(_this) {
        return function() {
          _this.videoImage = document.createElement('canvas');
          _this.videoImage.width = _this.video.videoWidth;
          _this.videoImage.height = _this.video.videoHeight;
          _this.videoImageContext = _this.videoImage.getContext('2d');
          _this.videoTexture = new THREE.Texture(_this.videoImage);
          _this.videoTexture.minFilter = THREE.LinearFilter;
          _this.videoTexture.magFilter = THREE.LinearFilter;
          _this.material = new THREE.MeshBasicMaterial({
            map: _this.videoTexture
          });
          _this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), _this.material);
          return _this.scene.add(_this.quad);
        };
      })(this));
    };

    VideoComposition.prototype.update = function() {
      if (this.videoTexture) {
        this.videoImageContext.drawImage(this.video, 0, 0);
        return this.videoTexture.needsUpdate = true;
      }
    };

    return VideoComposition;

  })(Backbone.Model);

  BadTVPass = (function(_super) {
    __extends(BadTVPass, _super);

    BadTVPass.prototype.name = "TV Roll";

    function BadTVPass() {
      BadTVPass.__super__.constructor.call(this);
      this.uniforms.distortion.value = 1;
      this.uniforms.distortion2.value = .3;
      this.time = 0;
    }

    BadTVPass.prototype.uniformValues = [
      {
        uniform: "rollSpeed",
        name: "Roll Speed",
        start: 0,
        end: .01,
        "default": .001
      }, {
        uniform: "speed",
        name: "Speed",
        start: 0,
        end: .1,
        "default": .1
      }
    ];

    BadTVPass.prototype.update = function() {
      this.time += 1;
      return this.uniforms.time.value = this.time;
    };

    BadTVPass.prototype.fragmentShader = "uniform sampler2D uTex;\nuniform float time;\nuniform float distortion;\nuniform float distortion2;\nuniform float speed;\nuniform float rollSpeed;\nvarying vec2 vUv;\n\n" + ShaderPassBase.ashimaNoiseFunctions + "\n\nvoid main() {\n\n  vec2 p = vUv;\n  float ty = time*speed;\n  float yt = p.y - ty;\n\n  //smooth distortion\n  float offset = snoise(vec2(yt*3.0,0.0))*0.2;\n  // boost distortion\n  offset = pow( offset*distortion,3.0)/distortion;\n  //add fine grain distortion\n  offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;\n  //combine distortion on X with roll on Y\n  gl_FragColor = texture2D(uTex,  vec2(fract(p.x + offset),fract(p.y-time*rollSpeed) ));\n}";

    return BadTVPass;

  })(ShaderPassBase);

  BlurPass = (function(_super) {
    __extends(BlurPass, _super);

    function BlurPass() {
      return BlurPass.__super__.constructor.apply(this, arguments);
    }

    BlurPass.name = "Blur";

    BlurPass.prototype.fragmentShader = "uniform float blurX;\nuniform vec2 uSize;\nvarying vec2 vUv;\nuniform sampler2D uTex;\n\nconst float blurSize = 1.0/512.0; // I've chosen this size because this will result in that every step will be one pixel wide if the RTScene texture is of size 512x512\n \nvoid main(void)\n{\n   vec4 sum = vec4(0.0);\n \n   // blur in y (vertical)\n   // take nine samples, with the distance blurSize between them\n   sum += texture2D(uTex, vec2(vUv.x - 4.0*blurX, vUv.y)) * 0.05;\n   sum += texture2D(uTex, vec2(vUv.x - 3.0*blurX, vUv.y)) * 0.09;\n   sum += texture2D(uTex, vec2(vUv.x - 2.0*blurX, vUv.y)) * 0.12;\n   sum += texture2D(uTex, vec2(vUv.x - blurX, vUv.y)) * 0.15;\n   sum += texture2D(uTex, vec2(vUv.x, vUv.y)) * 0.16;\n   sum += texture2D(uTex, vec2(vUv.x + blurX, vUv.y)) * 0.15;\n   sum += texture2D(uTex, vec2(vUv.x + 2.0*blurX, vUv.y)) * 0.12;\n   sum += texture2D(uTex, vec2(vUv.x + 3.0*blurX, vUv.y)) * 0.09;\n   sum += texture2D(uTex, vec2(vUv.x + 4.0*blurX, vUv.y)) * 0.05;\n \n   gl_FragColor = sum;\n}";

    return BlurPass;

  })(ShaderPassBase);

  ChromaticAberration = (function(_super) {
    __extends(ChromaticAberration, _super);

    function ChromaticAberration() {
      return ChromaticAberration.__super__.constructor.apply(this, arguments);
    }

    ChromaticAberration.prototype.name = "Chromatic Aberration";

    ChromaticAberration.name = "Chromatic Aberration";

    ChromaticAberration.prototype.uniformValues = [
      {
        uniform: "rShift",
        name: "Red Shift",
        min: -1,
        max: 1,
        "default": -.2
      }, {
        uniform: "gShift",
        name: "Green Shift",
        min: -1,
        max: 1,
        "default": -.2
      }, {
        uniform: "bShift",
        name: "Blue Shift",
        min: -1,
        max: 1,
        "default": -.2
      }
    ];

    ChromaticAberration.prototype.fragmentShader = "uniform float rShift;\nuniform float gShift;\nuniform float bShift;\nuniform vec2 uSize;\nvarying vec2 vUv;\nuniform sampler2D uTex;\n\nvoid main (void)\n{\n    float r = texture2D(uTex, vUv + vec2(rShift * 0.01, 0.0)).r;\n    float g = texture2D(uTex, vUv + vec2(gShift * 0.01, 0.0)).g;\n    float b = texture2D(uTex, vUv + vec2(bShift * 0.01, 0.0)).b;\n    float a = max(r, max(g, b));\n    gl_FragColor = vec4(r, g, b, a);\n}";

    return ChromaticAberration;

  })(ShaderPassBase);

  InvertPass = (function(_super) {
    __extends(InvertPass, _super);

    function InvertPass() {
      return InvertPass.__super__.constructor.apply(this, arguments);
    }

    InvertPass.prototype.name = "Invert";

    InvertPass.name = "Invert";

    InvertPass.prototype.uniformValues = [
      {
        uniform: "amount",
        name: "Invert Amount",
        min: 0,
        max: 1,
        "default": 0
      }
    ];

    InvertPass.prototype.fragmentShader = "uniform float amount;\nuniform vec2 uSize;\nvarying vec2 vUv;\nuniform sampler2D uTex;\n\nvoid main (void)\n{\n    vec4 color = texture2D(uTex, vUv);\n    color = (1.0 - amount) * color + (amount) * (1.0 - color);\n    gl_FragColor = vec4(color.rgb, color.a);\n}";

    return InvertPass;

  })(ShaderPassBase);

  MirrorPass = (function(_super) {
    __extends(MirrorPass, _super);

    function MirrorPass() {
      return MirrorPass.__super__.constructor.apply(this, arguments);
    }

    MirrorPass.prototype.name = "Mirror";

    MirrorPass.name = "Mirror";

    MirrorPass.prototype.fragmentShader = "uniform vec2 uSize;\nvarying vec2 vUv;\nuniform sampler2D uTex;\n\nvoid main (void)\n{\n  vec4 color = texture2D(uTex, vUv);\n  vec2 flipPos = vec2(0.0);\n  flipPos.x = 1.0 - vUv.x;\n  flipPos.y = vUv.y;\n  gl_FragColor = color + texture2D(uTex, flipPos);\n}";

    return MirrorPass;

  })(ShaderPassBase);

  ShroomPass = (function(_super) {
    __extends(ShroomPass, _super);

    function ShroomPass() {
      ShroomPass.__super__.constructor.call(this, {
        amp: 0,
        StartRad: 0,
        freq: 10
      });
    }

    ShroomPass.prototype.name = "Wobble";

    ShroomPass.name = "Wobble";

    ShroomPass.prototype.uniformValues = [
      {
        uniform: "amp",
        name: "Strength",
        start: 0,
        end: 0.01
      }
    ];

    ShroomPass.prototype.options = [
      {
        property: "speed",
        name: "Speed",
        start: .001,
        end: .01,
        "default": 0.005
      }
    ];

    ShroomPass.prototype.update = function() {
      return this.uniforms.StartRad.value += this.speed;
    };

    ShroomPass.prototype.fragmentShader = "// Constants\nconst float C_PI    = 3.1415;\nconst float C_2PI   = 2.0 * C_PI;\nconst float C_2PI_I = 1.0 / (2.0 * C_PI);\nconst float C_PI_2  = C_PI / 2.0;\n\nuniform float StartRad;\nuniform float freq;\nuniform float amp;\nuniform vec2 uSize;\nvarying vec2 vUv;\n\nuniform sampler2D uTex;\n\nvoid main (void)\n{\n    vec2  perturb;\n    float rad;\n    vec4  color;\n\n    // Compute a perturbation factor for the x-direction\n    rad = (vUv.s + vUv.t - 1.0 + StartRad) * freq;\n\n    // Wrap to -2.0*PI, 2*PI\n    rad = rad * C_2PI_I;\n    rad = fract(rad);\n    rad = rad * C_2PI;\n\n    // Center in -PI, PI\n    if (rad >  C_PI) rad = rad - C_2PI;\n    if (rad < -C_PI) rad = rad + C_2PI;\n\n    // Center in -PI/2, PI/2\n    if (rad >  C_PI_2) rad =  C_PI - rad;\n    if (rad < -C_PI_2) rad = -C_PI - rad;\n\n    perturb.x  = (rad - (rad * rad * rad / 6.0)) * amp;\n\n    // Now compute a perturbation factor for the y-direction\n    rad = (vUv.s - vUv.t + StartRad) * freq;\n\n    // Wrap to -2*PI, 2*PI\n    rad = rad * C_2PI_I;\n    rad = fract(rad);\n    rad = rad * C_2PI;\n\n    // Center in -PI, PI\n    if (rad >  C_PI) rad = rad - C_2PI;\n    if (rad < -C_PI) rad = rad + C_2PI;\n\n    // Center in -PI/2, PI/2\n    if (rad >  C_PI_2) rad =  C_PI - rad;\n    if (rad < -C_PI_2) rad = -C_PI - rad;\n\n    perturb.y  = (rad - (rad * rad * rad / 6.0)) * amp;\n    vec2 pos = vUv.st;\n    pos.x = 1.0 - pos.x;\n    color = texture2D(uTex, perturb + pos);\n\n    gl_FragColor = vec4(color.rgb, color.a);\n}";

    return ShroomPass;

  })(ShaderPassBase);

  WashoutPass = (function(_super) {
    __extends(WashoutPass, _super);

    function WashoutPass() {
      return WashoutPass.__super__.constructor.apply(this, arguments);
    }

    WashoutPass.prototype.fragmentShader = "uniform vec2 uSize;\nvarying vec2 vUv;\nuniform float amount;\nuniform sampler2D uTex;\n\nvoid main (void)\n{\n  vec4 color = texture2D(uTex, vUv);\n  gl_FragColor = color * (1.0 + amount);\n}";

    return WashoutPass;

  })(ShaderPassBase);

  Passthrough = (function(_super) {
    __extends(Passthrough, _super);

    function Passthrough() {
      return Passthrough.__super__.constructor.apply(this, arguments);
    }

    Passthrough.prototype.name = "Passthrough";

    Passthrough.name = "Passthrough";

    Passthrough.prototype.fragmentShader = "uniform vec2 uSize;\nvarying vec2 vUv;\nuniform sampler2D uTex;\n\nvoid main (void)\n{\n    gl_FragColor = texture2D(uTex, vUv);\n}";

    return Passthrough;

  })(ShaderPassBase);

  Node = (function() {
    function Node() {
      this.inputs = [];
      this.outputs = [];
    }

    return Node;

  })();

  noise.seed(Math.random());

  $(function() {
    return window.application = new App;
  });

  App = (function(_super) {
    __extends(App, _super);

    function App() {
      this.startAudio = __bind(this.startAudio, this);
      this.animate = __bind(this.animate, this);
      var outputWindow;
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        clearAlpha: 1,
        transparent: true
      });
      outputWindow = document.querySelector(".output");
      this.renderer.setSize(outputWindow.offsetWidth, outputWindow.offsetHeight);
      outputWindow.appendChild(this.renderer.domElement);
      this.initCompositions();
      this.initEffects();
      this.initStats();
      this.initMicrophone();
      this.initSignals();
      this.setComposition(new CircleGrower);
      requestAnimationFrame(this.animate);
    }

    App.prototype.animate = function() {
      var time, _ref;
      time = Date.now();
      this.signalManager.update(time);
      if ((_ref = this.composition) != null) {
        _ref.update({
          audio: this.audioVisualizer.level || 0
        });
      }
      this.composer.render();
      this.stats.update();
      return requestAnimationFrame(this.animate);
    };

    App.prototype.initCompositions = function() {
      this.compositionPicker = new CompositionPicker;
      this.compositionPicker.addComposition(new CircleGrower);
      this.compositionPicker.addComposition(new SphereSphereComposition);
      this.compositionPicker.addComposition(new BlobbyComposition);
      this.compositionPicker.addComposition(new FlameComposition);
      return this.inspector = new CompositionInspector;
    };

    App.prototype.initEffects = function() {
      var passthrough;
      this.composer = new THREE.EffectComposer(this.renderer);
      this.renderModel = new THREE.RenderPass(new THREE.Scene, new THREE.PerspectiveCamera);
      this.renderModel.enabled = true;
      this.composer.addPass(this.renderModel);
      passthrough = new Passthrough;
      passthrough.enabled = true;
      passthrough.renderToScreen = true;
      this.composer.addPass(passthrough);
      this.effectsManager = new EffectsManager(this.composer);
      this.effectsManager.registerEffect(MirrorPass);
      this.effectsManager.registerEffect(InvertPass);
      this.effectsManager.registerEffect(ChromaticAberration);
      this.effectsManager.registerEffect(MirrorPass);
      this.effectsPanel = new EffectsPanel({
        model: this.effectsManager
      });
      return this.effectsManager.addEffectToStack(new ChromaticAberration);
    };

    App.prototype.initStats = function() {
      this.stats = new Stats;
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.right = '20px';
      this.stats.domElement.style.top = '0px';
      return document.body.appendChild(this.stats.domElement);
    };

    App.prototype.initMicrophone = function() {
      this.audioInputNode = new AudioInputNode;
      return this.audioVisualizer = new AudioVisualizer({
        model: this.audioInputNode
      });
    };

    App.prototype.initSignals = function() {
      this.signalManager = new SignalManager;
      this.signalManager.registerSignal(LFO);
      this.signalManagerView = new SignalManagerView({
        model: this.signalManager
      });
      this.signalManager.add(new LFO);
      return this.valueBinder = new ValueBinder({
        model: this.signalManager
      });
    };

    App.prototype.startAudio = function(stream) {
      var mediaStreamSource;
      mediaStreamSource = this.context.createMediaStreamSource(stream);
      return mediaStreamSource.connect(this.analyzer);
    };

    App.prototype.setComposition = function(comp) {
      this.composition = comp;
      this.composition.setup(this.renderer);
      this.inspector.setComposition(this.composition);
      this.renderModel.scene = this.composition.scene;
      return this.renderModel.camera = this.composition.camera;
    };

    return App;

  })(Backbone.Model);

  Gamepad = (function() {
    Gamepad.FACE_1 = 0;

    Gamepad.FACE_2 = 1;

    Gamepad.FACE_3 = 2;

    Gamepad.FACE_4 = 3;

    Gamepad.LEFT_SHOULDER = 4;

    Gamepad.RIGHT_SHOULDER = 5;

    Gamepad.LEFT_SHOULDER_BOTTOM = 6;

    Gamepad.RIGHT_SHOULDER_BOTTOM = 7;

    Gamepad.SELECT = 8;

    Gamepad.START = 9;

    Gamepad.LEFT_ANALOGUE_STICK = 10;

    Gamepad.RIGHT_ANALOGUE_STICK = 11;

    Gamepad.PAD_TOP = 12;

    Gamepad.PAD_BOTTOM = 13;

    Gamepad.PAD_LEFT = 14;

    Gamepad.PAD_RIGHT = 15;

    Gamepad.STICK_1 = 16;

    Gamepad.STICK_2 = 17;

    Gamepad.BUTTONS = [Gamepad.FACE_1, Gamepad.FACE_2, Gamepad.FACE_3, Gamepad.FACE_4, Gamepad.LEFT_SHOULDER, Gamepad.RIGHT_SHOULDER, Gamepad.LEFT_SHOULDER_BOTTOM, Gamepad.RIGHT_SHOULDER_BOTTOM, Gamepad.SELECT, Gamepad.START, Gamepad.LEFT_ANALOGUE_STICK, Gamepad.RIGHT_ANALOGUE_STICK, Gamepad.PAD_TOP, Gamepad.PAD_BOTTOM, Gamepad.PAD_LEFT, Gamepad.PAD_RIGHT];

    function Gamepad() {
      this.checkButtons = __bind(this.checkButtons, this);
      this.checkForPad = __bind(this.checkForPad, this);
      var button, _i, _len, _ref;
      this.pad = null;
      this.callbacks = {};
      this.callbacks[Gamepad.STICK_1] = [];
      this.callbacks[Gamepad.STICK_2] = [];
      this.buttonStates = {};
      _ref = Gamepad.BUTTONS;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        button = _ref[_i];
        this.buttonStates[button] = 0;
      }
      requestAnimationFrame(this.checkForPad);
    }

    Gamepad.prototype.checkForPad = function() {
      if (navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0]) {
        this.pad = navigator.webkitGetGamepads()[0];
        return requestAnimationFrame(this.checkButtons);
      } else {
        return requestAnimationFrame(this.checkForPad);
      }
    };

    Gamepad.prototype.checkButtons = function() {
      var button, buttonId, callback, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _results;
      this.pad = navigator.webkitGetGamepads()[0];
      requestAnimationFrame(this.checkButtons);
      _ref = Gamepad.BUTTONS;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        button = _ref[_i];
        if (this.callbacks[button] && this.buttonStates[button] !== this.pad.buttons[button]) {
          this.buttonStates[button] = this.pad.buttons[button];
          _ref1 = this.callbacks[button];
          for (buttonId in _ref1) {
            callback = _ref1[buttonId];
            callback(this.pad.buttons[button]);
          }
        }
      }
      _ref2 = this.callbacks[Gamepad.STICK_1];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        callback = _ref2[_j];
        callback({
          x: this.pad.axes[0],
          y: this.pad.axes[1]
        });
      }
      _ref3 = this.callbacks[Gamepad.STICK_2];
      _results = [];
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        callback = _ref3[_k];
        _results.push(callback({
          x: this.pad.axes[2],
          y: this.pad.axes[3]
        }));
      }
      return _results;
    };

    Gamepad.prototype.addEventListener = function(button, callback) {
      if (!this.callbacks[button]) {
        this.callbacks[button] = [];
      }
      return this.callbacks[button].push(callback);
    };

    return Gamepad;

  })();

  RGBShiftPass = (function() {
    function RGBShiftPass(r, g, b) {
      var shader;
      shader = new RGBShiftShader;
      this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
      this.uniforms['uRedShift'].value = r;
      this.uniforms['uGreenShift'].value = g;
      this.uniforms['uBlueShift'].value = b;
      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      });
      this.enabled = true;
      this.renderToScreen = false;
      this.needsSwap = true;
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.scene = new THREE.Scene();
      this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
      this.scene.add(this.quad);
    }

    RGBShiftPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {
      this.uniforms['uTex'].value = readBuffer;
      this.uniforms['uSize'].value.set(readBuffer.width, readBuffer.height);
      this.quad.material = this.material;
      if (this.renderToScreen) {
        return renderer.render(this.scene, this.camera);
      } else {
        return renderer.render(this.scene, this.camera, writeBuffer, false);
      }
    };

    return RGBShiftPass;

  })();

  RGBShiftShader = (function() {
    function RGBShiftShader() {}

    RGBShiftShader.prototype.uniforms = {
      uTex: {
        type: 't',
        value: null
      },
      uSize: {
        type: 'v2',
        value: new THREE.Vector2(256, 256)
      },
      uRedShift: {
        type: 'f',
        value: 0.0
      },
      uGreenShift: {
        type: 'f',
        value: 0.0
      },
      uBlueShift: {
        type: 'f',
        value: 1.0
      }
    };

    RGBShiftShader.prototype.vertexShader = "varying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

    RGBShiftShader.prototype.fragmentShader = "uniform sampler2D uTex;\nuniform float uRedShift;\nuniform float uGreenShift;\nuniform float uBlueShift;\nuniform vec2 uSize;\n\nvarying vec2 vUv;\n\nvoid main() {\n  float r = texture2D(uTex, (vUv - 0.5) * vec2(uRedShift, 1.0) + 0.5).r;\n  float g = texture2D(uTex, (vUv - 0.5) * vec2(uGreenShift, 1.0) + 0.5).g;\n  float b = texture2D(uTex, (vUv - 0.5) * vec2(uBlueShift, 1.0) + 0.5).b;\n  \n  gl_FragColor = vec4(r,g,b,1.0);\n}";

    return RGBShiftShader;

  })();

  AudioVisualizer = (function(_super) {
    __extends(AudioVisualizer, _super);

    function AudioVisualizer() {
      this.clickCanvas = __bind(this.clickCanvas, this);
      this.mouseOut = __bind(this.mouseOut, this);
      this.drag = __bind(this.drag, this);
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
      return AudioVisualizer.__super__.constructor.apply(this, arguments);
    }

    AudioVisualizer.prototype.el = ".audio-analyzer";

    AudioVisualizer.prototype.events = {
      "mousemove canvas": "drag",
      "mouseout canvas": "mouseOut",
      "click canvas": "clickCanvas"
    };

    AudioVisualizer.prototype.initialize = function() {
      this.canvas = document.createElement('canvas');
      this.el.appendChild(this.canvas);
      this.canvas.width = this.el.offsetWidth;
      this.canvas.height = 200;
      this.hoveredFreq = null;
      return this.listenTo(this.model, "change:data", this.update);
    };

    AudioVisualizer.prototype.update = function() {
      var amp, ctx, data, i, selectedFreq, _i, _len;
      data = this.model.get('data');
      selectedFreq = this.model.get('selectedFreq');
      if (!data) {
        return;
      }
      this.scale = this.canvas.width / data.length;
      ctx = this.canvas.getContext('2d');
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.translate(0, this.canvas.height);
      ctx.scale(this.scale, this.scale);
      ctx.translate(0, -this.canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = "#FF0000";
      ctx.moveTo(0, this.canvas.height);
      for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
        amp = data[i];
        ctx.lineTo(i, this.canvas.height - amp);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = "#FF0000";
      ctx.moveTo(selectedFreq, this.canvas.height);
      ctx.lineTo(selectedFreq, 0);
      ctx.stroke();
      if (this.hoveredFreq) {
        ctx.beginPath();
        ctx.strokeStyle = "#FFFFFF";
        ctx.moveTo(this.hoveredFreq, 0);
        ctx.lineTo(this.hoveredFreq, this.canvas.height);
        ctx.stroke();
      }
      this.level = this.model.get('peak') * this.canvas.height;
      ctx.restore();
      ctx.fillStyle = "#FF0000";
      return ctx.fillRect(this.canvas.width - 10, this.canvas.height - this.level, 10, this.canvas.height);
    };

    AudioVisualizer.prototype.render = function() {
      return this.el;
    };

    AudioVisualizer.prototype.drag = function(e) {
      return this.hoveredFreq = parseInt(e.offsetX / this.scale);
    };

    AudioVisualizer.prototype.mouseOut = function(e) {
      return this.hoveredFreq = null;
    };

    AudioVisualizer.prototype.clickCanvas = function(e) {
      return this.model.set("selectedFreq", parseInt(e.offsetX / this.scale));
    };

    return AudioVisualizer;

  })(Backbone.View);

  CompositionInspector = (function(_super) {
    __extends(CompositionInspector, _super);

    function CompositionInspector() {
      this.render = __bind(this.render, this);
      return CompositionInspector.__super__.constructor.apply(this, arguments);
    }

    CompositionInspector.prototype.el = ".inspector";

    CompositionInspector.prototype.initialize = function() {
      this.label = this.el.querySelector('.label');
      return this.stack = this.el.querySelector('.stack');
    };

    CompositionInspector.prototype.setComposition = function(composition) {
      var view;
      view = new SignalUIBase({
        model: composition
      });
      this.stack.innerHTML = '';
      return this.stack.appendChild(view.render());
    };

    CompositionInspector.prototype.render = function() {};

    return CompositionInspector;

  })(Backbone.View);

  CompositionPicker = (function(_super) {
    __extends(CompositionPicker, _super);

    CompositionPicker.prototype.el = ".composition-picker";

    CompositionPicker.prototype.events = {
      "dragover": "dragover",
      "dragleave": "dragleave",
      "drop": "drop"
    };

    function CompositionPicker() {
      this.render = __bind(this.render, this);
      this.drop = __bind(this.drop, this);
      this.dragleave = __bind(this.dragleave, this);
      this.dragover = __bind(this.dragover, this);
      CompositionPicker.__super__.constructor.call(this);
      this.compositions = [];
    }

    CompositionPicker.prototype.dragover = function(e) {
      e.preventDefault();
      return this.el.classList.add('dragover');
    };

    CompositionPicker.prototype.dragleave = function(e) {
      e.preventDefault();
      return this.el.classList.remove('dragover');
    };

    CompositionPicker.prototype.drop = function(e) {
      var composition, file;
      e.preventDefault();
      this.el.classList.remove('dragover');
      file = e.originalEvent.dataTransfer.files[0];
      composition = new VideoComposition(file);
      return this.addComposition(composition);
    };

    CompositionPicker.prototype.addComposition = function(comp) {
      var slot;
      slot = new CompositionSlot({
        model: comp
      });
      return this.el.appendChild(slot.render());
    };

    CompositionPicker.prototype.render = function() {
      return this.el;
    };

    return CompositionPicker;

  })(Backbone.View);

  CompositionSlot = (function(_super) {
    __extends(CompositionSlot, _super);

    function CompositionSlot() {
      this.launch = __bind(this.launch, this);
      this.render = __bind(this.render, this);
      this.initialize = __bind(this.initialize, this);
      return CompositionSlot.__super__.constructor.apply(this, arguments);
    }

    CompositionSlot.prototype.className = 'slot';

    CompositionSlot.prototype.events = {
      "click img": "launch"
    };

    CompositionSlot.prototype.initialize = function() {
      CompositionSlot.__super__.initialize.call(this);
      return this.listenTo(this.model, "thumbnail-available", this.render);
    };

    CompositionSlot.prototype.render = function() {
      this.$el.html(this.model.thumbnail);
      return this.el;
    };

    CompositionSlot.prototype.launch = function() {
      return application.setComposition(this.model);
    };

    return CompositionSlot;

  })(Backbone.View);

  EffectsManager = (function(_super) {
    __extends(EffectsManager, _super);

    function EffectsManager(composer) {
      this.composer = composer;
      EffectsManager.__super__.constructor.call(this);
      this.effectClasses = [];
      this.stack = [];
    }

    EffectsManager.prototype.registerEffect = function(effectClass) {
      this.effectClasses.push(effectClass);
      return this.trigger("change");
    };

    EffectsManager.prototype.addEffectToStack = function(effect) {
      this.stack.push(effect);
      this.composer.insertPass(effect, this.composer.passes.length - 1);
      return this.trigger("add-effect", effect);
    };

    return EffectsManager;

  })(Backbone.Model);

  EffectParameter = (function(_super) {
    __extends(EffectParameter, _super);

    function EffectParameter() {
      return EffectParameter.__super__.constructor.apply(this, arguments);
    }

    return EffectParameter;

  })(Backbone.Model);

  EffectControl = (function(_super) {
    __extends(EffectControl, _super);

    function EffectControl() {
      return EffectControl.__super__.constructor.apply(this, arguments);
    }

    EffectControl.prototype.className = "effect-control";

    EffectControl.prototype.initialize = function() {};

    EffectControl.prototype.render = function() {
      return this.el.textContent = this.model.get("name");
    };

    return EffectControl;

  })(Backbone.View);

  EffectsPanel = (function(_super) {
    __extends(EffectsPanel, _super);

    function EffectsPanel() {
      this.render = __bind(this.render, this);
      this.addEffect = __bind(this.addEffect, this);
      this.insertEffectPanel = __bind(this.insertEffectPanel, this);
      return EffectsPanel.__super__.constructor.apply(this, arguments);
    }

    EffectsPanel.prototype.el = ".effects";

    EffectsPanel.prototype.events = {
      "change .add-effect": "addEffect"
    };

    EffectsPanel.prototype.initialize = function() {
      this.addButton = document.createElement('select');
      this.addButton.className = 'add-effect';
      this.stack = document.createElement('div');
      this.el.appendChild(this.stack);
      this.el.appendChild(this.addButton);
      this.listenTo(this.model, "change", this.render);
      this.listenTo(this.model, "add-effect", this.insertEffectPanel);
      return this.render();
    };

    EffectsPanel.prototype.insertEffectPanel = function(effect) {
      var effectParameter;
      effectParameter = new SignalUIBase({
        model: effect
      });
      return this.stack.appendChild(effectParameter.render());
    };

    EffectsPanel.prototype.addEffect = function(e) {
      if (e.target.value !== -1) {
        this.model.addEffectToStack(new this.model.effectClasses[e.target.value]);
        return e.target.selectedIndex = 0;
      }
    };

    EffectsPanel.prototype.render = function() {
      var effect, i, option, _i, _len, _ref, _results;
      this.addButton.innerHTML = "<option value=-1>Add Effect</option>";
      _ref = this.model.effectClasses;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        effect = _ref[i];
        option = document.createElement('option');
        option.value = i;
        option.textContent = effect.name;
        _results.push(this.addButton.appendChild(option));
      }
      return _results;
    };

    return EffectsPanel;

  })(Backbone.View);

  LFO = (function(_super) {
    __extends(LFO, _super);

    function LFO() {
      return LFO.__super__.constructor.apply(this, arguments);
    }

    LFO.prototype.inputs = [
      {
        name: "period",
        type: "number",
        min: 0,
        max: 10,
        "default": 2
      }, {
        name: "type",
        type: "select",
        options: ["Sin", "Square", "Triangle", "Sawtooth Up", "Sawtooth Down"],
        "default": "Sin"
      }
    ];

    LFO.prototype.outputs = [
      {
        name: "value",
        type: "number",
        min: 0,
        max: 1
      }
    ];

    LFO.prototype.name = "LFO";

    LFO.prototype.initialize = function() {
      return LFO.__super__.initialize.call(this);
    };

    LFO.prototype.update = function(time) {
      var period, value;
      time = time / 1000;
      period = this.get("period");
      value = 0;
      switch (this.get("type")) {
        case "Sin":
          value = Math.sin(Math.PI * time / period) * .5 + .5;
          break;
        case "Square":
          value = Math.round(Math.sin(Math.PI * time / period) * .5 + .5);
          break;
        case "Sawtooth Up":
          value = time / period;
          value = value - Math.floor(value);
          break;
        case "Sawtooth Down":
          value = time / period;
          value = 1 - (value - Math.floor(value));
      }
      return this.set("value", value);
    };

    return LFO;

  })(VJSSignal);

  SignalManager = (function(_super) {
    __extends(SignalManager, _super);

    function SignalManager() {
      SignalManager.__super__.constructor.call(this, [], {
        model: VJSSignal
      });
      this.signalClasses = [];
    }

    SignalManager.prototype.registerSignal = function(signalClass) {
      this.signalClasses.push(signalClass);
      return this.trigger('change:registration');
    };

    SignalManager.prototype.update = function(time) {
      var signal, _i, _len, _ref, _results;
      _ref = this.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        signal = _ref[_i];
        _results.push(signal.update(time));
      }
      return _results;
    };

    return SignalManager;

  })(Backbone.Collection);

  SignalManagerView = (function(_super) {
    __extends(SignalManagerView, _super);

    function SignalManagerView() {
      this.createSignalView = __bind(this.createSignalView, this);
      this.render = __bind(this.render, this);
      this.addSignal = __bind(this.addSignal, this);
      return SignalManagerView.__super__.constructor.apply(this, arguments);
    }

    SignalManagerView.prototype.el = ".signals";

    SignalManagerView.prototype.events = {
      "change .add-signal": "addSignal"
    };

    SignalManagerView.prototype.initialize = function() {
      this.views = [];
      this.listenTo(this.model, "add", this.createSignalView);
      this.listenTo(this.model, "change:registration", this.render);
      this.addButton = document.createElement('select');
      this.addButton.className = 'add-signal';
      this.stack = document.createElement('div');
      this.el.appendChild(this.stack);
      this.el.appendChild(this.addButton);
      return this.render();
    };

    SignalManagerView.prototype.addSignal = function(e) {
      if (e.target.value !== -1) {
        this.model.add(new this.model.signalClasses[e.target.value]);
        return e.target.selectedIndex = 0;
      }
    };

    SignalManagerView.prototype.render = function() {
      var i, option, signal, _i, _len, _ref, _results;
      this.addButton.innerHTML = "<option value=-1>Add Signal</option>";
      _ref = this.model.signalClasses;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        signal = _ref[i];
        option = document.createElement('option');
        option.value = i;
        option.textContent = signal.name;
        _results.push(this.addButton.appendChild(option));
      }
      return _results;
    };

    SignalManagerView.prototype.createSignalView = function(signal) {
      var view;
      this.views.push(view = new SignalUIBase({
        model: signal
      }));
      return this.stack.appendChild(view.render());
    };

    return SignalManagerView;

  })(Backbone.View);

  SignalUIBase = (function(_super) {
    __extends(SignalUIBase, _super);

    function SignalUIBase() {
      this.clickLabel = __bind(this.clickLabel, this);
      return SignalUIBase.__super__.constructor.apply(this, arguments);
    }

    SignalUIBase.prototype.className = "signal-set";

    SignalUIBase.prototype.initialize = function() {
      var arrow, div, input, label, output, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
      console.log(this.model);
      this.el.appendChild(arrow = document.createElement('div'));
      arrow.className = "arrow";
      this.el.appendChild(label = document.createElement('div'));
      label.textContent = this.model.name;
      label.className = 'label';
      arrow.addEventListener('click', this.clickLabel);
      _ref = this.model.inputs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        this.el.appendChild(div = document.createElement('div'));
        div.className = "signal";
        div.textContent = input.name;
        if (input.type === "number") {
          div.appendChild(this.newSlider(this.model, input).render());
        } else if (input.type === "select") {
          div.appendChild(this.newSelect(this.model, input).render());
        }
      }
      if (((_ref1 = this.model.outputs) != null ? _ref1.length : void 0) > 0) {
        this.el.appendChild(document.createElement('hr'));
      }
      _ref2 = this.model.outputs;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        output = _ref2[_j];
        this.el.appendChild(div = document.createElement('div'));
        div.className = "signal";
        div.textContent = output.name;
        if (output.type === "number") {
          _results.push(div.appendChild(this.newSlider(this.model, output).render()));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    SignalUIBase.prototype.clickLabel = function() {
      return this.$el.toggleClass('hidden');
    };

    SignalUIBase.prototype.render = function() {
      return this.el;
    };

    SignalUIBase.prototype.newSlider = function(model, input) {
      var slider;
      return slider = new VJSSlider(model, input);
    };

    SignalUIBase.prototype.newSelect = function(model, input) {
      return new VJSSelect(model, input);
    };

    return SignalUIBase;

  })(Backbone.View);

  VJSSlider = (function(_super) {
    __extends(VJSSlider, _super);

    VJSSlider.prototype.events = {
      "click .slider": "click",
      "mousedown .slider": "dragBegin"
    };

    function VJSSlider(model, property) {
      this.property = property;
      this.showBindings = __bind(this.showBindings, this);
      this.render = __bind(this.render, this);
      this.click = __bind(this.click, this);
      this.dragEnd = __bind(this.dragEnd, this);
      this.dragMove = __bind(this.dragMove, this);
      this.dragBegin = __bind(this.dragBegin, this);
      VJSSlider.__super__.constructor.call(this, {
        model: model
      });
    }

    VJSSlider.prototype.initialize = function() {
      var div;
      div = document.createElement('div');
      div.className = 'slider';
      div.appendChild(this.level = document.createElement('div'));
      this.level.className = 'level';
      this.el.appendChild(div);
      this.$el.on("contextmenu", this.showBindings);
      this.max = this.property.max;
      this.min = this.property.min;
      this.listenTo(this.model, "change:" + this.property.name, this.render);
      return this.render();
    };

    VJSSlider.prototype.dragBegin = function(e) {
      $(document).on({
        'mousemove': this.dragMove,
        'mouseup': this.dragEnd
      });
      return this.click(e);
    };

    VJSSlider.prototype.dragMove = function(e) {
      return this.click(e);
    };

    VJSSlider.prototype.dragEnd = function(e) {
      return $(document).off({
        'mousemove': this.dragMove,
        'mouseup': this.dragEnd
      });
    };

    VJSSlider.prototype.click = function(e) {
      var percent, value, x;
      x = e.pageX - this.el.offsetLeft;
      percent = x / this.el.clientWidth;
      value = (this.max - this.min) * percent + this.min;
      value = Math.clamp(value, this.min, this.max);
      return this.model.set(this.property.name, value);
    };

    VJSSlider.prototype.render = function() {
      var percent, value;
      value = this.model.get(this.property.name);
      percent = (value - this.min) / (this.max - this.min) * 100;
      this.level.style.width = "" + percent + "%";
      return this.el;
    };

    VJSSlider.prototype.showBindings = function(e) {
      var el;
      e.preventDefault();
      el = window.application.valueBinder.render();
      window.application.valueBinder.show(this.model, this.property);
      el.style.top = e.pageY + "px";
      return el.style.left = e.pageX + "px";
    };

    return VJSSlider;

  })(Backbone.View);

  VJSSelect = (function(_super) {
    __extends(VJSSelect, _super);

    VJSSelect.prototype.events = {
      "change select": "change"
    };

    function VJSSelect(model, property) {
      this.property = property;
      this.render = __bind(this.render, this);
      this.change = __bind(this.change, this);
      VJSSelect.__super__.constructor.call(this, {
        model: model
      });
    }

    VJSSelect.prototype.initialize = function() {
      var div, opt, option, select, _i, _len, _ref, _results;
      this.el.appendChild(div = document.createElement('div'));
      div.appendChild(select = document.createElement('select'));
      _ref = this.property.options;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        select.appendChild(opt = document.createElement('option'));
        opt.value = option;
        _results.push(opt.textContent = option);
      }
      return _results;
    };

    VJSSelect.prototype.change = function(e) {
      return this.model.set(this.property.name, e.target.value);
    };

    VJSSelect.prototype.render = function() {
      return this.el;
    };

    return VJSSelect;

  })(Backbone.View);

  ValueBinder = (function(_super) {
    __extends(ValueBinder, _super);

    function ValueBinder() {
      this.keydown = __bind(this.keydown, this);
      this.mousedown = __bind(this.mousedown, this);
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      this.clickRow = __bind(this.clickRow, this);
      this.render = __bind(this.render, this);
      return ValueBinder.__super__.constructor.apply(this, arguments);
    }

    ValueBinder.prototype.className = "popup";

    ValueBinder.prototype.events = {
      "click .binding-row": "clickRow"
    };

    ValueBinder.prototype.initialize = function() {
      return document.body.appendChild(this.el);
    };

    ValueBinder.prototype.render = function() {
      var output, outputRow, row, signal, _i, _j, _len, _len1, _ref, _ref1;
      this.el.textContent = "Bindings";
      this.el.appendChild(document.createElement('hr'));
      _ref = this.model.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        signal = _ref[_i];
        row = document.createElement('div');
        row.className = 'binding-label';
        row.textContent = signal.name;
        this.el.appendChild(row);
        _ref1 = signal.outputs;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          output = _ref1[_j];
          this.el.appendChild(outputRow = document.createElement('div'));
          outputRow.className = 'binding-row';
          outputRow.textContent = output.name;
          outputRow.signal = signal;
          outputRow.property = output.name;
        }
      }
      return this.el;
    };

    ValueBinder.prototype.clickRow = function(e) {
      var observer, property, signal, target;
      target = e.target;
      signal = target.signal;
      property = target.property;
      observer = this.currentModel;
      console.log(observer, observer.bind);
      observer.bindToKey(this.currentProperty, signal, property);
      return this.hide();
    };

    ValueBinder.prototype.show = function(model, property) {
      this.currentModel = model;
      this.currentProperty = property;
      $(document).on("keydown", this.keydown);
      $(document).on("mousedown", this.mousedown);
      return this.$el.show();
    };

    ValueBinder.prototype.hide = function() {
      $(document).off("keydown", this.keydown);
      $(document).off("mousedown", this.mousedown);
      return this.$el.hide();
    };

    ValueBinder.prototype.mousedown = function(e) {
      if ($(e.target).closest(".popup").length === 0) {
        return this.hide();
      }
    };

    ValueBinder.prototype.keydown = function(e) {
      if (e.keyCode === 27) {
        return this.hide();
      }
    };

    return ValueBinder;

  })(Backbone.View);

  Math.clamp = function(val, min, max) {
    return Math.min(max, Math.max(val, min));
  };

}).call(this);

//# sourceMappingURL=app.js.map
