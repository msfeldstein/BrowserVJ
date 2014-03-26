class Clock extends VJSSignal
  inputs: [
    {name: "BPM", type: "number", min: 1, max: 300, default: 120}
    {name: "BPMTap", type: "boolean"}
  ]
  outputs: [
    {name: "beat", type: "boolean"}
    {name: "smoothbeat", type: "number", min: 0, max: 1}
  ]
  name: "Clock"
  initialize: () ->
    super()
    @listenTo @, "change:BPMTap", @tap
    @downTime = 0
    @taps = []

  tap: (model, down) =>
    if !down then return
    t = Date.now()
    if @taps.length == 0
      @downTime = t
    @taps.push t
    if @taps.length > 4
      totalDelta = 0
      for i in [0..@taps.length - 2]
        tap = @taps[i]
        next = @taps[i+1]
        dt = next - tap
        totalDelta += dt
      periodMS = totalDelta / (@taps.length - 1)
      console.log periodMS
      @set("BPM", 60000 / periodMS)

    if @clearTimer then clearTimeout @clearTimer
    @clearTimer = setTimeout @clearTaps, 3000
  
  # So we don't get taps from previous tapping sessions  
  clearTaps: () =>
    @taps = []

  update: (time) ->
    periodMS = 60 / @get("BPM") * 1000
    timeSinceDown = time - @downTime
    timeInBeat = timeSinceDown % periodMS
    percentInBeat = timeInBeat / periodMS
    @set("smoothbeat", percentInBeat)
