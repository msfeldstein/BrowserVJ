class @Clock extends VJSSignal
  name: "Clock"
  readonly: true
  inputs: [
    {name: "BPM", type: "number", min: 1, max: 300, default: 80}
    {name: "BPMTap", type: "boolean"}
    {name: "DownBeat", type: "boolean"}
  ]
  outputs: [
    {name: "Beat", type: "boolean"}
    {name: "Downbeat", type: "boolean"}
    {name: "BeatNumber", type: "number", min: 1, max: 8}
    {name: "Smoothbeat", type: "number", min: 0, max: 1}
    {name: "Measure", type: "number", min: 0, max: 1}
  ]

  initialize: () ->
    super()
    @downTime = 0
    @taps = []
    application.globalSignals.Clock = @

  "change:DownBeat": (model, down) =>
    if down
      @downTime = Date.now()

  "change:BPMTap": (model, down) =>
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
      @set("BPM", 60000 / periodMS)

    if @clearTimer then clearTimeout @clearTimer
    @clearTimer = setTimeout @clearTaps, 3000

  # So we don't get taps from previous tapping sessions
  clearTaps: () =>
    @taps = []

  update: (time) ->
    periodMS = 60 / @get("BPM") * 1000
    timeSinceDown = time - @downTime
    beatNumber = Math.floor(timeSinceDown / periodMS)
    measuretime = Math.fract(timeSinceDown / (periodMS * 4))
    @set("Measure", measuretime)
    timeInBeat = timeSinceDown % periodMS
    percentInBeat = timeInBeat / periodMS
    if percentInBeat < @lastPercent
      @set("Beat", true)
      if beatNumber % 4 == 0 then @set("Downbeat", true)
      @set("BeatNumber", (beatNumber % 8) + 1)
    else
      @set("Beat", false)
      @set("Downbeat", false)
    @lastPercent = percentInBeat
    @set("Smoothbeat", percentInBeat)
