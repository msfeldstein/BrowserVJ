class Keyboard extends VJSSignal
  name: "Keyboard"
  hidden: true
  inputs: [
    {name: "Listen", type: "boolean"}
  ]
  outputs: [
    {name: "Listen", type: "function", callback: "listenForNext", hidden: true}
  ]

  constructor: () ->
    super()
    $(document).keydown @down
    $(document).keyup @up

  down: (e) =>
    controlKey = String.fromCharCode(e.keyCode)
    if @listenNext
      @nextObserver.bindToKey @nextObservingProperty, @, controlKey
      @listenNext = false
      @nextObserver = null
      @nextObservingProperty = null
    @set controlKey, true

  up: (e) =>
    code = String.fromCharCode(e.keyCode)
    @set code, false

  listenForNext: (observer, observingProperty) =>
    @listenNext = true
    @nextObserver = observer
    @nextObservingProperty = observingProperty
