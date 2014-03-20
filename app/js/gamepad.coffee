class Gamepad
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

  constructor: () ->
    @pad = null
    @callbacks = {}
    @callbacks[Gamepad.STICK_1] = []
    @callbacks[Gamepad.STICK_2] = []
    @buttonStates = {}
    for button in Gamepad.BUTTONS
      @buttonStates[button] = 0
    requestAnimationFrame @checkForPad

  checkForPad: () =>
    if navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0]
      @pad = navigator.webkitGetGamepads()[0]
      requestAnimationFrame @checkButtons
    else
      requestAnimationFrame @checkForPad

  checkButtons: () =>
    @pad = navigator.webkitGetGamepads()[0]
    requestAnimationFrame @checkButtons
    for button in Gamepad.BUTTONS
      if @callbacks[button] && @buttonStates[button] != @pad.buttons[button]
        @buttonStates[button] = @pad.buttons[button]
        for buttonId, callback of @callbacks[button]
          callback(@pad.buttons[button])
    for callback in @callbacks[Gamepad.STICK_1]
      callback({x:@pad.axes[0],y:@pad.axes[1]})
    for callback in @callbacks[Gamepad.STICK_2]
      callback({x:@pad.axes[2],y:@pad.axes[3]})


  addEventListener: (button, callback) ->
    if !@callbacks[button] then @callbacks[button] = []
    @callbacks[button].push callback
