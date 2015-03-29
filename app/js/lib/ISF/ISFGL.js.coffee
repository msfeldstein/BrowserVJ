class @ISFGL
  @init: (gl) ->
    ISFGL.gl = gl
    ISFGL.textureIndex = 0
  
  @newTextureIndex: () ->
    i = ISFGL.textureIndex
    ISFGL.textureIndex += 1
    i

  @cleanup: () ->
    ISFGL.textureIndex = 0