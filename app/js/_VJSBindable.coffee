# Base class for composition and effects
class VJSBindable extends Backbone.Model
  constructor: () ->
    super()
    @inputs = @inputs?.slice() || []
    @outputs = @outputs?.slice() || []
    
    @bindings = {}
    for input in @inputs
      @set input.name, input.default
      if @["change:#{input.name}"] then @listenTo @, "change:#{input.name}", @["change:#{input.name}"]

  clearBinding: (property) =>
    if @bindings[property]
      binding = @bindings[property]
      binding.target.off("change:#{binding.targetProperty}", binding.callback)

  bindToKey: (property, target, targetProperty) ->
    @clearBinding(property)
    f = @createBinding(property)
    @bindings[property] = {callback: f, target: target, targetProperty: targetProperty}
    target.on("change:#{targetProperty}", f)

  createBinding: (property) =>
    (signal, value) =>
      @set property.name, value
