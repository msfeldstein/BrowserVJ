class SignalManager extends Backbone.Collection
  signalList:
    {name: "Signals", type: "select", options: ["Add Signal"], default: "Add Signal"}
  constructor: () ->
    super([], {model: VJSSignal})
    @set("Signals", "Add Signal")
    @signalClasses = []
    @registerSignal FallingSignal
    @registerSignal LFO
    @registerSignal Clock
    @registerSignal Palette
    @registerSignal ColorGenerator
    @registerSignal Sequencer
    @on "destroy", @remove

  registerSignal: (signalClass) ->
    @signalClasses.push signalClass
    @signalList.options.push signalClass.name
    @trigger 'change:registration'

  update: (time) ->
    for signal in @models
      signal.update(time)

  serialize: () ->
    data =
      signals: []
    @each (signal) ->
      serial = signal.serialize()
      if serial.name
        data.signals.push serial
    data

  # Unserialize self, and return anything that might need to be rebound
  unserialize: (state) ->
    for signalInfo in state.signals
      signal = VJSBindable.inflate(signalInfo)
      @add signal
    state.signals

class SignalManagerView extends Backbone.View
  events:
    "click .add-button": "showPopup"

  initialize: () ->
    @views = {}
    @listenTo @model, "add", @createSignalView
    @listenTo @model, "remove", @removeSignalView
    @listenTo @model, "change:registration", @render
    @addButton = document.createElement 'div'
    @addButton.className = 'add-signal add-button'
    @stack = document.createElement 'div'
    @el.appendChild @stack
    @el.appendChild @addButton
    @popup = new VJSPopup
    @render()

  addSignal: (e) =>
    if e.target.value != -1
      @model.add new @model.signalClasses[e.target.value]
      e.target.selectedIndex = 0

  showPopup: (e) =>
    values = []
    for signal in @model.signalClasses
      values.push signal.name
    @popup.show({element: e.target}, values, @addSignal)

  addSignal: (name) =>
    clazz = _.find(@model.signalClasses, ((s)->s.name==name))
    @model.add new clazz

  render: () =>
    @addButton.textContent = "+ Add Signal"
    @el

  createSignalView: (signal) =>
    if signal.hidden then return
    @views[signal.cid] = view = new SignalUIBase(model: signal)
    @stack.appendChild view.render()

  removeSignalView: (signal) =>
    @views[signal.cid].remove()
