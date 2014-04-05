class LFO extends VJSSignal
  inputs: [
    {name: "measuretime", type: "number", min: 0, max: 1, autoconnect: "Clock.Measure", hidden: true}
    {name: "Clock Sync", type: "boolean", toggle: true}
    {name: "period", type: "number", min: 0, max: 10, default: 2}
    {name: "type", type: "select", options: ["Sin", "Square", "Triangle", "Sawtooth Up", "Sawtooth Down"], default: "Sin"}
  ]
  outputs: [
    {name: "value", type: "number", min: 0, max: 1}
  ]
  name: "LFO"
    
  update: (time) ->
    value = 0
    if @get("Clock Sync")
      time = @get("measuretime")
      period = .5
    else
      time = time / 1000
      period = @get("period")
    
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
