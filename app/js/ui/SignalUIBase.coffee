class SignalUIBase extends Backbone.View
  className: "signal-set hidden"

  events:
    "click .close-button": "destroy"

  initialize: () ->
    @el.appendChild arrow = document.createElement 'div'
    arrow.className = "arrow"
    @el.appendChild close = document.createElement 'div'
    close.className = 'close-button'
    @el.appendChild label = document.createElement 'div'
    label.textContent = @model.name
    label.className = 'label'
    arrow.addEventListener 'click', @clickLabel
    @el.appendChild @stack = document.createElement 'div'
    @stack.className = 'stack'
    for input in @model.inputs
      @stack.appendChild div = document.createElement 'div'
      div.className = "signal"
      div.setAttribute("data-ui-type", input.type)
      div.textContent = input.name
      div.appendChild @newControl(input).render()

    customViews = @model.getCustomViews()
    if customViews
      for view in customViews
        @stack.appendChild view.render()

    if @model.outputs?.length > 0
      @stack.appendChild document.createElement 'hr'
    for output in @model.outputs
      if output.hidden then continue
      @stack.appendChild div = document.createElement 'div'
      div.className = "signal"
      div.textContent = output.name
      div.setAttribute("data-ui-type", output.type)
      if output.type == "boolean" then div.classList.add 'inline'
      div.appendChild @newControl(output).render()



  clickLabel: () =>
    @$el.toggleClass 'hidden'

  open: () =>
    @el.classList.remove 'hidden'

  close: () =>
    @el.classList.add 'hidden'

  render: () ->
    @el

  destroy: () =>
    @model.trigger('destroy', @model)

  newControl: (input) ->
    if input.type == "number"
      new VJSSlider(@model, input)
    else if input.type == "select"
      new VJSSelect(@model, input)
    else if input.type == "boolean"
      new VJSButton(@model, input)
    else if input.type == "color"
      new VJSColorPicker(@model, input)
    else if input.type == "function"
      new VJSButton(@model, input)