class SignalManager extends Backbone.Collection
  constructor: () ->
    super([], {model: VJSSignal})
    @signalClasses = []
    @registerSignal LFO
    @registerSignal Clock
    @registerSignal Palette
    @registerSignal ColorGenerator
    @registerSignal Sequencer
    @on "destroy", @remove

  registerSignal: (signalClass) ->
    @signalClasses.push signalClass
    @trigger 'change:registration'

  update: (time) ->
    for signal in @models
      signal.update(time)

class SignalManagerView extends Backbone.View
  events:
    "change .add-signal": "addSignal"

  initialize: () ->
    @views = {}
    @listenTo @model, "add", @createSignalView
    @listenTo @model, "remove", @removeSignalView
    @listenTo @model, "change:registration", @render
    @addButton = document.createElement 'select'
    @addButton.className = 'add-signal add-button'
    @stack = document.createElement 'div'
    @el.appendChild @stack
    @el.appendChild @addButton
    @render()

  addSignal: (e) =>
    if e.target.value != -1
      @model.add new @model.signalClasses[e.target.value]
      e.target.selectedIndex = 0

  render: () =>
    @addButton.innerHTML = "<option value=-1>+ Add Signal</option>"
    for signal, i in @model.signalClasses
      option = document.createElement 'option'
      option.value = i
      option.textContent = signal.name
      @addButton.appendChild option
    @el

  createSignalView: (signal) =>
    if signal.hidden then return
    @views[signal.cid] = view = new SignalUIBase(model: signal)
    @stack.appendChild view.render()

  removeSignalView: (signal) =>
    @views[signal.cid].remove()