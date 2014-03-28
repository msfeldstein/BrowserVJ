class Gamepad extends VJSSignal
  hidden: true
  name: "Gamepad"
  outputs: [
    {name: "Gamepad Listen", type: "function", callback: "listenForNext", hidden: true}
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

  buttonEvent: (key, value) ->
    if @listenNext
      @nextObserver.bindToKey @nextObservingProperty, @, key
      @listenNext = false
      @nextObserver = null
      @nextObservingProperty = null
    @set key, value

  axisEvent: (pad, axisIndex) ->
    key = "#{pad.index}-Axis#{axisIndex}"
    value = pad.axes[axisIndex]
    lastValue = @lastAxes[axisIndex]

    if @listenNext && Math.abs(lastValue - value) > .1
      @nextObserver.bindToKey @nextObservingProperty, @, key
      @listenNext = false
      @nextObserver = null
      @nextObservingProperty = null

    value = (value + 1) / 2 # Normalize from 0..1
    if axisIndex == 1 || axisIndex == 3 then value = 1 - value
    @set key, value

  update: () =>
    pad = navigator.webkitGetGamepads()[0]
    if pad && @lastPad
      for button in Gamepad.BUTTONS
        if pad.buttons[button] != @lastButtons[button]
          @buttonEvent "#{pad.index}-#{button}", pad.buttons[button]
      for axis, i in pad.axes
        if axis != @lastAxes[i]
          @axisEvent pad, i
    @lastPad = pad
    @lastButtons = pad?.buttons
    @lastAxes = pad?.axes

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
