class @AudioInput extends VJSSignal
  readonly: true
  @MAX_AUDIO_LEVEL: 200
  inputs: [
    {name: "gain", type: "number", min: 0, max: 1, default: 0.1}
  ]
  outputs: [
    {name: "peak", type: "number", min: 0, max: 1}
  ]

  name: "Audio"
  customView: AudioVisualizer
  outputProperty: 'peak'
  initialize: () ->
    navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia_({audio: true}, @startAudio, (()->))
    @context = new webkitAudioContext()
    @analyzer = @context.createAnalyser()
    @set "selectedFreq", 500

  startAudio: (stream) =>
    mediaStreamSource = @context.createMediaStreamSource(stream)
    mediaStreamSource.connect @analyzer

  update: () =>
    if !@data
      @data = new Uint8Array(@analyzer.frequencyBinCount)
      @set "data", @data
    @analyzer.getByteFrequencyData(@data);
    @set "peak", @data[@get('selectedFreq')] / AudioInput.MAX_AUDIO_LEVEL * @get('gain') / 0.1
    @trigger "change:data"

  getCustomViews: () ->
    [new AudioVisualizer(model: @)]


class AudioVisualizer extends Backbone.View
  className: 'signal'
  events:
    "mousemove canvas": "drag"
    "mouseout canvas": "mouseOut"
    "click canvas": "clickCanvas"

  initialize: () ->
    @canvas = document.createElement 'canvas'
    @el.appendChild @canvas
    @canvas.width = 300
    @canvas.height = 120
    @hoveredFreq = null
    @listenTo @model, "change:data", @update
    $(window).resize @render

  update: () =>
    if !@visible then return
    data = @model.get('data')
    selectedFreq = @model.get('selectedFreq')
    if !data then return
    @scale = @canvas.width / data.length


    ctx = @canvas.getContext('2d')
    ctx.save()
    ctx.fillStyle = "rgba(0,0,0,0.4)"
    ctx.fillRect(0, 0, @canvas.width, @canvas.height);
    ctx.translate(0, @canvas.height)
    ctx.scale @scale, @scale
    ctx.translate(0, -@canvas.height)
    ctx.beginPath()
    ctx.strokeStyle = "#FF0000"
    ctx.moveTo 0, @canvas.height
    for amp, i in data
      ctx.lineTo(i, @canvas.height - amp)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = "#FF0000"
    ctx.moveTo selectedFreq, @canvas.height
    ctx.lineTo selectedFreq, 0
    ctx.stroke()

    if @hoveredFreq
      ctx.beginPath()
      ctx.strokeStyle = "#FFFFFF"
      ctx.moveTo @hoveredFreq, 0
      ctx.lineTo @hoveredFreq, @canvas.height
      ctx.stroke()


    @level = @model.get('peak') * @canvas.height
    ctx.restore()
    ctx.fillStyle = "#FF0000"
    ctx.fillRect @canvas.width - 10, @canvas.height - @level, 10, @canvas.height

  render: () =>
    @canvas.width = @canvas.parentNode.offsetWidth || 300
    @el

  drag: (e) =>
    @hoveredFreq = parseInt(e.offsetX / @scale)

  mouseOut: (e) =>
    @hoveredFreq = null

  clickCanvas: (e) =>
    @model.set "selectedFreq", parseInt(e.offsetX / @scale)
