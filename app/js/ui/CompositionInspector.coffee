class CompositionInspector extends Backbone.View
  initialize: () ->
    @stack = @el.querySelector('.stack')
  
  setComposition: (composition) ->
    view = new SignalUIBase(model: composition)
    view.open()
    @stack.innerHTML = ''
    @stack.appendChild view.render()

  render: () =>
    
