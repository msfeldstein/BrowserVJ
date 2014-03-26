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
    @picker.value = @model.get(@property.name)
    @el.appendChild div

  render: () =>
    @el