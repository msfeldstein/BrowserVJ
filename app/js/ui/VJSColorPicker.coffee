class VJSColorPicker extends VJSControl
  events: 
    "click .picker": "click"
    "mousedown .slider": "dragBegin"

  initialize: () ->
    super()
    div = document.createElement 'div'
    div.className = 'swatch'
    div.appendChild @picker = document.createElement 'input'
    @picker.type = 'color'
    @el.appendChild div
    @render()

  render: () =>
    @picker.value = @model.get(@property.name)
    @el