class Composition extends Backbone.Model
  constructor: () ->
    super()
    @generateThumbnail()

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
