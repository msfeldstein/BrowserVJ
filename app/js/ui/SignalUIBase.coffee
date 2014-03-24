class SignalUIBase extends Backbone.View
  className: "signal-set"

  initialize: () ->
    @el.appendChild label = document.createElement 'div'
    label.textContent = @model.name
    label.className = 'label'
    for input in @model.inputs
      @el.appendChild div = document.createElement 'div'
      div.className = "signal"
      div.textContent = input.name
      if input.type == "number"
        div.appendChild @newSlider(@model, input).render()
      else if input.type == "select"
        div.appendChild @newSelect(@model, input).render()

    if @model.outputs?.length > 0
      @el.appendChild document.createElement 'hr'
    for output in @model.outputs
      @el.appendChild div = document.createElement 'div'
      div.className = "signal"
      div.textContent = output.name
      if output.type == "number"
        div.appendChild @newSlider(@model, output).render()

  render: () ->
    @el

  newSlider: (model, input) ->
    slider = new VJSSlider(model, input)

  newSelect: (model, input) ->
    new VJSSelect(model, input)