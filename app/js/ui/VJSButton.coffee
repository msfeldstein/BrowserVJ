class VJSButton extends VJSControl
  events:
    'mousedown .vjs-button': 'down'

  initialize: () ->
    super()
    @button = document.createElement 'div'
    @button.className = 'vjs-button'
    @el.appendChild @button

    @max = @property.max
    @min = @property.min
    @listenTo @model, "change:#{@property.name}", @render
    @render()

  down: (e) =>
    if e.button == 0
      if @property.toggle
        @model.set(@property.name, !@model.get(@property.name)) 
      else
        @model.set @property.name, true
        $(document).one "mouseup", @up

  up: () =>
    @model.set @property.name, false

  render: () =>
    value = @model.get(@property.name)
    if value
      @button.classList.add 'active'
    else
      @button.classList.remove 'active'
    @el