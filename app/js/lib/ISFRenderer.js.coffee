AUTORUN = true

class @ISFRenderer
  constructor: (@gl, @isf) ->
    extend @, GLMethods
    @textureIndex = 0
    @renderBuffers = []
    @sourceChanged()
    @startTime = Date.now()

  setUniform: (name, value) ->
    uniform = @uniforms[name]
    if uniform
      uniform.dirty = true
      @uniforms[name].value = value
      if uniform.type == 't'
        uniform.textureLoaded = false
    else
      console.log "Uniform #{name} not found"

  setupGL: () =>
    @cleanup()
    @vShader = @createShader(@isf.vertexShader, @gl.VERTEX_SHADER)
    @fShader = @createShader(@isf.fragmentShader, @gl.FRAGMENT_SHADER)
    @program = @createProgram(@vShader, @fShader)
    
    @gl.useProgram(@program)
    @bindVerticesToProgram(@program)
    @generatePersistentBuffers()

  evaluateSize: (formula, w, h) ->
    formula = formula + "" # Make it a string
    s = formula.replace("$WIDTH", w).replace("$HEIGHT", h)
    for name, uniform of @uniforms
      s = s.replace("$#{name}", uniform.value)
    @math ||= new mathjs
    @math.eval(s)

  generatePersistentBuffers: () ->
    @renderBuffers = []
    
    for pass in @isf.passes
      buffer = { name: pass.target, persistent: pass.persistent }
      buffer.texture = @generateSizedTexture()
      buffer.textureUnit = @newTexIndex()
      # TODO Should these use render buffers instead?
      buffer.fbo = @gl.createFramebuffer()
      @gl.bindFramebuffer(@gl.FRAMEBUFFER, buffer.fbo)
      @gl.framebufferTexture2D(@gl.FRAMEBUFFER, @gl.COLOR_ATTACHMENT0, @gl.TEXTURE_2D, buffer.texture, 0)
      @gl.activeTexture(@gl.TEXTURE0 + buffer.textureUnit)
      @gl.bindTexture(@gl.TEXTURE_2D, buffer.texture)
      @renderBuffers.push buffer
    @gl.bindFramebuffer(@gl.FRAMEBUFFER, null)

  cleanup: () ->
    @textureIndex = 0
    # TODO better cleanup, like the framebuffers
    if @program
      @gl.deleteShader(@fShader)
      @gl.deleteShader(@vShader)
      @gl.deleteProgram(@program)
      @gl.deleteBuffer(@buffer)
      for buffer in @renderBuffers
        @gl.deleteTexture(buffer.texture)
        @gl.deleteFramebuffer(buffer.fbo)

  error: (line, e) =>
    lastError = @gl.getShaderInfoLog(shader);
    console.log lastError

  initUniforms: () =>
    @uniforms = @findUniforms(@isf.fragmentShader) 
    for input in @isf.inputs
      uniform = @uniforms[input.NAME]
      if !uniform then continue
      uniform.value = @isf.inputs[input.NAME]
      if uniform.type == 't'
        @generateTexture(uniform, input.NAME)
    @pushTextures()

  generateTexture: (uniform, name) ->
    uniform.texture = @gl.createTexture()
    uniform.textureUnit = @newTexIndex()
    uniform.textureLoaded = false
    @gl.bindTexture(@gl.TEXTURE_2D, uniform.texture)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_S, @gl.CLAMP_TO_EDGE)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_T, @gl.CLAMP_TO_EDGE)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.LINEAR)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, @gl.LINEAR)
    @gl.pixelStorei(@gl.UNPACK_FLIP_Y_WEBGL, true)
    @gl.bindTexture(@gl.TEXTURE_2D, null)
    

  sourceChanged: () =>
    try
      if @isf.error
        @presentError(message: @isf.error)
        return
      @setupGL()
      @initUniforms()
      
      @pushUniforms()
      @valid = true
    catch e
      @valid = false
      @presentError(e)

  presentError: (e) ->
    console.log e.message
    errString = e.message
    regex = /ERROR: (\d+):(\d+): (.*)/g
    matches = regex.exec(errString)
    if matches
      col = matches[1]
      line = matches[2]
      error = matches[3]
      glslMainLine = @getMainLine(@isf.fragmentShader)
      isfMainLine = @getMainLine(@isf.rawFragmentShader)
      actualLine = parseInt(line, 10) + isfMainLine - glslMainLine
      console.log("Line #{actualLine}: #{error}")

  getMainLine: (src) ->
    if !src then return 0
    lines = src.split("\n")
    for line, i in lines
      if line.indexOf("main()") != -1
        return i
    return -1

  render: (w, h, outputFBO) =>
    if !@valid then return
    @gl.useProgram(@program)
    @setUniform "TIME", (Date.now() - @startTime) / 1000
    # Bind all framebuffers as textures
    for buffer in @renderBuffers
      @gl.activeTexture(@gl.TEXTURE0 + buffer.textureUnit)
      @gl.bindTexture(@gl.TEXTURE_2D, buffer.texture)
      loc = @gl.getUniformLocation(@program, buffer.name)
      if buffer.name
        @gl.uniform1i loc, buffer.textureUnit
        @setUniform "_#{buffer.name}_imgSize", [buffer.width, buffer.height]
        # TODO figure out what textureRect is supposed to be.
        @setUniform "_#{buffer.name}_imgRect", [0, 0, 1, 1]
        @setUniform "_#{buffer.name}_flip", false
    @pushUniforms()

    for pass, i in @isf.passes
      @uniforms.PASSINDEX.value = i
      @pushUniform(@uniforms.PASSINDEX)

      if pass.target
        buffer = _.find(@renderBuffers, (b)->b.name == pass.target)
        w = @evaluateSize(pass.width)
        h = @evaluateSize(pass.height)
        if buffer.width != w || buffer.height != h
          buffer.width = w
          buffer.height = h
          @gl.bindTexture(@gl.TEXTURE_2D, buffer.texture)
          pixelType = if buffer.float then @gl.FLOAT else @gl.UNSIGNED_BYTE
          @gl.texImage2D(@gl.TEXTURE_2D, 0, @gl.RGBA, w, h, 0, @gl.RGBA, pixelType, null)
          @gl.bindTexture(@gl.TEXTURE_2D, null)
        @gl.bindFramebuffer(@gl.FRAMEBUFFER, buffer.fbo)
        @gl.viewport(0, 0, buffer.width, buffer.height)
        @uniforms.RENDERSIZE.value = [buffer.width, buffer.height]
      else
        @gl.bindFramebuffer(@gl.FRAMEBUFFER, outputFBO)
        @gl.viewport(0, 0, w, h)
        @uniforms.RENDERSIZE.value = [w, h]  
      @pushUniform(@uniforms.RENDERSIZE)
      @gl.drawArrays(@gl.TRIANGLES, 0, 6)
  

  newTexIndex: () =>
    i = @textureIndex
    @textureIndex += 1
    console.log "NEW TEX", i
    i

  # Since this can be video or animated gifs, just always update it.
  pushTextures: () =>
    for name, uniform of @uniforms
      if @uniforms.hasOwnProperty(name)
        if uniform.type == 't'
          @pushTexture(uniform)

  pushTexture: (uniform) ->
    # Upload the image data on every frame since this might be a video or animated gif.
    if !uniform.value then return
    @gl.activeTexture(@gl.TEXTURE0 + uniform.textureUnit)
    @gl.bindTexture(@gl.TEXTURE_2D, uniform.texture)
    loc = @gl.getUniformLocation(@program, uniform.name)
    @gl.uniform1i loc, uniform.textureUnit

    # if !uniform.textureLoaded
    #   uniform.textureLoaded = true
    #   @uniforms["_#{uniform.name}_imgSize"].value = [w, h]
    #   # TODO figure out what textureRect is supposed to be.
    #   @uniforms["_#{uniform.name}_imgRect"].value = [0, 0, 1, 1]
    #   @uniforms["_#{uniform.name}_flip"].value = false
    #   @pushUniform @uniforms["_#{uniform.name}_imgSize"]
    #   @pushUniform @uniforms["_#{uniform.name}_imgRect"]
    #   @pushUniform @uniforms["_#{uniform.name}_flip"]
      
  
  # Set the uniform values inside the shader program
  pushUniforms: () =>
    for name, value of @uniforms
      if @uniforms.hasOwnProperty(name)
        @pushUniform(value)

  pushUniform: (uniform) =>
    loc = @gl.getUniformLocation(@program, uniform.name)
    if loc != -1
      if uniform.type == 't'
        # Textures deal with themselves in a loop
      else
        v = uniform.value
        switch uniform.type
          when 'f' then @gl.uniform1f loc, v
          when 'v2' then @gl.uniform2f loc, v[0], v[1]
          when 'v3' then @gl.uniform3f loc, v[0], v[1], v[2]
          when 'v4' then @gl.uniform4f loc, v[0], v[1], v[2], v[3]
          when 'i' then @gl.uniform1i loc, v
          when 'color' then @gl.uniform4f loc, v[0], v[1], v[2], v[3]
          else console.log "Unknown type for uniform setting #{uniform.type}", uniform

  # Parse the source of the fragment shader to pull out all the uniform values that we can set
  findUniforms: (shader) ->
    lines = shader.split("\n")
    uniforms = {TIME: 0, PASSINDEX: 0, RENDERSIZE:[0,0]}
    for line in lines
      if (line.indexOf("uniform") == 0)
        tokens = line.split(" ")
        name = tokens[2].substring(0, tokens[2].length - 1)
        uniform = @typeToUniform tokens[1]
        uniform.name = name
        uniforms[name] = uniform
    uniforms

  typeToUniform: (type) ->
    switch type
      when "float" then {type: "f", value: 0}
      when "vec2" then {type: "v2", value: [0,0]}
      when "vec3" then {type: "v3", value: [0,0,0]}
      when "vec4" then {type: "v4", value: [0,0,0,0]}
      when "bool" then {type: "i", value: 0}
      when "int" then {type: "i", value: 0}
      when "color" then {type: "v4", value: [0,0,0,0]}
      when "point2D" then {type: "v2", value: [0,0], isPoint: true}
      when "sampler2D" then {type: "t", value: {complete: false, readyState: 0}, texture: null, textureUnit: null}
      else throw "Unknown uniform type in ISFRenderer.typeToUniform: #{type}"
  
  basicVertexShader: """
    precision mediump float;
    precision mediump int;
    attribute vec2 position; // -1..1
    varying vec2 texCoord;
    
    void main(void) {
      // Since webgl doesn't support ftransform, we do this by hand.
      gl_Position = vec4(position, 0, 1);
      texCoord = position;
    }

  """

  basicFragmentShader: """
    precision mediump float;
    uniform sampler2D tex;
    varying vec2 texCoord;
    void main()
    {

      gl_FragColor = texture2D(tex, texCoord * 0.5 + 0.5);
      //gl_FragColor = vec4(texCoord.x);
    }
  """