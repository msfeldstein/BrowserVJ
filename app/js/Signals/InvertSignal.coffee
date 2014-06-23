class InvertSignal extends VJSSignal
  inputs: [
    {name: "input", type: "number", min: 0, max: 1, default: 0}
  ]
  outputs: [
    {name: "value", type: "number", min: 0, max: 1}
  ]
  name: "Invert"
    
  update: (time) ->
    @set "value", 1 - @get("input")
