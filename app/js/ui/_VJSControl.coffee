class VJSControl extends Backbone.View
  constructor:(model, @property) ->
    super(model: model)

  initialize: () ->
    @$el.on "contextmenu", @showBindings
    @listenTo @model, "change:#{@property.name}", @render

  showBindings: (e) =>
    e.preventDefault()
    el = window.application.valueBinder.render()
    window.application.valueBinder.show(e.pageX, e.pageY, @model, @property)

  div: (className, text) ->
    el = document.createElement('div')
    if className then el.className = className
    if text then el.textContent = text
    el
