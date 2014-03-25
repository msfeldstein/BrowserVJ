class Clock extends VJSSignal
  inputs: [
    {name: "BPM", type: "number", min: 1, max: 300, default: 120}
    {name: "type", type: "select", options: ["Sin", "Square", "Triangle", "Sawtooth Up", "Sawtooth Down"], default: "Sin"}
  ]
  outputs: [
    {name: "value", type: "number", min: 0, max: 1}
  ]
  name: "LFO"
  initialize: () ->
    super()
    
  update: (time) ->
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
