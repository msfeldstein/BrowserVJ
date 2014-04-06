class ShapeSlideComposition extends CanvasComposition
  name: "Shape Slide"

  constructor: () ->
    super()
    @shapes = []

  inputs: [
    {name: "trigger", type: "boolean"}
    {name: "Triangle", type: "boolean"}
    {name: "Square", type: "boolean"}
    {name: "Circle", type: "boolean"}
    {name: "Fill", type: "boolean", toggle: true, default: true}
    {name: "color", type: "color", default: "#FF0000"}
  ]

  "change:trigger": (obj, val) =>
    if val
      shape = ["Square", "Triangle", "Circle"][Math.floor(Math.random()*3)]
      @shapes.push({shape: shape, life: 1})

  "change:Triangle": (obj, val) =>
    if val
      @shapes.push({shape: "Triangle", life: 0})

  "change:Circle": (obj, val) =>
    if val
      @shapes.push({shape: "Circle", life: 0})

  "change:Square": (obj, val) =>
    if val
      @shapes.push({shape: "Square", life: 0})

  draw: () ->
    ctx = @canvas.getContext("2d")
    ctx.save()
    ctx.clearRect(0, 0, @canvas.width, @canvas.height)
    ctx.strokeStyle = ctx.fillStyle = @get("color").toString()
    ctx.lineWidth = 5
    ctx.translate(@canvas.width / 2, @canvas.height / 2)
    for shape in @shapes
      ctx.globalAlpha = 1
      size = 150 + 300 * (1 - shape.life)
      @["draw#{shape.shape}"](ctx, shape)
      shape.life += 0.02
    @shapes = @shapes.filter (s) -> s.life < 2
    ctx.restore()
    ctx.globalAlpha = 1

  drawSquare: (ctx, shape) ->
    life = shape.life
    if life < 1
      life = easeInOutQuad(life, 0, 1, 1)
      if @get("Fill")
        ctx.fillRect(-250, -250, 500, 500 * life)
      else
        ctx.strokeRect(-250, -250, 500, 500 * life)

  drawCircle: (ctx, shape) ->
    life = shape.life
    if life < 1 then life = easeOutQuad(life, 0, 1, 1)
    if life == 0 then return
    size = 250
    if life > 1 then size -= 50 * (life - 1)
    if life > 1 then ctx.globalAlpha = Math.clamp(1 - (life - 1) * 2, 0, 1)
    ctx.beginPath()
    
    if @get("Fill")
      ctx.moveTo(0, 0)
      ctx.lineTo(500 / 2, 0)
    theta = -Math.min(life, 1) * 2 * Math.PI
    ctx.arc(0, 0, size, 0, theta, true)
    if @get("Fill")
      ctx.fill()
    else
      ctx.stroke()


  drawTriangle: (ctx, size) ->
    ctx.beginPath()
    ctx.moveTo(0, -size / 2)
    p1x = size / 2 * Math.sin(2 * Math.PI / 3)
    p1y = -size / 2 * Math.cos(2 * Math.PI / 3)
    ctx.lineTo(p1x, p1y)
    p2x = size / 2 * Math.sin(4 * Math.PI / 3)
    p2y = -size / 2 * Math.cos(4 * Math.PI / 3)
    ctx.lineTo(p2x, p2y)
    ctx.closePath()
    if @get("Fill")
      ctx.fill()
    else
      ctx.stroke()
    