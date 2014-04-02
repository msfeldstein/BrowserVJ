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
      @setDefault(input)
      
      # If there is a change:property method then automatically set that up as a listener
      if @["change:#{input.name}"] then @listenTo @, "change:#{input.name}", @["change:#{input.name}"]

  setDefault: (input) ->
    if input.default != undefined
      @set input.name, (input.default)
    else if input.type == "number"
      @set input.name, 0
    else if input.type == "boolean"
      @set input.name, false
    else if input.type == "color"
      @set input.name, 0xFFFFFF

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
      if (typeof value) == property.type
        @set property.name, value
      else
        v = @convertTypes(value, property.type)
        @set property.name, v

  convertTypes: (value, type) ->
    if type == "boolean" then return !!value
    if type == "number"
      if typeof value == "boolean"
        return if value then 1 else 0
    return value

  getCustomViews: () ->
    # Return any custom views that should show up in panels
    # See AudioInput for example