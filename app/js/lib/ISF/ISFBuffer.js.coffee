class @ISFBuffer
  constructor: (pass) ->
    @gl = ISFGL.gl
    @persistent = pass.persistent
    @float = pass.float
    @name = pass.target
    @textures = []
    @textures.push new ISFTexture(pass)
    if @persistent
      @textures.push new ISFTexture(pass)
    @flipFlop = false
    @fbo = @gl.createFramebuffer()
    @flipFlop = false

  setSize: (w, h) ->
    if @width != w || @height != h
      @width = w
      @height = h
      for texture in @textures
        texture.setSize(w, h)

  readTexture: () ->
    if @flipFlop && @persistent then @textures[1] else @textures[0]
  writeTexture: () ->
    if !@flipFlop && @persistent then @textures[1] else @textures[0]

  flip: () ->
    @flipFlop = !@flipFlop

  destroy: () ->
    for texture in @textures
      texture.destroy()
    @gl.deleteFramebuffer(@fbo)
