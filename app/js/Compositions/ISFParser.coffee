class @ISFParser
  parse: (@rawVertexShader, @rawFragmentShader) ->
    @error = null
    linesOfMetadata = -1
    try
      # First pull out the comment json to get the metadata
      regex = /\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/
      results = regex.exec(@rawFragmentShader)
      if !results
        @valid = false
        @inputs = []
        @categories = []
        @credit = ""
        return
      @valid = true
      m = results[0]
      m = m.substring(1, m.length - 1)
      metadata = JSON.parse(m)
      @credit = metadata.CREDIT
      @categories = metadata.CATEGORIES
      @inputs = metadata.INPUTS
      @imports = @parseImports(metadata.IMPORTED || {})
      @inputs.push input for input in @imports

      persistentArr = metadata.PERSISTENT_BUFFERS || []
      if !(persistentArr instanceof Array)
        throw error: "PERSISTENT_BUFFERS must be a simple array."
      passesArr = metadata.PASSES || [{}] # Empty pass to render to screen
      @passes = @parsePasses(passesArr, persistentArr)
      endOfMetadata = @rawFragmentShader.indexOf(m) + m.length + 2
    catch e
      @error = e.error || "Something is wrong with your metadata JSON."
    
    # Grab everything after the metadata as the ISF Formatted source
    if endOfMetadata > -1
      @rawFragmentMain = @rawFragmentShader.substring(endOfMetadata)
      @generateShaders()

  parseImports: (imports) ->
    {NAME: name, TYPE: "image"} for name of imports

  parsePasses: (passArr, persistentArr) ->
    passes = []
    for passDef in passArr
      pass = {persistent: false, target: null}
      if passDef.TARGET
        pass.target = passDef.TARGET
      pass.persistent = (persistentArr.indexOf(passDef.TARGET) > -1)
      pass.width = passDef.WIDTH || "$WIDTH"
      pass.height = passDef.HEIGHT || "$HEIGHT"
      pass.float = !!passDef.FLOAT
      passes.push(pass)
    passes

  generateShaders: () ->
    @uniforms = ""
    try
      for input in @inputs
        @addUniform(input)
    catch e
      console.log "Error adding uniforms", e
      @valid = false
      return

    for pass in @passes
      @addUniform({NAME: pass.target, TYPE: "image"})
  
    @buildFragmentShader()
    @buildVertexShader()

  buildFragmentShader: () ->
    # Start with the automatic variables
    @fragmentShader = @fragementShaderBegin
    main = @replaceSpecialFunctions(@rawFragmentMain)
    @fragmentShader = @fragmentShaderSkeleton.replace("[[uniforms]]", @uniforms).replace("[[main]]", main)

  buildVertexShader: () ->
    functionLines = "\n"
    inputLines = "\n"
    for input in @inputs
      if input.TYPE == "image"
        functionLines += @texCoordFunctions(input) + "\n"
        inputLines += @inputLines(input) + "\n"

    @vertexShader = @vertexShaderSkeleton.replace("[[functions]]", functionLines).replace("[[uniforms]]", @uniforms).replace("[[main]]", @rawVertexShader)

  texCoordFunctions: (input) ->
    name = input.NAME
    str = """
    _#{name}_texCoord =
        vec2(((vv_fragCoord.x / _#{name}_imgSize.x * _#{name}_imgRect.z) + _#{name}_imgRect.x), 
              (vv_fragCoord.y / _#{name}_imgSize.y * _#{name}_imgRect.w) + _#{name}_imgRect.y);

    _#{name}_normTexCoord =
      vec2((((vv_FragNormCoord.x * _#{name}_imgSize.x) / _#{name}_imgSize.x * _#{name}_imgRect.z) + _#{name}_imgRect.x),
              ((vv_FragNormCoord.y * _#{name}_imgSize.y) / _#{name}_imgSize.y * _#{name}_imgRect.w) + _#{name}_imgRect.y);

    """
    str

  inputLines: (input) ->
    name = input.NAME
    str = """
    uniform vec4 _#{name}_imgRect;
    uniform vec2 _#{name}_imgSize;
    uniform bool _#{name}_flip;
    varying vec2 _#{name}_normTexCoord;
    varying vec2 _#{name}_texCoord;

    """
    str

  addUniform: (input) ->
    type = @inputToType(input.TYPE)
    @addUniformLine "uniform #{type} #{input.NAME};"
    # For images, we add the extra metadata uniforms
    if type == "sampler2D"
      @addUniformLine "uniform vec4 _#{input.NAME}_imgRect;"
      @addUniformLine "uniform vec2 _#{input.NAME}_imgSize;"
      @addUniformLine "uniform bool _#{input.NAME}_flip;"
      @addUniformLine "varying vec2 _#{input.NAME}_normTexCoord;"
      @addUniformLine "varying vec2 _#{input.NAME}_texCoord;"

  addUniformLine: (line) ->
    @uniforms += line + "\n"

  inputToType: (type) ->
    switch type
      when "float" then "float"
      when "image" then "sampler2D"
      when "bool" then "bool"
      when "event" then "bool"
      when "long" then "int"
      when "color" then "vec4"
      when "point2D" then "vec2"
      else throw "Unknown input type: #{type}"

  replaceSpecialFunctions: (source) ->
    # TODO Make these regexes more robust
    # IMG_THIS_PIXEL
    regex = /IMG_THIS_PIXEL\(([a-zA-Z]+)\)/g
    source = source.replace regex, (fullMatch, innerMatch) ->
      "texture2D(#{innerMatch}, vv_FragNormCoord)"

    # IMG_THIS_NORM_PIXEL
    regex = /IMG_THIS_NORM_PIXEL\((.+?)\)/g
    source = source.replace regex, (fullMatch, innerMatch) ->
      "texture2D(#{innerMatch}, vv_FragNormCoord)"

    # IMG_PIXEL
    regex = /IMG_PIXEL\((.+?)\)/g
    source = source.replace regex, (fullMatch, innerMatch) ->
      [sampler, coord] = innerMatch.split(",")
      "texture2D(#{sampler}, (#{coord}) / RENDERSIZE)"
    
    # IMG_NORM_PIXEL
    regex = /IMG_NORM_PIXEL\((.+?)\)/g
    source = source.replace regex, (fullMatch, innerMatch) ->
      [sampler, coord] = innerMatch.split(",")
      "VVSAMPLER_2DBYNORM(#{sampler}, _#{sampler}_imgRect, _#{sampler}_imgSize, _#{sampler}_flip, #{coord})"

    source

  fragmentShaderSkeleton: """
    precision mediump float;
    precision mediump int;

    uniform int PASSINDEX;
    uniform vec2 RENDERSIZE;
    varying vec2 vv_FragNormCoord;
    uniform float TIME;

    [[uniforms]]

    // We don't need 2DRect functions since we control all inputs.  Don't need flip either, but leaving
    // for consistency sake.
    vec4 VVSAMPLER_2DBYPIXEL(sampler2D sampler, vec4 samplerImgRect, vec2 samplerImgSize, bool samplerFlip, vec2 loc) {
      return (samplerFlip)
        ? texture2D   (sampler,vec2(((loc.x/samplerImgSize.x*samplerImgRect.z)+samplerImgRect.x), (samplerImgRect.w-(loc.y/samplerImgSize.y*samplerImgRect.w)+samplerImgRect.y)))
        : texture2D   (sampler,vec2(((loc.x/samplerImgSize.x*samplerImgRect.z)+samplerImgRect.x), ((loc.y/samplerImgSize.y*samplerImgRect.w)+samplerImgRect.y)));
    }
    vec4 VVSAMPLER_2DBYNORM(sampler2D sampler, vec4 samplerImgRect, vec2 samplerImgSize, bool samplerFlip, vec2 normLoc)  {
      vec4    returnMe = VVSAMPLER_2DBYPIXEL(   sampler,samplerImgRect,samplerImgSize,samplerFlip,vec2(normLoc.x*samplerImgSize.x, normLoc.y*samplerImgSize.y));
      return returnMe;
    }

    [[main]]

  """

  defaultVertexShader: """
    void main(void) {
      vv_vertShaderInit();
    }
  """

  vertexShaderSkeleton: """
    precision mediump float;
    precision mediump int;
    void vv_vertShaderInit();

    attribute vec2 position; // -1..1

    uniform int     PASSINDEX;
    uniform vec2    RENDERSIZE;
    varying vec2    vv_FragNormCoord; // 0..1
    varying vec2    vv_fragCoord; // Pixel Space

    [[uniforms]]

    [[main]]
    void vv_vertShaderInit(void)  {
      // Since webgl doesn't support ftransform, we do this by hand.
      gl_Position = vec4(position, 0, 1);
      vv_FragNormCoord = vec2((gl_Position.x+1.0)/2.0, (gl_Position.y+1.0)/2.0);
      vec2  vv_fragCoord = floor(vv_FragNormCoord * RENDERSIZE);
      [[functions]]
    }

    

  """


