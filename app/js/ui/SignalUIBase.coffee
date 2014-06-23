class SignalUIBase extends Backbone.View
  className: "signal-set hidden"

  events:
    "click .close-button": "destroy"

  initialize: () ->
    @el.setAttribute('model-id', @model.cid)
    @el.appendChild arrow = @div('arrow')
    @inputViews = []
    @customViews = []
    @outputViews = []

    if not @model.readonly
      @el.appendChild close = @div('close-button')
      # @el.appendChild label = @div('label')
      # label.appendChild input = document.createElement('input')
      # input.value = @model.name
      # input.type = 'text'
      @el.appendChild label = @div('label')
      label.textContent = @model.name
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
      if input.hidden then continue
      @inputStack.appendChild el = @div('signal')
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
    @el.appendChild @outputStack = @div('output stack')
    for output in @model.outputs
      if output.hidden then continue
      @outputStack.appendChild el = @div('signal')
      el.textContent = output.name
      el.setAttribute("data-ui-type", output.type)
      v = @newControl(output)
      @outputViews.push v
      el.appendChild v.render()

  toggleOpen: () =>
    if @el.classList.contains('hidden')
      @open()
    else
      @close()

  open: () =>
    for v in @customViews
      v.visible = true
    @el.classList.remove 'hidden'

  close: () =>
    for v in @customViews
      v.visible = false
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
