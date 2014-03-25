class VJSSignal extends Backbone.Model
  inputs: []
  outputs: []
  constructor: () ->
    super()
    for input in @inputs
      @set input.name, input.default

  update: (time) ->
    # Override