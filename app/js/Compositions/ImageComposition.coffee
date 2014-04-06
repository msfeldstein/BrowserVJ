class ImageComposition extends Composition
  constructor: (@imageFile) ->
    super()
    @name = @imageFile.name
    @animate = (@imageFile.type == "image/gif")
    # @thumbnail = document.createElement("img")
    # @thumbnail.src = URL.createObjectURL(@imageFile)
    # @trigger("thumbnail-available")

  setup: (@renderer) ->
    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene = new THREE.Scene

    @image = document.createElement("img")
    @image.src = URL.createObjectURL(@imageFile)
    # document.body.appendChild(@image)

    @image.addEventListener "load", (e) =>
      @gifCanvas = document.createElement("canvas")
      @gifCanvas.width = @image.width
      @gifCanvas.height = @image.height
      @imageTexture = new THREE.Texture(@gifCanvas)
      @imageTexture.minFilter = THREE.LinearFilter;
      @imageTexture.magFilter = THREE.LinearFilter;
      @imageTexture.needsUpdate = true
      @material = new THREE.MeshBasicMaterial(map: @imageTexture, overdraw: true, side:THREE.DoubleSide)

      @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), @material)
      @scene.add @quad


  update: () =>
    if @animate && @imageTexture
      ctx = @gifCanvas.getContext("2d")
      ctx.drawImage(@image, 0, 0)
      @imageTexture.needsUpdate = true