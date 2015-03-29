class @ISFGLProgram
  constructor: (@gl, vs, fs) ->
    @vShader = @createShader(vs, @gl.VERTEX_SHADER)
    @fShader = @createShader(fs, @gl.FRAGMENT_SHADER)
    @program = @createProgram(@vShader, @fShader)
    @locations = {}

  use: () ->
    @gl.useProgram(@program)

  getUniformLocation: (name) ->
    @gl.getUniformLocation(@program, name)

  setUniform1i: (uniformName, value) ->
    locations[uniformName] ?= @getUniformLocation(@program, uniformName)
    @gl.uniform1i(@paintProgram.texLocation, target.textureUnit)

  bindVertices: () ->
    @use()
    positionLocation = @gl.getAttribLocation(@program, "position")
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

  cleanup: () ->
    @gl.deleteShader(@fShader)
    @gl.deleteShader(@vShader)
    @gl.deleteProgram(@program)
    @gl.deleteBuffer(@buffer)

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