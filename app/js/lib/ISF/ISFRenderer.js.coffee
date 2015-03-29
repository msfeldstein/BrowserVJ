class @ISFRenderer
  constructor: (@gl) ->
    ISFGL.init(@gl)
    @setupPaintToScreen()
    @startTime = Date.now()

  # Compiled GLSL Fragment/Vertex shaders
  # Inputs as {definition: {JSONDef}, value: value}
  sourceChanged: (@fragmentShader, @vertexShader, @model) ->
    @setupGL()
    @initUniforms()
    @pushUniforms()

  initUniforms: () =>
    @uniforms = @findUniforms(@fragmentShader)
    for input in @model.inputs
      uniform = @uniforms[input.NAME]
      if !uniform then continue
      ## TODO Remove
      uniform.value = @model[input.NAME]
      if uniform.type == 't'
        uniform.texture = new ISFTexture
    @pushTextures()

  setValue: (name, value) ->
    uniform = this.uniforms[name]
    uniform.value = value
    if uniform.type == 't'
      uniform.textureLoaded = false
    @pushUniform(uniform)

  setupPaintToScreen: () ->
    @paintProgram = new ISFGLProgram(@gl, @basicVertexShader, @basicFragmentShader)
    @paintProgram.bindVertices()

  setupGL: () =>
    @cleanup()
    @program = new ISFGLProgram(@gl, @vertexShader, @fragmentShader)
    @program.bindVertices()
    @generatePersistentBuffers()

  generatePersistentBuffers: () ->
    @renderBuffers = []
    for pass in @model.passes
      buffer = new ISFBuffer(pass)
      @renderBuffers.push buffer

  paintToScreen: (destination, target) ->
    @paintProgram.use()
    @gl.bindFramebuffer(@gl.FRAMEBUFFER, null)
    @gl.viewport(0, 0, destination.width, destination.height)
    @paintProgram.setUniform("tex", target.textureUnit)
    @gl.drawArrays(@gl.TRIANGLES, 0, 6)

  # Since this can be video or animated gifs, just always update it.
  pushTextures: () =>
    for name, uniform of @uniforms
      if @uniforms.hasOwnProperty(name)
        if uniform.type == 't'
          @pushTexture(uniform)

  pushTexture: (uniform) ->
    # Upload the image data on every frame since this might be a video or animated gif.
    if !uniform.value then return
    if !uniform.value.complete && uniform.value.readyState != 4 then return
    loc = @program.getUniformLocation(uniform.name)
    uniform.texture.bind(loc)
    @gl.texImage2D(@gl.TEXTURE_2D, 0, @gl.RGBA, @gl.RGBA, @gl.UNSIGNED_BYTE, uniform.value)
    
    if !uniform.textureLoaded
      img = uniform.value
      uniform.textureLoaded = true
      w = img.naturalWidth || img.width || img.videoWidth
      h = img.naturalHeight || img.height || img.videoHeight
      # TODO figure out what textureRect is supposed to be.
      @setValue "_#{uniform.name}_imgSize", [w, h]
      @setValue "_#{uniform.name}_imgRect", [0, 0, 1, 1]
      @setValue "_#{uniform.name}_flip", false
  
  # Set the uniform values inside the shader program
  pushUniforms: () =>
    for name, value of @uniforms
      if @uniforms.hasOwnProperty(name)
        @pushUniform(value)

  pushUniform: (uniform) =>
    loc = @program.getUniformLocation(uniform.name)
    if loc != -1
      if uniform.type == 't'
        @pushTexture(uniform)
      else
        v = uniform.value
        if !v then return
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

  animate: (destination) ->
    @program.use()
    @setValue "TIME", (Date.now() - @startTime) / 1000

    # Bind all framebuffers as textures for reading
    for buffer in @renderBuffers
      readTexture = buffer.readTexture()
      loc = @program.getUniformLocation(buffer.name)
      readTexture.bind(loc)
      if buffer.name
        @setValue "_#{buffer.name}_imgSize", [buffer.width, buffer.height]
        @setValue "_#{buffer.name}_imgRect", [0, 0, 1, 1]
        @setValue "_#{buffer.name}_flip", false

    lastTarget = null
    for pass, i in @model.passes
      @setValue "PASSINDEX", i

      if pass.target
        buffer = _.find(@renderBuffers, (b)->b.name == pass.target)
        w = @evaluateSize(destination, pass.width)
        h = @evaluateSize(destination, pass.height)
        buffer.setSize(w, h)
        writeTexture = buffer.writeTexture()
        @gl.bindFramebuffer(@gl.FRAMEBUFFER, buffer.fbo)
        @gl.framebufferTexture2D(@gl.FRAMEBUFFER, @gl.COLOR_ATTACHMENT0, @gl.TEXTURE_2D, writeTexture.texture, 0)
        writeTexture.bind()
        @uniforms.RENDERSIZE.value = [buffer.width, buffer.height]
        lastTarget = buffer
      else
        @gl.bindTexture(@gl.TEXTURE_2D, null)
        @gl.bindFramebuffer(@gl.FRAMEBUFFER, null)
        @uniforms.RENDERSIZE.value = [destination.offsetWidth, destination.offsetHeight]  
        lastTarget = null
      @gl.viewport(0, 0, destination.width, destination.height)
      @pushUniform(@uniforms.RENDERSIZE)
      @gl.drawArrays(@gl.TRIANGLES, 0, 6)

    for buffer in @renderBuffers
      buffer.flip()
    
    if lastTarget
      @paintToScreen(destination, lastTarget)

  evaluateSize: (destination, formula) ->
    formula = formula + "" # Make it a string
    s = formula.replace("$WIDTH", destination.offsetWidth).replace("$HEIGHT", destination.offsetHeight)
    for name, uniform of @uniforms
      s = s.replace("$#{name}", uniform.value)
    @math ||= new mathjs
    @math.eval(s)

  cleanup: () ->
    ISFGL.cleanup()
    # TODO better cleanup, like the framebuffers
    if @renderBuffers
      buffer.destroy() for buffer in @renderBuffers
    @program?.cleanup()

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