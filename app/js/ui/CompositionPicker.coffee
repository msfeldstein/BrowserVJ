class CompositionPicker
  constructor: () ->
    @compositions = []

    @domElement = document.createElement 'div'
    @domElement.className = 'composition-picker'
    @domElement.draggable = true
    for i in [0..1]
      slot = document.createElement 'div'
      slot.className = 'slot'
      @domElement.appendChild slot
    @domElement.addEventListener 'dragover', (e) =>
      e.preventDefault()
      e.target.classList.add 'dragover'
    @domElement.addEventListener 'dragleave', (e) =>
      e.preventDefault()
      e.target.classList.remove 'dragover'
    @domElement.addEventListener 'drop', (e) =>
      e.preventDefault()
      e.target.classList.remove 'dragover'
      @drop(e)

  addComposition: (comp) ->
    slot = new CompositionSlot(model: comp)
    @domElement.appendChild slot.render()

  drop: (e) ->
    file = e.dataTransfer.files[0]
    console.log file
    composition = new VideoComposition file
    @addComposition composition

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
    setComposition @model

