class RandomShapeComposition extends CanvasComposition
  name: "Random Shapes"

  inputs: [
    {name: "trigger", type: "boolean"}
  ]

  draw: () ->
    ctx = @canvas.getContext("2d")
    ctx.clearRect(0, 0, @canvas.width, @canvas.height)
    ctx.fillStyle = "#FF0000"
    ctx.fillRect(@canvas.width / 2 + 500 * Math.sin(@time / 10), 50, 50, 50)
