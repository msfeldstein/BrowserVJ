(function() {
  var animate, camera, geometry, init, loopF, material, mesh, plexus, renderer, scene, update;

  camera = scene = renderer = 0;

  geometry = material = mesh = 0;

  plexus = 0;

  init = function() {
    var addMesh, cubesize, i, _i;
    noise.seed(Math.random());
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    scene = new THREE.Scene();
    cubesize = 10;
    geometry = new THREE.CubeGeometry(cubesize, cubesize, cubesize);
    material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true
    });
    plexus = new Plexus(scene);
    addMesh = function() {
      var wanderer;
      mesh = new THREE.Mesh(geometry, material);
      wanderer = new Wanderer(mesh);
      return plexus.addElement(mesh);
    };
    for (i = _i = 1; _i <= 24; i = ++_i) {
      addMesh();
    }
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    return document.body.appendChild(renderer.domElement);
  };

  update = function() {
    return plexus.update();
  };

  animate = function() {
    return renderer.render(scene, camera);
  };

  loopF = function(fn) {
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

}).call(this);

(function() {


}).call(this);

(function() {
  this.Plexus = (function() {
    Plexus.THRESH = 200;

    function Plexus(scene) {
      this.scene = scene;
      this.elements = [];
      this.lines = [];
    }

    Plexus.prototype.addElement = function(e) {
      this.elements.push(e);
      return e.neighbors = {};
    };

    Plexus.prototype.newLine = function() {
      var geometry, line, lineMaterial;
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

    Plexus.prototype.update = function() {
      var distance, el, el2, existing, i, j, line, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = this.lines;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        this.scene.remove(line);
      }
      this.lines = [];
      _ref1 = this.elements;
      _results = [];
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        el = _ref1[i];
        j = i + 1;
        _results.push((function() {
          var _results1;
          _results1 = [];
          while (j < this.elements.length) {
            el2 = this.elements[j];
            distance = Math.abs(el.position.distanceTo(el2.position));
            existing = el.neighbors[el2.uuid];
            if (distance < Plexus.THRESH && distance > 1) {
              if (!existing) {
                line = this.newLine();
                line.geometry.vertices = [el.position, el2.position];
                this.scene.add(line);
                existing = el.neighbors[el2.uuid] = {
                  line: line
                };
              }
              existing.line.material.opacity = (Plexus.THRESH - distance) / Plexus.THRESH;
            } else {
              if (existing) {
                this.scene.remove(existing.line);
                delete el.neighbors[el2.uuid];
              }
            }
            _results1.push(j++);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return Plexus;

  })();

}).call(this);

(function() {
  var SPEED,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
