drop = (e) ->
  target = e.target
  file = e.dataTransfer.files[0]
  console.log file
  composition = new VideoComposition file
  composition.on "thumbnail-available", () ->
    target.appendChild composition.thumbnail()
  target.addEventListener 'click', (e) ->
    setComposition composition


class CompositionPicker
  constructor: () ->
    @domElement = document.createElement 'div'
    @domElement.className = 'composition-picker'
    @domElement.draggable = true
    for i in [0..5]
      slot = document.createElement 'div'
      slot.className = 'slot'
      @domElement.appendChild slot
      slot.addEventListener 'dragover', (e) ->
        e.preventDefault()
        e.target.classList.add 'dragover'
      slot.addEventListener 'dragleave', (e) ->
        e.preventDefault()
        e.target.classList.remove 'dragover'
      slot.addEventListener 'drop', (e) ->
        e.preventDefault()
        e.target.classList.remove 'dragover'
        drop(e)
