class VJSLayerView extends Backbone.View
  initialize: () ->
    super()
    @el.appendChild @model.compositionPicker.render()
    @inspector = new CompositionInspector
    @el.appendChild @inspector.el
    @el.appendChild @model.effectsPanel.render()
    @listenTo @model, "change:composition", @compositionChanged

  compositionChanged: () =>
    @inspector.setComposition(@model.get("composition"))

  render: () =>
    @el