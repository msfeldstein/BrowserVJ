class SignalUIBase extends Backbone.View
  className: "signal-set hidden"

  events:
    "click .close-button": "destroy"

  initialize: () ->
    @el.appendChild arrow = @div('arrow')
    
    if not @model.readonly
      @el.appendChild close = @div('close-button')
      @el.appendChild label = @div('label')
      label.appendChild input = document.createElement('input')
      input.value = @model.name
      input.type = 'text'
    else
      @el.appendChild label = @div('label')
      label.textContent = @model.name
      
    arrow.addEventListener 'click', @toggleOpen

    @insertInputViews()
    @insertCustomViews()
    if @model.outputs?.length > 0
      @inputStack.appendChild document.createElement 'hr'
    @insertOutputViews()

  div: (className) ->
    div = document.createElement 'div'
    div.className = className
    div

  insertInputViews: () ->
    @el.appendChild @inputStack = @div('input stack')
    for input in @model.inputs
      @inputStack.appendChild el = @div('signal')
      el.setAttribute("data-ui-type", input.type)
      el.textContent = input.name
      el.appendChild @newControl(input).render()

  insertCustomViews: () ->
    customViews = @model.getCustomViews()
    if customViews
      for view in customViews
        @inputStack.appendChild view.render()

  insertOutputViews: () ->
    @el.appendChild @outputStack = @div('output stack')
    for output in @model.outputs
      if output.hidden then continue
      @outputStack.appendChild el = @div('signal')
      el.textContent = output.name
      el.setAttribute("data-ui-type", output.type)
      el.appendChild @newControl(output).render()

  toggleOpen: () =>
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