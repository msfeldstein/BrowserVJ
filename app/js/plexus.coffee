class @Plexus
  @THRESH: 200
  constructor: (@scene) ->
    @elements = []
    @tris = []

  addElement: (e) ->
    @elements.push e
    e.neighbors = {}

  newLine: () ->
    geometry = new THREE.Geometry
    geometry.vertices.push new THREE.Vector3 0,0,0
    geometry.vertices.push new THREE.Vector3 0,0,0
    lineMaterial = new THREE.LineBasicMaterial {transparent: true, color:0xFFFFFF}
    line = new THREE.Line geometry, lineMaterial
    line

  newTriangle: (el1, el2, el3) ->
    geometry = new THREE.Geometry
    geometry.vertices.push el1.position
    geometry.vertices.push el2.position
    geometry.vertices.push el3.position
    d1 = Math.abs(el1.position.distanceTo(el2.position))
    d2 = Math.abs(el1.position.distanceTo(el3.position))
    d3 = Math.abs(el2.position.distanceTo(el3.position))
    minDist = Math.min(d1, Math.min(d2, d3))
    opacity =  (Plexus.THRESH - minDist) / Plexus.THRESH
    triMaterial = new THREE.MeshNormalMaterial {opacity: opacity, color: 0xFFFFFF}
    geometry.faces.push new THREE.Face3(0, 1, 2)
    mesh = new THREE.Mesh(geometry, triMaterial)
    mesh

  update: () ->
    # Find all the lines
    for el, i in @elements
      el.neighborArray = [] # Sorted so we can use the same algo as in openframeworks
      j = i + 1
      while j < @elements.length
        el2 = @elements[j]
        distance = Math.abs(el.position.distanceTo(el2.position))
        existing = el.neighbors[el2.uuid]
        if distance < Plexus.THRESH && distance > 1
          if not existing
            line = @newLine()
            line.geometry.vertices = [el.position, el2.position]
            @scene.add line
            existing = el.neighbors[el2.uuid] = {el: el2, line: line}
          el.neighborArray.push existing
          existing.line.material.opacity = (Plexus.THRESH - distance) / (Plexus.THRESH)
        else
          if existing
            @scene.remove existing.line
            delete el.neighbors[el2.uuid]
        j++

    # Find all the triangles
    for tri in @tris
      @scene.remove tri

    @tris = []
    for first in @elements
      for second in first.neighborArray
        for third in first.neighborArray
          if second.el.neighborArray.indexOf(third) != -1
            tri = @newTriangle first, second.el, third.el
            @scene.add tri
            @tris.push tri

