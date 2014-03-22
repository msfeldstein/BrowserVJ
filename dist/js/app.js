(function() {
  var BlurPass, CircleGrower, Composition, CompositionPicker, CompositionSlot, GLSLComposition, Gamepad, InvertPass, MirrorPass, RGBShiftPass, RGBShiftShader, ShroomPass, SphereSphereComposition, VideoComposition, WashoutPass, addEffect, composer, composition, gui, initCompositions, initPostProcessing, renderModel, renderer, stats, _animate, _init, _update,
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
      this.uniforms['uSize'].value.set(readBuffer.width, readBuffer.height);
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
        clearAlpha: 0,
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
      var ambient, light, res, size, skeleton, vertex, _i, _j, _len, _len1, _ref, _ref1;
      this.renderer = renderer;
      this.scene = new THREE.Scene;
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      this.camera.position.z = 1000;
      this.origin = new THREE.Vector3(0, 0, 0);
      this.group = new THREE.Object3D;
      this.scene.add(this.group);
      this.sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
      this.sphereMaterial = new THREE.MeshPhongMaterial({
        transparent: false,
        opacity: 1,
        color: 0xDA8258,
        specular: 0xD67484,
        shininess: 10,
        ambient: 0xAAAAAA,
        shading: THREE.FlatShading
      });
      _ref = [400];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        size = _ref[_i];
        res = 50;
        skeleton = new THREE.SphereGeometry(size, res, res);
        _ref1 = skeleton.vertices;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          vertex = _ref1[_j];
          this.addCube(this.group, vertex);
        }
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
      return this.group.rotation.y += 0.001;
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
        document.body.appendChild(videoTag);
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
          console.log(_this.video.videoWidth);
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

  BlurPass = (function(_super) {
    __extends(BlurPass, _super);

    function BlurPass() {
      return BlurPass.__super__.constructor.apply(this, arguments);
    }

    BlurPass.prototype.fragmentShader = "uniform float blurX;\nuniform vec2 uSize;\nvarying vec2 vUv;\nuniform sampler2D uTex;\n\nconst float blurSize = 1.0/512.0; // I've chosen this size because this will result in that every step will be one pixel wide if the RTScene texture is of size 512x512\n \nvoid main(void)\n{\n   vec4 sum = vec4(0.0);\n \n   // blur in y (vertical)\n   // take nine samples, with the distance blurSize between them\n   sum += texture2D(uTex, vec2(vUv.x - 4.0*blurX, vUv.y)) * 0.05;\n   sum += texture2D(uTex, vec2(vUv.x - 3.0*blurX, vUv.y)) * 0.09;\n   sum += texture2D(uTex, vec2(vUv.x - 2.0*blurX, vUv.y)) * 0.12;\n   sum += texture2D(uTex, vec2(vUv.x - blurX, vUv.y)) * 0.15;\n   sum += texture2D(uTex, vec2(vUv.x, vUv.y)) * 0.16;\n   sum += texture2D(uTex, vec2(vUv.x + blurX, vUv.y)) * 0.15;\n   sum += texture2D(uTex, vec2(vUv.x + 2.0*blurX, vUv.y)) * 0.12;\n   sum += texture2D(uTex, vec2(vUv.x + 3.0*blurX, vUv.y)) * 0.09;\n   sum += texture2D(uTex, vec2(vUv.x + 4.0*blurX, vUv.y)) * 0.05;\n \n   gl_FragColor = sum;\n}";

    return BlurPass;

  })(ShaderPassBase);

  InvertPass = (function(_super) {
    __extends(InvertPass, _super);

    function InvertPass() {
      return InvertPass.__super__.constructor.apply(this, arguments);
    }

    InvertPass.prototype.name = "Invert";

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

    ShroomPass.prototype.uniformValues = [
      {
        uniform: "amp",
        name: "Wobble Amount",
        start: 0,
        end: 0.05
      }
    ];

    ShroomPass.prototype.update = function() {
      return this.uniforms.StartRad.value += 0.01;
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
      this.uniforms['uSize'].value.set(readBuffer.width, readBuffer.height);
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

  renderer = null;

  composition = renderModel = composer = gui = stats = null;

  _init = function() {
    noise.seed(Math.random());
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      clearAlpha: 0,
      transparent: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    gui = new dat.gui.GUI;
    initPostProcessing();
    initCompositions();
    stats = new Stats;
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    return document.body.appendChild(stats.domElement);
  };

  initCompositions = function() {
    var compositionPicker;
    compositionPicker = new CompositionPicker;
    document.body.appendChild(compositionPicker.domElement);
    compositionPicker.addComposition(new CircleGrower);
    return compositionPicker.addComposition(new SphereSphereComposition);
  };

  window.setComposition = function(comp) {
    composition = comp;
    composition.setup(renderer);
    renderModel.scene = composition.scene;
    return renderModel.camera = composition.camera;
  };

  initPostProcessing = function() {
    var p;
    composer = new THREE.EffectComposer(renderer);
    renderModel = new THREE.RenderPass(new THREE.Scene, new THREE.PerspectiveCamera);
    renderModel.renderToScreen = true;
    composer.addPass(renderModel);
    addEffect(new MirrorPass);
    addEffect(new InvertPass);
    addEffect(p = new ShroomPass);
    p.enabled = true;
    return p.renderToScreen = true;
  };

  addEffect = function(effect) {
    var f, values, _i, _len, _ref, _results;
    effect.enabled = false;
    composer.addPass(effect);
    f = gui.addFolder(effect.name);
    f.add(effect, "enabled");
    if (effect.uniformValues) {
      _ref = effect.uniformValues;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        values = _ref[_i];
        _results.push(f.add(effect.uniforms[values.uniform], "value", values.start, values.end).name(values.name));
      }
      return _results;
    }
  };

  _update = function(t) {
    return composition != null ? composition.update() : void 0;
  };

  _animate = function() {
    composer.render();
    return stats.update();
  };

  window.loopF = function(fn) {
    var f;
    f = function() {
      fn();
      return requestAnimationFrame(f);
    };
    return f();
  };

  $(function() {
    _init();
    loopF(_update);
    return loopF(_animate);
  });

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

  CompositionPicker = (function() {
    function CompositionPicker() {
      var i, slot, _i;
      this.compositions = [];
      this.domElement = document.createElement('div');
      this.domElement.className = 'composition-picker';
      this.domElement.draggable = true;
      for (i = _i = 0; _i <= 1; i = ++_i) {
        slot = document.createElement('div');
        slot.className = 'slot';
        this.domElement.appendChild(slot);
      }
      this.domElement.addEventListener('dragover', (function(_this) {
        return function(e) {
          e.preventDefault();
          return e.target.classList.add('dragover');
        };
      })(this));
      this.domElement.addEventListener('dragleave', (function(_this) {
        return function(e) {
          e.preventDefault();
          return e.target.classList.remove('dragover');
        };
      })(this));
      this.domElement.addEventListener('drop', (function(_this) {
        return function(e) {
          e.preventDefault();
          e.target.classList.remove('dragover');
          return _this.drop(e);
        };
      })(this));
    }

    CompositionPicker.prototype.addComposition = function(comp) {
      var slot;
      slot = new CompositionSlot({
        model: comp
      });
      return this.domElement.appendChild(slot.render());
    };

    CompositionPicker.prototype.drop = function(e) {
      var file;
      file = e.dataTransfer.files[0];
      console.log(file);
      composition = new VideoComposition(file);
      return this.addComposition(composition);
    };

    return CompositionPicker;

  })();

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
      return setComposition(this.model);
    };

    return CompositionSlot;

  })(Backbone.View);

}).call(this);

//# sourceMappingURL=app.js.map
