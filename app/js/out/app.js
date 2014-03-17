(function() {
  var ParticleWanderer, SPEED, animate, buffer, camera, controls, geometry, init, material, mesh, options, plexus, renderer, scene, update,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  camera = scene = renderer = buffer = controls = 0;

  geometry = material = mesh = 0;

  plexus = 0;

  options = {
    mirror: false,
    feedback: 0
  };

  init = function() {
    var addMesh, cubeMaterial, cubesize, i, _i;
    noise.seed(Math.random());
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];
    controls.addEventListener('change', animate);
    scene = new THREE.Scene();
    cubesize = 7;
    geometry = new THREE.SphereGeometry(cubesize, cubesize, cubesize);
    cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      wireframe: true,
      transparent: true,
      opacity: .1,
      visible: true
    });
    plexus = new Plexus(scene, {
      thresh: 200
    });
    addMesh = function() {
      var wanderer;
      mesh = new THREE.Mesh(geometry, cubeMaterial);
      scene.add(mesh);
      wanderer = new Wanderer(mesh);
      return plexus.addElement(mesh);
    };
    for (i = _i = 1; _i <= 24; i = ++_i) {
      addMesh();
    }
    buffer = new THREE.CanvasRenderer();
    buffer.setSize(window.innerWidth, window.innerHeight);
    renderer = new THREE.CanvasRenderer();
    renderer.autoClear = false;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return require(['js/dat.gui.min.js'], function(GUI) {
      var fieldset, gui;
      gui = new dat.gui.GUI;
      gui.add(options, "feedback", 0, 1);
      gui.add(options, "mirror");
      fieldset = gui.addFolder('Dots');
      fieldset.add(cubeMaterial, 'visible');
      fieldset.add(cubeMaterial, 'opacity', 0, 1);
      return fieldset = gui.addFolder('Lines');
    });
  };

  update = function() {
    plexus.update();
    return controls.update();
  };

  animate = function() {
    var canvas, ctx;
    canvas = renderer.domElement;
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0," + (1 - options.feedback) + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    buffer.render(scene, camera);
    ctx.drawImage(buffer.domElement, 0, 0);
    if (options.mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      return ctx.drawImage(buffer.domElement, 0, 0);
    }
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
    init();
    loopF(update);
    return loopF(animate);
  });

  this.Particle = (function() {
    function Particle(pr, vr) {
      this.update = __bind(this.update, this);
      var cubeMaterial, cubesize;
      this.velocity = new THREE.Vector3(this.rand(vr), this.rand(vr), this.rand(vr));
      this.position = new THREE.Vector3(this.rand(pr), this.rand(pr), this.rand(pr));
      cubesize = 7;
      geometry = new THREE.SphereGeometry(cubesize, cubesize, cubesize);
      cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        wireframe: true,
        transparent: true,
        opacity: 1,
        visible: true
      });
      this.mesh = new THREE.Mesh(geometry, cubeMaterial);
      this.mesh.position = this.position;
      loopF(this.update);
    }

    Particle.prototype.update = function() {
      this.position.add(this.velocity);
      return this.velocity.add(this.position.clone().multiplyScalar(-.0001));
    };

    Particle.prototype.rand = function(size) {
      return Math.random() * size * 2 - size;
    };

    return Particle;

  })();

  ParticleWanderer = (function() {
    function ParticleWanderer(scene) {}

    return ParticleWanderer;

  })();

  this.Plexus = (function() {
    function Plexus(scene, opts) {
      this.scene = scene;
      this.opts = opts != null ? opts : {
        thresh: 200
      };
      this.elements = [];
      this.tris = [];
      this.trianglePool = [];
    }

    Plexus.prototype.addElement = function(e) {
      this.elements.push(e);
      return e.neighbors = {};
    };

    Plexus.prototype.newLine = function() {
      var line, lineMaterial;
      geometry = new THREE.Geometry;
      geometry.vertices.push(new THREE.Vector3(0, 0, 0));
      geometry.vertices.push(new THREE.Vector3(0, 0, 0));
      lineMaterial = new THREE.LineBasicMaterial({
        transparent: true,
        color: 0xFFFFFF
      });
      line = new THREE.Line(geometry, lineMaterial);
      return line;
    };

    Plexus.prototype.newTriangle = function(el1, el2, el3) {
      var d1, d2, d3, minDist, triMaterial;
      mesh = this.trianglePool.pop();
      if (!mesh) {
        geometry = new THREE.Geometry;
        triMaterial = new THREE.MeshNormalMaterial({
          opacity: 1,
          color: 0xFFFFFF
        });
        geometry.faces.push(new THREE.Face3(0, 1, 2));
        mesh = new THREE.Mesh(geometry, triMaterial);
      }
      mesh.geometry.vertices = [el1.position, el2.position, el3.position];
      d1 = Math.abs(el1.position.distanceTo(el2.position));
      d2 = Math.abs(el1.position.distanceTo(el3.position));
      d3 = Math.abs(el2.position.distanceTo(el3.position));
      minDist = Math.max(d1, Math.max(d2, d3));
      mesh.material.opacity = (this.opts.thresh - minDist) / this.opts.thresh;
      return mesh;
    };

    Plexus.prototype.update = function() {
      var distance, el, el2, existing, first, i, j, line, second, third, tri, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      _ref = this.elements;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        el = _ref[i];
        el.neighborArray = [];
        j = i + 1;
        while (j < this.elements.length) {
          el2 = this.elements[j];
          distance = Math.abs(el.position.distanceTo(el2.position));
          existing = el.neighbors[el2.uuid];
          if (distance < this.opts.thresh && distance > 1) {
            if (!existing) {
              line = this.newLine();
              line.geometry.vertices = [el.position, el2.position];
              this.scene.add(line);
              existing = el.neighbors[el2.uuid] = {
                el: el2,
                line: line
              };
            }
            el.neighborArray.push(existing);
            existing.line.material.opacity = (this.opts.thresh - distance) / this.opts.thresh;
          } else {
            if (existing) {
              this.scene.remove(existing.line);
              delete el.neighbors[el2.uuid];
            }
          }
          j++;
        }
      }
      _ref1 = this.tris;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        tri = _ref1[_j];
        this.scene.remove(tri);
        this.trianglePool.push(tri);
      }
      this.tris = [];
      _ref2 = this.elements;
      _results = [];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        first = _ref2[_k];
        _results.push((function() {
          var _l, _len3, _ref3, _results1;
          _ref3 = first.neighborArray;
          _results1 = [];
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            second = _ref3[_l];
            _results1.push((function() {
              var _len4, _m, _ref4, _results2;
              _ref4 = first.neighborArray;
              _results2 = [];
              for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
                third = _ref4[_m];
                if (second.el.neighbors[third.el.uuid]) {
                  tri = this.newTriangle(first, second.el, third.el);
                  this.scene.add(tri);
                  _results2.push(this.tris.push(tri));
                } else {
                  _results2.push(void 0);
                }
              }
              return _results2;
            }).call(this));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return Plexus;

  })();

  SPEED = 1 / 20000;

  this.Wanderer = (function() {
    function Wanderer(mesh) {
      this.mesh = mesh;
      this.update = __bind(this.update, this);
      requestAnimationFrame(this.update);
      this.seed = Math.random() * 1000;
    }

    Wanderer.prototype.update = function(t) {
      t = t * SPEED + this.seed;
      this.mesh.position.x = noise.simplex2(t, 0) * 600;
      this.mesh.position.y = noise.simplex2(0, t) * 300;
      this.mesh.position.z = noise.simplex2(t * 1.1 + 300, 0) * 100;
      return requestAnimationFrame(this.update);
    };

    return Wanderer;

  })();

}).call(this);

//# sourceMappingURL=app.js.map
