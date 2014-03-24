class LFO extends VJSSignal
  inputs: [
    {name: "period", type: "number", min: 0, max: 10, default: 2}
    {name: "type", type: "select", options: ["Sin", "Square", "Triangle"], default: "Sin"}
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
    @set "value", value
