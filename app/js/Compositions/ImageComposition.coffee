class ImageComposition extends Composition
  constructor: (@imageFile) ->
    super()
    @name = @imageFile.name
    @thumbnail = document.createElement("img")
    @thumbnail.src = URL.createObjectURL(@imageFile)
    @trigger("thumbnail-available")

  generateThumbnail: () =>

  setup: (@renderer) ->
    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene = new THREE.Scene

    @image = document.createElement("img")
    @image.src = URL.createObjectURL(@imageFile)

    @image.addEventListener "load", (e) =>
      @imageTexture.needsUpdate = true
    @imageTexture = new THREE.Texture(@image)
    @imageTexture.minFilter = THREE.LinearFilter;
    @imageTexture.magFilter = THREE.LinearFilter;

    @material = new THREE.MeshBasicMaterial(map: @imageTexture)

    @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), @material)
    @scene.add @quad
