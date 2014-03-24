
class AudioVisualizer extends Backbone.View
  el: ".audio-analyzer"

  events:
    "mousemove canvas": "drag"
    "mouseout canvas": "mouseOut"
    "click canvas": "clickCanvas"

  initialize: () ->
    @canvas = document.createElement 'canvas'
    @el.appendChild @canvas
    @canvas.width = @el.offsetWidth
    @canvas.height = 200
    @hoveredFreq = null
    @listenTo @model, "change:data", @update

  update: () =>
    data = @model.get('data')
    selectedFreq = @model.get('selectedFreq')
    if !data then return
    @scale = @canvas.width / data.length

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
    @el

  drag: (e) =>
    @hoveredFreq = parseInt(e.offsetX / @scale)

  mouseOut: (e) =>
    @hoveredFreq = null

  clickCanvas: (e) =>
    @model.set "selectedFreq", parseInt(e.offsetX / @scale)

