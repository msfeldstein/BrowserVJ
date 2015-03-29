class @ISFTexture
  constructor: (params = {}) ->
    @float = params.float
    @gl = ISFGL.gl
    @texture = @gl.createTexture()
    @textureUnit = ISFGL.newTextureIndex()
    @gl.bindTexture(@gl.TEXTURE_2D, @texture)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_S, @gl.CLAMP_TO_EDGE)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_T, @gl.CLAMP_TO_EDGE)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.NEAREST)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, @gl.NEAREST)
    @gl.pixelStorei(@gl.UNPACK_FLIP_Y_WEBGL, true)
    @gl.bindTexture(@gl.TEXTURE_2D, null)

  bind: (location = -1) ->
    @gl.activeTexture(@gl.TEXTURE0 + @textureUnit)
    @gl.bindTexture(@gl.TEXTURE_2D, @texture)
    if location != -1
      @gl.uniform1i(location, @textureUnit)

  upload: (image) ->
    @bind()
    @gl.texImage2D(@gl.TEXTURE_2D, 0, @gl.RGBA, @gl.RGBA, @gl.UNSIGNED_BYTE, image);

  setSize: (w, h) ->
    if @width != w || @height != h
      @width = w
      @height = h
      pixelType = if @float then @gl.FLOAT else @gl.UNSIGNED_BYTE
      @gl.bindTexture(@gl.TEXTURE_2D, @texture)
      @gl.texImage2D(@gl.TEXTURE_2D, 0, @gl.RGBA, w, h, 0, @gl.RGBA, pixelType, null)  

  destroy: () ->
    @gl.deleteTexture(@texture)
