class LayerInspector extends Backbone.View
  initialize: () ->
    @stack = document.createElement("div")
    @stack.className = "stack"
    @el.appendChild @stack
    @stack.appendChild new SignalUIBase(model: @model).render()