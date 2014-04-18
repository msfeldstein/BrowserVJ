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

class SignalManagerView extends Backbone.View
  events:
    "change .add-signal": "addSignal"
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
    @popup.show({x:e.pageX, y:e.pageY}, values, @addSignal)

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
    console.log arguments
    @views[signal.cid].remove()