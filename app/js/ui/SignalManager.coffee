class SignalManager extends Backbone.Collection
  constructor: () ->
    super([], {model: VJSSignal})
    @signalClasses = []

  registerSignal: (signalClass) ->
    @signalClasses.push signalClass
    @trigger 'change:registration'

  update: (time) ->
    for signal in @models
      signal.update(time)

class SignalManagerView extends Backbone.View
  el: ".signals"
  events:
    "change .add-signal": "addSignal"

  initialize: () ->
    @views = []
    @listenTo @model, "add", @createSignalView
    @listenTo @model, "change:registration", @render
    @addButton = document.createElement 'select'
    @addButton.className = 'add-signal'
    @stack = document.createElement 'div'
    @el.appendChild @stack
    @el.appendChild @addButton
    @render()

  addSignal: (e) =>
    if e.target.value != -1
      @model.add new @model.signalClasses[e.target.value]
      e.target.selectedIndex = 0

  render: () =>
    @addButton.innerHTML = "<option value=-1>Add Signal</option>"
    for signal, i in @model.signalClasses
      option = document.createElement 'option'
      option.value = i
      option.textContent = signal.name
      @addButton.appendChild option

  createSignalView: (signal) =>
    @views.push view = new SignalUIBase(model: signal)
    @stack.appendChild view.render()