class Gamepad extends VJSSignal
  @FACE_1: 0
  @FACE_2: 1
  @FACE_3: 2
  @FACE_4: 3
  @LEFT_SHOULDER: 4
  @RIGHT_SHOULDER: 5
  @LEFT_SHOULDER_BOTTOM: 6
  @RIGHT_SHOULDER_BOTTOM: 7
  @SELECT: 8
  @START: 9
  @LEFT_ANALOGUE_STICK: 10
  @RIGHT_ANALOGUE_STICK: 11
  @PAD_TOP: 12
  @PAD_BOTTOM: 13
  @PAD_LEFT: 14
  @PAD_RIGHT: 15
  @STICK_1: 16
  @STICK_2: 17

  @BUTTONS = [@FACE_1, @FACE_2, @FACE_3, @FACE_4, @LEFT_SHOULDER, @RIGHT_SHOULDER, @LEFT_SHOULDER_BOTTOM, @RIGHT_SHOULDER_BOTTOM, @SELECT, @START, @LEFT_ANALOGUE_STICK, @RIGHT_ANALOGUE_STICK, @PAD_TOP, @PAD_BOTTOM, @PAD_LEFT, @PAD_RIGHT]

  name: "Gamepad"
  outputs: [
    {name: "Listen", type: "function", callback: "listenForNext", hidden: true}
  ]

  constructor: () ->
    super()
    requestAnimationFrame @checkForPad

  checkForPad: () =>
    if navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0]
      @pad = navigator.webkitGetGamepads()[0]
    else
      requestAnimationFrame @checkForPad

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

  buttonEvent: (key, value) ->
    if @listenNext
      @nextObserver.bindToKey @nextObservingProperty, @, key
      @listenNext = false
      @nextObserver = null
      @nextObservingProperty = null
    @set key, value

  update: () =>
    setTimeout @updatePad, 1000
    pad = navigator.webkitGetGamepads()[0]
    if pad && @lastPad
      for button in Gamepad.BUTTONS
        if pad.buttons[button] != @lastButtons[button]
          @buttonEvent "#{pad.index}-#{button}", pad.buttons[button]
    @lastPad = pad
    @lastButtons = pad.buttons
