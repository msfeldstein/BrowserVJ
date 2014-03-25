class CompositionPicker extends Backbone.View
  el: ".composition-picker"

  events:
    "dragover": "dragover"
    "dragleave": "dragleave"
    "drop": "drop"
  
  constructor: () ->
    super()
    @compositions = []
  dragover: (e) =>
    e.preventDefault()
    @el.classList.add 'dragover'

  dragleave: (e) =>
    e.preventDefault()
    @el.classList.remove 'dragover'
  
  drop:  (e) =>
    e.preventDefault()
    @el.classList.remove 'dragover'
    file = e.originalEvent.dataTransfer.files[0]
    composition = new VideoComposition file
    @addComposition composition

  addComposition: (comp) ->
    slot = new CompositionSlot(model: comp)
    if !comp.thumbnail then comp.generateThumbnail()
    @el.appendChild slot.render()

  render: () =>
    @el

class CompositionSlot extends Backbone.View
  className: 'slot'
  events:
    "click img": "launch"

  initialize: () =>
    super()
    @listenTo @model, "thumbnail-available", @render

  render: () =>
    @$el.html(@model.thumbnail)
    @el

  launch: () =>
    application.setComposition @model

