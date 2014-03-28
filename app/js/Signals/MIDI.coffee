class MIDI extends VJSSignal
  name: "MIDI"
  hidden: true
  inputs: [
    {name: "Listen", type: "boolean"}
  ]
  outputs: [
    {name: "MIDI Listen", type: "function", callback: "listenForNext", hidden: true}
  ]

  constructor: () ->
    super()
    navigator.requestMIDIAccess().then(@requestSuccess, @errorHandler)

  listenForNext: (observer, observingProperty) =>
    @listenNext = true
    @nextObserver = observer
    @nextObservingProperty = observingProperty

  onMIDIMessage: (message) =>
    # Data is [SurfaceID, KnobNumber, Value(0..127)]
    controlKey = "#{message.data[0]}:#{message.data[1]}"
    if @listenNext
      @nextObserver.bindToKey @nextObservingProperty, @, controlKey
      @listenNext = false
      @nextObserver = null
      @nextObservingProperty = null
    @set controlKey, message.data[2] / 127

  requestSuccess: (access) =>
    @midi = access
    for input in @midi.inputs()
      input.onmidimessage = @onMIDIMessage

  errorHandler: (e) =>
    console.log e