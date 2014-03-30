class CompositionInspector extends Backbone.View
  initialize: () ->
    @stack = document.createElement("div")
    @stack.className = "stack"
    @el.appendChild @stack
  
  setComposition: (composition) ->
    view = new SignalUIBase(model: composition)
    view.open()
    @stack.innerHTML = ''
    @stack.appendChild view.render()
