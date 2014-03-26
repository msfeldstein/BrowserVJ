class VJSControl extends Backbone.View
  constructor:(model, @property) ->
    super(model: model)

  initialize: () ->
    @$el.on "contextmenu", @showBindings

  showBindings: (e) =>
    e.preventDefault()
    el = window.application.valueBinder.render()
    window.application.valueBinder.show(@model, @property)
    el.style.top = e.pageY + "px"
    el.style.left = e.pageX + "px"