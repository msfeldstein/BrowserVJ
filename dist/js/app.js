(function() {
  var App, AudioInputNode, AudioVisualizer, BadTVPass, BlobbyComposition, BlurPass, ChromaticAberration, CircleGrower, Composition, CompositionPicker, CompositionSlot, EffectParameter, EffectsManager, EffectsPanel, GLSLComposition, Gamepad, InvertPass, MirrorPass, Node, Passthrough, RGBShiftPass, RGBShiftShader, SPEED, ShroomPass, SmoothValue, SphereSphereComposition, VideoComposition, WashoutPass,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.ShaderPassBase = (function() {
    function ShaderPassBase(initialValues) {
      var key, value;
      this.enabled = true;
      this.uniforms = THREE.UniformsUtils.clone(this.findUniforms(this.fragmentShader));
      for (key in initialValues) {
        value = initialValues[key];
        this.uniforms[key].value = value;
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

  })();

  Composition = (function(_super) {
    __extends(Composition, _super);

    function Composition() {
      Composition.__super__.constructor.call(this);
      this.generateThumbnail();
    }

    Composition.prototype.generateThumbnail = function() {
      var renderer;
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        clearAlpha: 1,
        transparent: true
      });
      renderer.setSize(140, 90);
      this.setup(renderer);
      renderer.render(this.scene, this.camera);
      this.thumbnail = document.createElement('img');
      this.thumbnail.src = renderer.domElement.toDataURL();
      return this.trigger("thumbnail-available");
    };

    return Composition;

  })(Backbone.Model);

  GLSLComposition = (function(_super) {
    __extends(GLSLComposition, _super);

    function GLSLComposition() {
      return GLSLComposition.__super__.constructor.apply(this, arguments);
    }

    GLSLComposition.prototype.setup = function(renderer) {
      this.renderer = renderer;
      this.uniforms = THREE.UniformsUtils.clone(this.findUniforms(this.fragmentShader));
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
      return this.scene.add(this.quad);
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

  AudioInputNode = (function(_super) {
    __extends(AudioInputNode, _super);

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
      this.set("peak", this.data[this.get('selectedFreq')]);
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

    BlobbyComposition.prototype.update = function(params) {
      var a, vertex, _i, _len, _ref, _results;
      this.time += .004;
      this.particles.rotation.y += 0.01;
      a = params.audio * 5;
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

    CircleGrower.prototype.setup = function(renderer) {
      this.renderer = renderer;
      CircleGrower.__super__.setup.call(this, this.renderer);
      return this.uniforms.circleSize.value = 300;
    };

    CircleGrower.prototype.update = function() {
      this.uniforms['uSize'].value.set(this.renderer.domElement.width, this.renderer.domElement.height);
      return this.uniforms['time'].value += 1;
    };

    CircleGrower.prototype.fragmentShader = "uniform vec2 uSize;\nvarying vec2 vUv;\nuniform float circleSize;\nuniform float time;\nvoid main (void)\n{\n  vec2 pos = mod(gl_FragCoord.xy, vec2(circleSize)) - vec2(circleSize / 2.0);\n  float dist = sqrt(dot(pos, pos));\n  dist = mod(dist + time * -1.0, circleSize + 1.0) * 2.0;\n  \n  gl_FragColor = (sin(dist / 25.0) > 0.0) \n      ? vec4(.90, .90, .90, 1.0)\n      : vec4(0.0);\n}";

    return CircleGrower;

  })(GLSLComposition);

  SphereSphereComposition = (function(_super) {
    __extends(SphereSphereComposition, _super);

    function SphereSphereComposition() {
      return SphereSphereComposition.__super__.constructor.apply(this, arguments);
    }

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

    function VideoComposition(videoFile) {
      var videoTag;
      this.videoFile = videoFile;
      VideoComposition.__super__.constructor.call(this);
      if (this.videoFile) {
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
        start: -1,
        end: 1,
        "default": -.2
      }, {
        uniform: "gShift",
        name: "Green Shift",
        start: -1,
        end: 1,
        "default": 0
      }, {
        uniform: "bShift",
        name: "Blue Shift",
        start: -1,
        end: 1,
        "default": .21
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
        start: 0,
        end: 1
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

  this.ShaderPassBase = (function() {
    function ShaderPassBase(initialValues) {
      var key, value;
      this.enabled = true;
      this.uniforms = THREE.UniformsUtils.clone(this.findUniforms(this.fragmentShader));
      for (key in initialValues) {
        value = initialValues[key];
        this.uniforms[key].value = value;
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

  })();

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
      return this.trigger("change");
    };

    return EffectsManager;

  })(Backbone.Model);

  EffectParameter = (function(_super) {
    __extends(EffectParameter, _super);

    function EffectParameter() {
      EffectParameter.__super__.constructor.call(this);
    }

    return EffectParameter;

  })(Backbone.Model);

  EffectsPanel = (function(_super) {
    __extends(EffectsPanel, _super);

    function EffectsPanel() {
      this.render = __bind(this.render, this);
      this.addEffect = __bind(this.addEffect, this);
      return EffectsPanel.__super__.constructor.apply(this, arguments);
    }

    EffectsPanel.prototype.el = ".effects";

    EffectsPanel.prototype.events = {
      "change .add-effect": "addEffect"
    };

    EffectsPanel.prototype.initialize = function() {
      this.gui = new dat.gui.GUI({
        autoPlace: false,
        width: "100%"
      });
      this.addButton = document.createElement('select');
      this.addButton.className = 'add-effect';
      this.stack = document.createElement('div');
      this.el.appendChild(this.gui.domElement);
      this.el.appendChild(this.addButton);
      this.listenTo(this.model, "change", this.render);
      return this.render();
    };

    EffectsPanel.prototype.addEffect = function(e) {
      if (e.target.value !== -1) {
        this.model.addEffectToStack(new this.model.effectClasses[e.target.value]);
        return e.target.selectedIndex = 0;
      }
    };

    EffectsPanel.prototype.render = function() {
      var audio, effect, f, i, option, val, values, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      this.addButton.innerHTML = "<option value=-1>Add Effect</option>";
      _ref = this.model.effectClasses;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        effect = _ref[i];
        option = document.createElement('option');
        option.value = i;
        option.textContent = effect.name;
        this.addButton.appendChild(option);
      }
      this.stack.innerHTML = "";
      _ref1 = this.model.stack;
      _results = [];
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        effect = _ref1[i];
        if (effect.controls) {
          continue;
        }
        f = this.gui.addFolder("" + i + " - " + effect.name);
        f.open();
        effect.controls = f;
        if (effect.options) {
          _ref2 = effect.options;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            values = _ref2[_k];
            if (values["default"]) {
              effect[values.property] = values["default"];
            }
            val = f.add(effect, values.property, values.start, values.end).name(values.name);
            val.domElement.querySelector('.property-name').appendChild(audio = document.createElement('checkbox'));
            audio.className = 'audio-toggle';
          }
        }
        if (effect.uniformValues) {
          _results.push((function() {
            var _l, _len3, _ref3, _results1;
            _ref3 = effect.uniformValues;
            _results1 = [];
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              values = _ref3[_l];
              if (values["default"]) {
                effect.uniforms[values.uniform].value = values["default"];
              }
              val = f.add(effect.uniforms[values.uniform], "value", values.start, values.end).name(values.name);
              val.domElement.previousSibling.appendChild(audio = document.createElement('input'));
              audio.type = 'checkbox';
              audio.datgui = val;
              audio.target = effect.uniforms;
              audio.property = values.uniform;
              audio.className = 'audio-toggle';
              _results1.push(audio.addEventListener('change', function(e) {
                e.target.datgui.listen();
                return application.audioVisualizer.addListener(function(params) {
                  return audio.target[audio.property].value = params.peak;
                });
              }));
            }
            return _results1;
          })());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return EffectsPanel;

  })(Backbone.View);

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
      this.setComposition(new SphereSphereComposition);
    }

    App.prototype.animate = function() {
      var _ref;
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
      return this.compositionPicker.addComposition(new BlobbyComposition);
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
      this.stats.domElement.style.left = '0px';
      this.stats.domElement.style.top = '0px';
      return document.body.appendChild(this.stats.domElement);
    };

    App.prototype.initMicrophone = function() {
      this.audioInputNode = new AudioInputNode;
      return this.audioVisualizer = new AudioVisualizer({
        model: this.audioInputNode
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
      this.renderModel.scene = this.composition.scene;
      this.renderModel.camera = this.composition.camera;
      return requestAnimationFrame(this.animate);
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
      this.level = this.model.get('peak');
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

  SmoothValue = (function() {
    function SmoothValue() {}

    return SmoothValue;

  })();

}).call(this);

//# sourceMappingURL=app.js.map
