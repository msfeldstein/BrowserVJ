class @MIDI extends VJSSignal
  name: "MIDI"
  inputs: [
    {name: "Listen", type: "boolean"}
  ]
  outputs: [
    {name: "MIDI Listen", type: "function", hidden: true}
  ]

  constructor: () ->
    super()
    navigator.requestMIDIAccess().then(@requestSuccess, @errorHandler)

  "change:Listen": (model, value) =>
    if value
      @listenNext = true
      console.log "Listening"

  onMIDIMessage: (message) =>
    # Data is [SurfaceID, KnobNumber, Value(0..127)]
    controlKey = "#{message.data[0]}:#{message.data[1]}"
    if @listenNext
      
      @listenNext = false



  requestSuccess: (access) =>
    @midi = access
    for input in @midi.inputs()
      input.onmidimessage = @onMIDIMessage

  errorHandler: (e) =>
    console.log e