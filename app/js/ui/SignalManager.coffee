class SignalManager extends Backbone.Collection
  constructor: () ->
    super([], {model: VJSSignal})

  update: (time) ->
    for signal in @models
      signal.update(time)

class SignalManagerView extends Backbone.View
  el: ".signals"
  initialize: () ->
    @views = []
    @listenTo @model, "add", @createSignalView

  createSignalView: (signal) =>
    @views.push view = new SignalUIBase(model: signal)
    @el.appendChild view.render()