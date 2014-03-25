class SignalUIBase extends Backbone.View
  className: "signal-set"

  initialize: () ->
    @el.appendChild arrow = document.createElement 'div'
    arrow.className = "arrow"
    @el.appendChild label = document.createElement 'div'
    label.textContent = @model.name
    label.className = 'label'
    arrow.addEventListener 'click', @clickLabel
    @el.appendChild @stack = document.createElement 'div'
    @stack.className = 'stack'
    for input in @model.inputs
      @stack.appendChild div = document.createElement 'div'
      div.className = "signal"
      div.textContent = input.name
      if input.type == "number"
        div.appendChild @newSlider(@model, input).render()
      else if input.type == "select"
        div.appendChild @newSelect(@model, input).render()

    if @model.outputs?.length > 0
      @stack.appendChild document.createElement 'hr'
    for output in @model.outputs
      @stack.appendChild div = document.createElement 'div'
      div.className = "signal"
      div.textContent = output.name
      if output.type == "number"
        div.appendChild @newSlider(@model, output).render()

  clickLabel: () =>
    @$el.toggleClass 'hidden'

  render: () ->
    @el

  newSlider: (model, input) ->
    slider = new VJSSlider(model, input)

  newSelect: (model, input) ->
    new VJSSelect(model, input)