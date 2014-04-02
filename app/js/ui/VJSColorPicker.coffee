class VJSColorPicker extends VJSControl
  events: 
    "change .picker": "colorChange"

  initialize: () ->
    super()
    div = document.createElement 'div'
    div.className = 'swatch'
    div.appendChild @picker = document.createElement 'input'
    @picker.type = 'color'
    @picker.className = 'picker'
    @el.appendChild div
    @render()

  colorChange: (e) =>
    @model.set @property.name, e.target.value

  render: () =>
    @picker.value = @model.get(@property.name)
    @el