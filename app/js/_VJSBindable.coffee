# Base class for composition and effects, anything that will show up with buttons or sliders
class VJSBindable extends Backbone.Model
  constructor: () ->
    @inputs = @inputs?.slice() || []
    @outputs = @outputs?.slice() || []
    
    @bindings = {}
    
    super()

    for output in @outputs
      @set(output.name, output.default || 0)
    
    for input in @inputs
      @set input.name, (input.default || 0)
      # If there is a change:property method then automatically set that up as a listener
      if @["change:#{input.name}"] then @listenTo @, "change:#{input.name}", @["change:#{input.name}"]

  clearBinding: (property) =>
    if @bindings[property]
      binding = @bindings[property]
      binding.target.off("change:#{binding.targetProperty}", binding.callback)

  # Tell the current object to bind the property to the target objects property
  bindToKey: (property, target, targetProperty) ->
    @clearBinding(property.name)
    f = @createBinding(property)
    @bindings[property.name] = {callback: f, target: target, targetProperty: targetProperty}
    target.on("change:#{targetProperty}", f)

  createBinding: (property) =>
    (signal, value) =>
      @set property.name, value

  getCustomViews: () ->
    # Return any custom views that should show up in panels
    # See AudioInput for example