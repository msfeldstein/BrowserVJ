class CompositionInspector extends Backbone.View
  initialize: () ->
    @stack = document.createElement("div")
    @stack.className = "stack"
    @el.appendChild @stack
  
  setComposition: (composition) ->
    @view?.remove()
    if composition
      @view = new SignalUIBase(model: composition)
      @view.open()
      @stack.appendChild @view.render()
