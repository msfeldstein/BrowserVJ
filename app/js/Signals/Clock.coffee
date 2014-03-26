class Clock extends VJSSignal
  inputs: [
    {name: "BPM", type: "number", min: 1, max: 300, default: 120}
    {name: "BPM Tap", type: "boolean"}
  ]
  outputs: [
    {name: "beat", type: "boolean"}
    {name: "smoothbeat", type: "number", min: 0, max: 1}
  ]
  name: "Clock"
  initialize: () ->
    super()
    @listenTo @, "change:BPM Tap", @tap
    @downTime = 0

  tap: (model, options) =>
    
    
  update: (time) ->
    periodMS = 60 / @get("BPM") * 1000
    timeSinceDown = time - @downTime
    timeInBeat = timeSinceDown % periodMS
    percentInBeat = timeInBeat / periodMS
    @set("smoothbeat", percentInBeat)
