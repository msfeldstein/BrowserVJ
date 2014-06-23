EffectsClasses = [ZoomBlurPass, InkPass, NoisePass, MirrorPass, InvertPass, ChromaticAberration, MirrorPass, DotRollPass, KaleidoscopePass, ShroomPass]

class VJSLibrary extends Backbone.Model
  initialize: () ->
    @set "effects", EffectsClasses
    @set "compositions", []
    for effect in EffectsClasses
      @addEffect effect

  addEffect: (effect) ->
    @get("effects").push effect
    @trigger("change:effects")

  addEffectFromFile: (file) ->
    reader = new FileReader
    reader.file = file
    reader.onload = () =>
       @addEffect ISFEffect.fromFile(file, reader.result)
    reader.readAsText(file)


class VJSLibraryView extends Backbone.View
  className: 'vjs-library'

  initialize: () ->
    super()
    @effectsView = new VJSEffectsLibraryView(model: @model)
    @el.appendChild @effectsView.render()

  render: () =>
    @el

class VJSEffectsLibraryView extends VJSCell
  events:
    "dragenter": "dragenter"
    "dragover": "dragover"
    "dragleave": "dragleave"
    "drop": "drop"

  initialize: () ->
    super()
    @el.appendChild label = _V.div('label', "Effects Available")
    @el.appendChild(@stack = _V.div('stack'))
    @listenTo @model, "change:effects", @render  

  dragenter: (e) =>
    e.preventDefault()

  dragover: (e) =>
    console.log 'DRAGOVER'
    e.preventDefault()
    @el.classList.add 'dragover'

  dragleave: (e) =>
    e.preventDefault()
    @el.classList.remove 'dragover'
  
  drop:  (e) =>
    e.preventDefault()
    @el.classList.remove 'dragover'
    file = e.originalEvent.dataTransfer.files[0]
    @model.addEffectFromFile(file)

  render: () =>
    @stack.innerHTML = ""
    for effect in @model.get("effects")
      @stack.appendChild(_V.div('effect-list-item', effect.effectName))
    @el
    