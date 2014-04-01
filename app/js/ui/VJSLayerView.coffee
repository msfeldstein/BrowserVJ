class VJSLayerView extends Backbone.View
  initialize: () ->
    super()
    @inspector = new CompositionInspector(model: @model)
    @el.appendChild @inspector.el
    @el.appendChild @model.compositionPicker.render()
    
    @el.appendChild @model.effectsPanel.render()
    @listenTo @model, "change:composition", @compositionChanged

  compositionChanged: () =>
    @inspector.setComposition(@model.get("composition"))

  render: () =>
    @el