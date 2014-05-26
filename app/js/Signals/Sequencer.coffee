class @Sequencer extends VJSSignal
  name: "Sequencer"
  inputs: [
    {name: "beat1", type: "boolean", toggle: true}
    {name: "beat2", type: "boolean", toggle: true}
    {name: "beat3", type: "boolean", toggle: true}
    {name: "beat4", type: "boolean", toggle: true}
    {name: "beat5", type: "boolean", toggle: true}
    {name: "beat6", type: "boolean", toggle: true}
    {name: "beat7", type: "boolean", toggle: true}
    {name: "beat8", type: "boolean", toggle: true}
    {name: "beatNumber", type: "number"}
  ]
  outputs: [
    {name: "pulse", type: "boolean"}
    {name: "steady", type: "boolean"}
  ]

  initialize: () ->
    super()
    @clock = application.clock
    @bindToKey {name:"beatNumber"}, @clock, "BeatNumber"
    @listenTo @, "change:beatNumber", @changeBeatNumber

  pulse: () =>
    @set("pulse", true)
    requestAnimationFrame @clearPulse

  clearPulse: () =>
    @set("pulse", false)

  changeBeatNumber: (seq, beat) =>
    if @get("beat#{beat}")
      @set("steady", true)
      @pulse()
    else
      @set("steady", false)
  update: (time) ->
    lastBeat = @beat
    @beat =
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
