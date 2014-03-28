class ColorGenerator extends VJSSignal
  inputs: [
    {name: "hue", type: "number", min: 0, max: 1}
    {name: "saturation", type: "number", min: 0, max: 1}
    {name: "brightness", type: "number", min: 0, max: 1}

  ]
  outputs: [
    {name: "color", type: "color"}
  ]

  outputProperty: "color"
  name: "Color"
  initialize: () ->
    super()
    @listenTo @, "change", @change

  change: () =>
    @set "color", Color.hsl(@get('hue'), @get('saturation'), @get('brightness'))

  update: (time) =>
    time = time / 1000
    period = @get("period")
    value = 0
    switch @get("type")
      when "Sin"
        value = Math.sin(Math.PI * time / (period)) * .5 + .5
      when "Square"
        value = Math.round(Math.sin(Math.PI * time / (period)) * .5 + .5)
      when "Sawtooth Up"
        value = (time / period)
        value = value - Math.floor(value)
      when "Sawtooth Down"
        value = (time / period)
        value = 1 - (value - Math.floor(value))

    @set "value", value
