class ValueBinder extends Backbone.View
  className: "popup"
  events: 
    "click .binding-row": "clickRow"

  initialize: () ->
    document.body.appendChild @el

  render: () =>
    @el.innerHTML = ''
    row = document.createElement 'div'
    row.className = 'binding-row'
    row.textContent = "Clear Binding"
    row.signal = null
    row.property = null
    @el.appendChild row
    @el.appendChild document.createElement 'hr'
    for signal in @model.models
      row = document.createElement 'div'
      row.className = 'binding-label'
      row.textContent = signal.name
      @el.appendChild row
      for output in signal.outputs
        @el.appendChild outputRow = document.createElement 'div'
        outputRow.className = 'binding-row'
        outputRow.textContent = output.name
        outputRow.signal = signal
        outputRow.property = output.name
    @el

  clickRow: (e) =>
    target = e.target
    signal = target.signal
    property = target.property
    observer = @currentModel
    if signal
      observer.bindToKey @currentProperty, signal, property
    else
      observer.clearBinding @currentProperty
    @hide()

  show: (model, property) =>
    @currentModel = model
    @currentProperty = property
    $(document).on "keydown", @keydown
    $(document).on "mousedown", @mousedown
    @$el.show()
  
  hide: () =>
    $(document).off "keydown", @keydown
    $(document).off "mousedown", @mousedown
    @$el.hide()

  mousedown: (e) =>
    if $(e.target).closest(".popup").length == 0
      @hide()

  keydown: (e) =>
    if e.keyCode == 27
      @hide()


