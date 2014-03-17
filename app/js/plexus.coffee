class @Plexus
  @THRESH: 200
  constructor: (@scene) ->
    @elements = []
    @lines = []

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

  update: () ->
    for line in @lines
      @scene.remove line
    @lines = []
    for el, i in @elements
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
            existing = el.neighbors[el2.uuid] = {line: line}
          existing.line.material.opacity = (Plexus.THRESH - distance) / (Plexus.THRESH)
        else
          if existing
            @scene.remove existing.line
            delete el.neighbors[el2.uuid]

        j++
