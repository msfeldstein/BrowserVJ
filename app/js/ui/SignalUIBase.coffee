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
      div.appendChild @newControl(input).render()

    if @model.outputs?.length > 0
      @stack.appendChild document.createElement 'hr'
    for output in @model.outputs
      @stack.appendChild div = document.createElement 'div'
      div.className = "signal"
      div.textContent = output.name
      div.appendChild @newControl(output).render()

  clickLabel: () =>
    @$el.toggleClass 'hidden'

  render: () ->
    @el

  newControl: (input) ->
    if input.type == "number"
      new VJSSlider(@model, input)
    else if input.type == "select"
      new VJSSelect(@model, input)
    else if input.type == "boolean"
      new VJSButton(@model, input)