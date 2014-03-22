class AudioVisualizer extends Backbone.View
  className: "audio-visualizer"

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
    @canvas.width = 500
    @canvas.height = 300
    @selectedFreq = 500
    @hoveredFreq = null

  startAudio: (stream) =>
    mediaStreamSource = @context.createMediaStreamSource(stream)
    mediaStreamSource.connect @analyzer
    requestAnimationFrame @update

  update: () =>
    requestAnimationFrame @update
    @data = @data || new Uint8Array(@analyzer.frequencyBinCount)
    @analyzer.getByteFrequencyData(@data);
    total = 0
    ctx = @canvas.getContext('2d')
    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.fillRect(0, 0, @canvas.width, @canvas.height);
    ctx.beginPath()
    ctx.strokeStyle = "#FF0000"
    ctx.moveTo 0, @canvas.height
    for amp, i in @data
      total += amp
      ctx.lineTo(i / 2, @canvas.height - amp)
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
    ctx.fillRect @canvas.width - 10, @canvas.height - @level, 10, @canvas.height

  render: () =>
    @el

  drag: (e) =>
    @hoveredFreq = e.offsetX

  mouseOut: (e) =>
    @hoveredFreq = null

  clickCanvas: (e) =>
    @selectedFreq = e.offsetX