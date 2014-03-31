class VJSLayerMixer extends Backbone.Model
  initialize: () ->
    super()
    @output = @get("output")
    @canvas = document.createElement('canvas')
    @output.appendChild(@canvas)
    @canvas.width = @output.offsetWidth
    @canvas.height = @output.offsetHeight
    $(window).resize () =>
      @canvas.width = @output.offsetWidth
      @canvas.height = @output.offsetHeight

  render: () =>
    ctx = @canvas.getContext('2d')
    ctx.clearRect(0,0,@canvas.width, @canvas.height)
    for layer, i in @get("layers")
      if layer.get("composition")
        layer.render()
        ctx.globalAlpha = layer.get("opacity")
        ctx.globalCompositeOperation = layer.get("Blend Mode")
        ctx.drawImage(layer.output(), 0, 0)
