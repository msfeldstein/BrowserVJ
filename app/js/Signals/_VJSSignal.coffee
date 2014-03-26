class VJSSignal extends Backbone.Model
  inputs: []
  outputs: []
  constructor: () ->
    super()
    for input in @inputs
      @set input.name, input.default
      if @["change:#{input.name}"] then @listenTo @, "change:#{input.name}", @["change:#{input.name}"]


  update: (time) ->
    # Override