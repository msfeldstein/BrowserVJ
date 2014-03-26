class VideoComposition extends Composition
  name: "Video"

  inputs: [
    {name: "Playing", type: "boolean", toggle: true, default: true}
  ]

  constructor: (@videoFile) ->
    super()
    if @videoFile
      @name = @videoFile.name
      videoTag = document.createElement('video')
      videoTag.src = URL.createObjectURL(@videoFile)
      videoTag.addEventListener 'loadeddata', (e) =>
        videoTag.currentTime = videoTag.duration / 2
        canvas = document.createElement('canvas')
        canvas.width = videoTag.videoWidth
        canvas.height = videoTag.videoHeight
        context = canvas.getContext('2d')
        f = () =>
          if videoTag.readyState != videoTag.HAVE_ENOUGH_DATA
            setTimeout f, 100
            return
          context.drawImage videoTag, 0, 0
          @thumbnail = document.createElement('img')
          @thumbnail.src = canvas.toDataURL()
          videoTag.pause()
          videoTag = null
          @trigger "thumbnail-available"
        setTimeout f, 100

  setup: (@renderer) ->
    @enabled = true
    @renderToScreen = false
    @needsSwap = true

    @camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    @scene = new THREE.Scene

    @video = document.createElement 'video'
    if @videoFile
      @video.src = URL.createObjectURL(@videoFile)
    else
      @video.src = "assets/timescapes.mp4"
    @video.load()
    @video.play()
    @video.volume = 0
    window.video = @video
    @video.addEventListener 'loadeddata', () =>
      @videoImage = document.createElement 'canvas'
      @videoImage.width = @video.videoWidth
      @videoImage.height = @video.videoHeight

      @videoImageContext = @videoImage.getContext('2d')
      @videoTexture = new THREE.Texture(@videoImage)
      @videoTexture.minFilter = THREE.LinearFilter;
      @videoTexture.magFilter = THREE.LinearFilter;
      @material = new THREE.MeshBasicMaterial(map: @videoTexture)


      @quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), @material)
      @scene.add @quad

  "change:Playing": (model, playing) =>
    if playing then @video.play()
    else @video.pause()

  update: () ->
    if @videoTexture
      @videoImageContext.drawImage @video, 0, 0
      @videoTexture.needsUpdate = true