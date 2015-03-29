@GLMethods =
  bindVerticesToProgram: (program) ->
    @gl.useProgram(program)
    positionLocation = @gl.getAttribLocation(program, "position")
    @buffer = @gl.createBuffer()
    @gl.bindBuffer(@gl.ARRAY_BUFFER, @buffer)
    @gl.bufferData(
      @gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
        1.0, -1.0, 
        -1.0,  1.0, 
        -1.0,  1.0, 
        1.0, -1.0, 
        1.0,  1.0
      ]),
      @gl.STATIC_DRAW
    )
    @gl.enableVertexAttribArray(positionLocation)
    @gl.vertexAttribPointer(positionLocation, 2, @gl.FLOAT, false, 0, 0)

  createShader: (src, type) ->
    shader = @gl.createShader(type)
    @gl.shaderSource(shader, src)
    @gl.compileShader(shader)
    compiled = @gl.getShaderParameter(shader, @gl.COMPILE_STATUS)
    if !compiled
      lastError = @gl.getShaderInfoLog(shader)
      console.log "Error Compiling Shader ", lastError
      throw message: lastError, type: "shader"
    shader

  createProgram: (vShader, fShader) ->
    program = @gl.createProgram()
    @gl.attachShader(program, vShader)
    @gl.attachShader(program, fShader)
    @gl.linkProgram(program)
    linked = @gl.getProgramParameter(program, @gl.LINK_STATUS)
    if !linked
      lastError = @gl.getProgramInfoLog(program)
      console.log "Error in program linking", lastError
      throw message: lastError, type: "program"
    program

  generateSizedTexture: (w, h) ->
    w = 512
    h = 512
    texture = @gl.createTexture()
    @gl.bindTexture(@gl.TEXTURE_2D, texture)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_S, @gl.CLAMP_TO_EDGE)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_T, @gl.CLAMP_TO_EDGE)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.NEAREST)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, @gl.NEAREST)
    @gl.texImage2D(@gl.TEXTURE_2D, 0, @gl.RGBA, @gl.RGBA, @gl.UNSIGNED_BYTE, null)
    @gl.bindTexture(@gl.TEXTURE_2D, null)
    texture