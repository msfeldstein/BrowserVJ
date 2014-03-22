class AudioVisualizer extends Backbone.View
  el: ".audio-analyzer"

  events:
    "mousemove canvas": "drag"
    "mouseout canvas": "mouseOut"
    "click canvas": "clickCanvas"

  constructor: () ->
    super()
    navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia_({audio: true}, @startAudio, (()->))
    @context = new webkitAudioContext()
    @analyzer = @context.createAnalyser()
    @canvas = document.createElement 'canvas'
    @el.appendChild @canvas
    @canvas.width = @el.offsetWidth
    @canvas.height = 200
    @selectedFreq = 500
    @hoveredFreq = null
    @update()

  startAudio: (stream) =>
    mediaStreamSource = @context.createMediaStreamSource(stream)
    mediaStreamSource.connect @analyzer
    requestAnimationFrame @update

  update: () =>
    requestAnimationFrame @update
    @data = @data || new Uint8Array(@analyzer.frequencyBinCount)
    @analyzer.getByteFrequencyData(@data);
    @scale = @canvas.width / @data.length

    ctx = @canvas.getContext('2d')
    ctx.save()
    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.fillRect(0, 0, @canvas.width, @canvas.height);
    ctx.translate(0, @canvas.height)
    ctx.scale @scale, @scale
    ctx.translate(0, -@canvas.height)
    ctx.beginPath()
    ctx.strokeStyle = "#FF0000"
    ctx.moveTo 0, @canvas.height
    for amp, i in @data
      ctx.lineTo(i, @canvas.height - amp)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = "#FF0000"
    ctx.moveTo @selectedFreq, @canvas.height
    ctx.lineTo @selectedFreq, 0
    ctx.stroke()

    if @hoveredFreq
      ctx.beginPath()
      ctx.strokeStyle = "#444444"
      ctx.moveTo @hoveredFreq, 0
      ctx.lineTo @hoveredFreq, @canvas.height
      ctx.stroke()

    ctx.fillStyle = "#FF0000"
    @level = @data[@selectedFreq]
    ctx.restore()
    ctx.fillRect @canvas.width - 10, @canvas.height - @level, 10, @canvas.height
    

  render: () =>
    @el

  drag: (e) =>
    @hoveredFreq = parseInt(e.offsetX / @scale)

  mouseOut: (e) =>
    @hoveredFreq = null

  clickCanvas: (e) =>
    @selectedFreq = parseInt(e.offsetX / @scale)