class FallingSignal extends VJSSignal
  inputs: [
    {name: "in", type: "number", min: 0, max: 1, default: 0}
    {name: "fallSpeed", type: "number", min: 0, max: 1, default: .3}
  ]
  outputs: [
    {name: "out", type: "number", min: 0, max: 1, default: 0}
  ]

  name: "Fall"

  "change:in": (obj, val) =>
    

  update: (time) ->
    input = @get("in")
    out = @get("out")
    if input > out then out = input
    out -= @get("fallSpeed") * .1
    out = Math.clamp(out, 0, 1)
    @set("out", out)