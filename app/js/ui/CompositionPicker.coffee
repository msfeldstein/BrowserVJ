class CompositionPicker extends Backbone.View
  className: "composition-picker"

  events:
    "dragover": "dragover"
    "dragleave": "dragleave"
    "drop": "drop"
    "click .slot": "launch"
  
  constructor: (@layer) ->
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
    @compositions.push comp
    if !comp.thumbnail then comp.generateThumbnail()
    @el.appendChild slot.render()

  launch: (e) =>
    cid = e.currentTarget.getAttribute("data-composition-id")
    composition = _.find(@compositions, ((comp) -> comp.cid == cid))
    @layer.setComposition(composition)

  render: () =>
    @el

class CompositionSlot extends Backbone.View
  className: 'slot'
  events:
    "click img": "launch"

  initialize: () =>
    super()
    @el.setAttribute("data-composition-id", @model.cid)
    @listenTo @model, "thumbnail-available", @render

  render: () =>
    @$el.html(@model.thumbnail)
    @el


