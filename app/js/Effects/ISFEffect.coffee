class @ISFEffect extends EffectPassBase
  @fromFile: (file, contents) ->
    class NewEffect extends ISFEffect
      @effectName: file.name
      source: contents

