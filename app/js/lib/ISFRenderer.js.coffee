class ISFRenderer
  constructor: (@gl, @isf, @destinationFBO) ->
    @_setupGL()
    @_setupBuffers()
    @_setupInputs()

  setUniform: (name, value) ->
    uniform = @uniforms[name]
    if uniform
      uniform.value = value
      uniform.dirty = true
      if uniform.type == 't'
        uniform.texture = value

  _setupGL: () ->
    @vShader = @_createShader(@isf.vertexShader, @gl.VERTEX_SHADER)
    @fShader = @_createShader(@isf.fragmentShader, @gl.FRAGMENT_SHADER)
    @program = @_createProgram(@vShader, @fShader)
    @_setupTriangles(@program)

  _createShader: (src, type) ->
    shader = @gl.createShader(type)
    @gl.shaderSource(shader, src)
    @gl.compileShader(shader)
    compiled = @gl.getShaderParameter(shader, @gl.COMPILE_STATUS)
    if !compiled
      lastError = @gl.getShaderInfoLog(shader)
      throw { message: "Error compiling shader #{type}", error: lastError}
    shader

  _createProgram: (vShader, fShader) ->
    program = @gl.createProgram()
    @gl.attachShader(program, vShader)
    @gl.attachShader(program, fShader)
    @gl.linkProgram(program)
    linked = @gl.getProgramParameter(program, @gl.LINK_STATUS)
    if !linked
      lastError = @gl.getProgramInfoLog(program)
      throw { message: "Error linking program", error: lastError}
    program

  _setupTriangles: (program) ->
    @gl.useProgram(program)
    positionLocation = @gl.getAttribLocation(program, "position")
    buffer = @gl.createBuffer()
    @gl.bindBuffer(@gl.ARRAY_BUFFER, buffer)
    vertexArray = new Float32Array([
      -1.0, -1.0,
      1.0, -1.0, 
      -1.0,  1.0, 
      -1.0,  1.0, 
      1.0, -1.0, 
      1.0,  1.0
    ])
    console.log positionLocation, @fShader
    @gl.bufferData(@gl.ARRAY_BUFFER, vertexArray, @gl.STATIC_DRAW)
    @gl.enableVertexAttribArray(positionLocation)
    @gl.vertexAttribPointer(positionLocation, 2, @gl.FLOAT, false, 0, 0)

  _setupBuffers: () ->
    @_buffers = []
    for passInfo in @isf.passes
      buffer = {}
      buffer.name = passInfo.target
      buffer.persistent = passInfo.persistent
      buffer.textureUnit = @_newTexIndex()
      buffer.texture = @_createTexture()
      buffer.fbo = @gl.createFramebuffer()
      @gl.bindFramebuffer(@gl.FRAMEBUFFER, buffer.fbo)
      @gl.framebufferTexture2D(@gl.FRAMEBUFFER, @gl.COLOR_ATTACHMENT0, @gl.TEXTURE_2D, buffer.texture, 0)
      @gl.activeTexture(@gl.TEXTURE0 + buffer.textureUnit)
      @gl.bindTexture(@gl.TEXTURE_2D, buffer.texture)
      @_buffers.push(buffer)
    @gl.bindFramebuffer(@gl.FRAMEBUFFER, null)

  _newTexIndex: () ->
    @_textureIndex ||= 0
    @_textureIndex++

  _createTexture: () ->
    texture = @gl.createTexture()
    @gl.bindTexture(@gl.TEXTURE_2D, texture)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_S, @gl.CLAMP_TO_EDGE)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_T, @gl.CLAMP_TO_EDGE)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.NEAREST)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, @gl.NEAREST)
    @gl.pixelStorei(@gl.UNPACK_FLIP_Y_WEBGL, true)
    @gl.bindTexture(@gl.TEXTURE_2D, null)
    texture

  _setupInputs: () ->
    @_inputs = {}
    @_startTime = Date.now()
    @_findUniforms()
    console.log("UNIS", @uniforms)
    for isfInput in @isf.inputs
      if isfInput.DEFAULT
        @uniforms[isfInput.NAME].value = isfInput.DEFAULT

  _findUniforms: () ->
    lines = @isf.fragmentShader.split("\n")
    @uniforms = {}
    for line in lines
      if line.indexOf("uniform") == 0
        tokens = line.split(/\W+/)
        name = tokens[2]
        uniform = @_typeToUniform(tokens[1])
        uniform.name = name
        uniform.dirty = true
        @uniforms[name] = uniform
    @uniforms

  _typeToUniform: (type) ->
    mappings = {
      "float": {type: "f", value: 0},
      "vec2": {type: "v2", value: [0,0]},
      "vec3": {type: "v3", value: [0,0,0]},
      "vec4": {type: "v4", value: [0,0,0,0]},
      "bool": {type: "i", value: 0},
      "int": {type: "i", value: 0},
      "color": {type: "v4", value: [0,0,0,0]},
      "point2D": {type: "v2", value: [0,0], isPoint: true},
      "sampler2D": {type: "t", value: {complete: false, readyState: 0}, texture: null, textureUnit: null},
    }
    uniform = mappings[type]
    if !uniform then throw "Unknown uniform type in ISFRenderer.typeToUniform: #{type}"
    uniform

  _pushUniforms: () ->
    for name, input of @uniforms
      if input.dirty
        @pushUniform(input)
        
        

  pushUniform: (input) ->
    loc = @gl.getUniformLocation(@program, input.name)
    if loc == -1
      console.log "Couldn't find uniform #{input.name}"
      return
    v = input.value
    switch input.type
      when "f" then @gl.uniform1f(loc, v)
      when "v2" then @gl.uniform2f(loc, v[0], v[1])
      when "v3" then @gl.uniform3f(loc, v[0], v[1], v[2])
      when "v4" then @gl.uniform4f(loc, v[0], v[1], v[2], v[3])
      when "i" then @gl.uniform1i(loc, v)
      when "t" then @_pushTexture(input)
      else console.log("Unknown type in _pushUniforms:", input)
    input.dirty = false

  _pushTexture: (uniform) ->
    if !uniform.texture then return
    if !uniform.textureUnit then uniform.textureUnit = @_newTexIndex()
    @gl.activeTexture(@gl.TEXTURE0 + uniform.textureUnit)
    @gl.bindTexture(@gl.TEXTURE_2D, uniform.texture)
    # @gl.texImage2D(@gl.TEXTURE_2D, 0, @gl.RGBA, @gl.RGBA, @gl.UNSIGNED_BYTE, uniform.value)
    loc = @gl.getUniformLocation(@program, uniform.name)
    @gl.uniform1i loc, uniform.textureUnit

  render: (w, h, renderDestination) ->
    @gl.useProgram(@program)
    
    @setUniform("TIME", (Date.now() - @_startTime) / 1000)
    @setUniform("RENDERSIZE", [w, h])

    for buffer in @_buffers
      @gl.activeTexture(@gl.TEXTURE0 + buffer.textureUnit)
      @gl.bindTexture(@gl.TEXTURE_2D, buffer.texture)
      if buffer.name
        loc = @gl.getUniformLocation(@program, buffer.name)
        @gl.uniform1i(loc, buffer.textureUnit)
        @setUniform("_#{buffer.name}_imgSize", [buffer.width, buffer.height])
        @setUniform("_#{buffer.name}_imgRect", [0, 0, 1, 1])
        @setUniform("_#{buffer.name}_flip", false)
      @gl.bindTexture(@gl.TEXTURE_2D, null)

    lastTarget = null
    for pass, i in @isf.passes
      @setUniform("PASSINDEX", i)
      if pass.target
        buffer = @_findBuffer(pass.target)
        if w != buffer.width || h != buffer.height
          buffer.width = w
          buffer.height = h
          @gl.bindTexture(@gl.TEXTURE_2D, buffer.texture)
          pixelType = if buffer.float then @gl.FLOAT else @gl.UNSIGNED_BYTE
          @gl.texImage2D(@gl.TEXTURE_2D, 0, @gl.RGBA, w, h, 0, @gl.RGBA, pixelType, null)
          @gl.bindTexture(@gl.TEXTURE_2D, null)
        @gl.bindFramebuffer(@gl.FRAMEBUFFER, buffer.fbo)
        @gl.viewport(0, 0, buffer.width, buffer.height)
        @setUniform("RENDERSIZE", [buffer.width, buffer.height])
        lastTarget = buffer
      else
        @gl.bindFramebuffer(@gl.FRAMEBUFFER, @destinationFBO)
        @gl.viewport(0, 0, w, h)
        @setUniform("RENDERSIZE", [w, h])
        lastTarget = null
      @_pushUniforms()
      @gl.drawArrays(@gl.TRIANGLES, 0, 6)

  paintToScreen: (target) ->
    @gl.useProgram(@paintProgram)
    @gl.bindFramebuffer(@gl.FRAMEBUFFER, null)
    @gl.viewport(0, 0, @canvas.width, @canvas.height)
    @gl.uniform1i @paintProgram.texLocation, target.textureUnit
    @gl.drawArrays(@gl.TRIANGLES, 0, 6)

  _findBuffer: (name) ->
    for buffer in @_buffers
      return buffer if buffer.name == name
    null