class CompositionPicker extends Backbone.View
  className: "composition-picker"

  events:
    "dragenter": "dragenter"
    "dragover": "dragover"
    "dragleave": "dragleave"
    "drop": "drop"
    "click .slot": "launch"
  
  constructor: (@layer) ->
    super()
    @compositions = []

  dragenter: (e) =>
    
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
    @addCompositionFromFile(file)

  addCompositionFromFile: (file) ->
    composition = null
    if file.type.indexOf("video") == 0
      composition = new VideoComposition file
    else if file.type.indexOf("image") == 0
      composition = new ImageComposition file
    if composition
      @addComposition composition
    else
      alert("I don't know what to do with this file :(")

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
    @listenTo @model, "change:active", @activeChanged

  activeChanged: (obj, val) =>
    if val
      @el.classList.add("active")
    else
      @el.classList.remove("active")
  render: () =>
    @$el.html(@model.thumbnail)
    @el


