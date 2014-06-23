class SignalUIBase extends VJSCell
  className: "signal-set hidden"

  events:
    "click .close-button": "destroy"

  initialize: () ->
    super()
    @el.setAttribute('model-id', @model.cid)
    @inputViews = []
    @customViews = []
    @outputViews = []

    if not @model.readonly
      @el.appendChild close = _V.div('close-button')
    @el.appendChild label = _V.div('label')
    label.textContent = @model.name
    
    @insertInputViews()
    @insertCustomViews()
    if @model.outputs?.length > 0
      @inputStack.appendChild document.createElement 'hr'
      @insertOutputViews()

  insertInputViews: () ->
    @el.appendChild @inputStack = _V.div('input stack')
    for input in @model.inputs
      if input.hidden then continue
      @inputStack.appendChild el = _V.div('signal')
      el.setAttribute("data-ui-type", input.type)
      el.textContent = input.name
      v = @newControl(input)
      el.appendChild v.render()
      @inputViews.push v

  insertCustomViews: () ->
    customViews = @model.getCustomViews?()
    if !!customViews
      for view in customViews
        @customViews.push view
        @inputStack.appendChild view.render()


  insertOutputViews: () ->
    @el.appendChild @outputStack = _V.div('output stack')
    for output in @model.outputs
      if output.hidden then continue
      @outputStack.appendChild el = _V.div('signal')
      el.textContent = output.name
      el.setAttribute("data-ui-type", output.type)
      v = @newControl(output)
      @outputViews.push v
      el.appendChild v.render()

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
