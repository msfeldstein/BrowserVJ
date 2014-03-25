class CompositionInspector extends Backbone.View
  el: ".inspector"
  initialize: () ->
    @label = @el.querySelector('.label')
    @stack = @el.querySelector('.stack')
  
  setComposition: (composition) ->
    view = new SignalUIBase(model: composition)
    @stack.innerHTML = ''
    @stack.appendChild view.render()

  render: () =>

