(function() {
  var Gamepad, RGBShiftPass, RGBShiftShader, addCube, addFace, camera, composer, controls, gamepad, geometry, group, gui, initPostProcessing, options, origin, renderModel, renderer, rgbShift, scene, shroomPass, _animate, _init, _update, _useTrackball,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.ShaderPassBase = (function() {
    function ShaderPassBase(initialValues) {
      var key, value;
      this.enabled = true;
      this.uniforms = THREE.UniformsUtils.clone(this.findUniforms(this.fragmentShader));
      console.log(this.uniforms);
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
          console.log(line);
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
        case "sampler2D":
          return {
            type: "t",
            value: null
          };
      }
    };

    return ShaderPassBase;

  })();

  this.ShroomPass = (function(_super) {
    __extends(ShroomPass, _super);

    function ShroomPass() {
      return ShroomPass.__super__.constructor.apply(this, arguments);
    }

    ShroomPass.prototype.update = function() {
      return this.uniforms.StartRad.value += 0.01;
    };

    ShroomPass.prototype.fragmentShader = "// Constants\nconst float C_PI    = 3.1415;\nconst float C_2PI   = 2.0 * C_PI;\nconst float C_2PI_I = 1.0 / (2.0 * C_PI);\nconst float C_PI_2  = C_PI / 2.0;\n\nuniform float StartRad;\nuniform float freq;\nuniform float amp;\nuniform vec2 uSize;\nvarying vec2 vUv;\n\nuniform sampler2D uTex;\n\nvoid main (void)\n{\n    vec2  perturb;\n    float rad;\n    vec4  color;\n\n    // Compute a perturbation factor for the x-direction\n    rad = (vUv.s + vUv.t - 1.0 + StartRad) * freq;\n\n    // Wrap to -2.0*PI, 2*PI\n    rad = rad * C_2PI_I;\n    rad = fract(rad);\n    rad = rad * C_2PI;\n\n    // Center in -PI, PI\n    if (rad >  C_PI) rad = rad - C_2PI;\n    if (rad < -C_PI) rad = rad + C_2PI;\n\n    // Center in -PI/2, PI/2\n    if (rad >  C_PI_2) rad =  C_PI - rad;\n    if (rad < -C_PI_2) rad = -C_PI - rad;\n\n    perturb.x  = (rad - (rad * rad * rad / 6.0)) * amp;\n\n    // Now compute a perturbation factor for the y-direction\n    rad = (vUv.s - vUv.t + StartRad) * freq;\n\n    // Wrap to -2*PI, 2*PI\n    rad = rad * C_2PI_I;\n    rad = fract(rad);\n    rad = rad * C_2PI;\n\n    // Center in -PI, PI\n    if (rad >  C_PI) rad = rad - C_2PI;\n    if (rad < -C_PI) rad = rad + C_2PI;\n\n    // Center in -PI/2, PI/2\n    if (rad >  C_PI_2) rad =  C_PI - rad;\n    if (rad < -C_PI_2) rad = -C_PI - rad;\n\n    perturb.y  = (rad - (rad * rad * rad / 6.0)) * amp;\n    vec2 pos = vUv.st;\n    pos.x = 1.0 - pos.x;\n    color = texture2D(uTex, perturb + pos);\n\n    gl_FragColor = vec4(color.rgb, color.a);\n}";

    return ShroomPass;

  })(ShaderPassBase);

  this.ShaderPassBase = (function() {
    function ShaderPassBase(initialValues) {
      var key, value;
      this.enabled = true;
      this.uniforms = THREE.UniformsUtils.clone(this.findUniforms(this.fragmentShader));
      console.log(this.uniforms);
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
          console.log(line);
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
        case "sampler2D":
          return {
            type: "t",
            value: null
          };
      }
    };

    return ShaderPassBase;

  })();

  scene = group = null;

  geometry = new THREE.CubeGeometry(20, 20, 2);

  geometry = new THREE.SphereGeometry(10, 32, 32);

  origin = new THREE.Vector3(0, 0, 0);

  addCube = function(group, position) {
    var material, mesh;
    material = new THREE.MeshPhongMaterial({
      transparent: false,
      opacity: 1,
      color: 0xDA8258,
      specular: 0xD67484,
      shininess: 10,
      ambient: 0xAAAAAA,
      shading: THREE.FlatShading
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position = position;
    mesh.lookAt(origin);
    return group.add(mesh);
  };

  addFace = function(group, face, skeleton) {
    var d1, d2, d3, line, lineMaterial, material, p1, p2, v1, v2, v3;
    material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.3,
      color: 0xFFFFFF,
      side: THREE.DoubleSide
    });
    v1 = skeleton.vertices[face.a].clone();
    v2 = skeleton.vertices[face.b].clone();
    v3 = skeleton.vertices[face.c].clone();
    d1 = v1.distanceTo(v2);
    d2 = v1.distanceTo(v3);
    d3 = v2.distanceTo(v3);
    p1 = p2 = null;
    if (d1 > d2 && d1 > d3) {
      p1 = v1;
      p2 = v2;
    } else if (d2 > d1 && d2 > d3) {
      p1 = v1;
      p2 = v3;
    } else {
      p1 = v2;
      p2 = v3;
    }
    geometry = new THREE.Geometry;
    geometry.vertices.push(p1);
    geometry.vertices.push(p2);
    geometry = new THREE.SphereGeometry(20, 8, 8);
    lineMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      linewidth: 5,
      opacity: 0.5,
      color: 0xFFFFFF,
      linecap: "butt"
    });
    line = new THREE.Line(geometry, lineMaterial);
    return group.add(line);
  };

  this.setup = function(s) {
    var ambient, light, res, size, skeleton, vertex, _i, _j, _len, _len1, _ref, _ref1;
    scene = s;
    group = new THREE.Object3D;
    scene.add(group);
    _ref = [400];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      size = _ref[_i];
      res = 50;
      skeleton = new THREE.SphereGeometry(size, res, res);
      _ref1 = skeleton.vertices;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        vertex = _ref1[_j];
        addCube(group, vertex);
      }
    }
    light = new THREE.SpotLight(0xFFFFFF);
    light.position.set(1000, 1000, 300);
    scene.add(light);
    light = new THREE.AmbientLight(0x222222);
    scene.add(light);
    ambient = new THREE.PointLight(0x444444, 1, 10000);
    ambient.position.set(500, 500, 500);
    scene.add(ambient);
    ambient = new THREE.PointLight(0x444444, 1, 10000);
    ambient.position.set(-500, 500, 500);
    return scene.add(ambient);
  };

  this.update = function(scene) {
    return group.rotation.y += 0.001;
  };

  camera = scene = renderer = controls = null;

  renderModel = composer = rgbShift = shroomPass = gui = null;

  gamepad = null;

  options = {};

  _init = function() {
    noise.seed(Math.random());
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      clearAlpha: 0,
      transparent: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    gui = new dat.gui.GUI;
    setup(scene);
    initPostProcessing();
    gamepad = new Gamepad;
    window.gamepad = gamepad;
    gamepad.addEventListener(Gamepad.STICK_1, function(val) {
      if (Math.abs(val.y) < 0.04) {
        val.y = 0;
      }
      return rgbShift.uniforms.uRedShift.value = rgbShift.uniforms.uBlueShift.value = rgbShift.uniforms.uGreenShift.value = 1 + val.y;
    });
    return gamepad.addEventListener(Gamepad.RIGHT_SHOULDER, function(val) {
      return console.log(val);
    });
  };

  initPostProcessing = function() {
    composer = new THREE.EffectComposer(renderer);
    renderModel = new THREE.RenderPass(scene, camera);
    renderModel.renderToScreen = true;
    composer.addPass(renderModel);
    shroomPass = new ShroomPass({
      amp: .01,
      StartRad: 0,
      freq: 10
    });
    shroomPass.renderToScreen = true;
    gui.add(shroomPass.uniforms.amp, "value", 0, 0.05);
    return composer.addPass(shroomPass);
  };

  _useTrackball = function(camera) {
    controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];
    return controls.addEventListener('change', _animate);
  };

  _update = function(t) {
    if (controls != null) {
      controls.update();
    }
    return update();
  };

  _animate = function() {
    return composer.render();
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

}).call(this);

//# sourceMappingURL=app.js.map
