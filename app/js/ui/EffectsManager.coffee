EffectsClasses = [ZoomBlurPass, InkPass, NoisePass, MirrorPass, InvertPass, ChromaticAberration, MirrorPass, DotRollPass, KaleidoscopePass, ShroomPass]
class EffectsManager extends Backbone.Model
  constructor: (@composer) ->
    super()
    @effectClasses = []
    @stack = []
    for effectClass in EffectsClasses
      @registerEffect effectClass

  registerEffect: (effectClass) ->
    @effectClasses.push effectClass
    @trigger "change"

  addEffectToStack: (effect) ->
    @stack.push effect
    @listenTo effect, "destroy", @destroyEffect
    @composer.insertPass effect, @composer.passes.length - 1
    @trigger "add-effect", effect

  destroyEffect: (effect) =>
    @stopListening(effect)
    @composer.removePass effect

  moveEffect: (cid, newIndex) =>
    effect = _.find(@stack, (el) -> el.cid == cid)
    @composer.movePass(effect, newIndex + 1) # +1 because we need to keep the renderpass as first



class EffectsPanel extends Backbone.View
  className: "effects"
  events:
    "change .add-effect": "addEffect"

  initialize: () ->
    @panels = []
    @addButton = document.createElement 'select'
    @addButton.className = 'add-effect add-button'
    @stack = document.createElement 'div'
    @el.appendChild @stack
    @el.appendChild @addButton
    @listenTo @model, "change", @render
    @listenTo @model, "add-effect", @insertEffectPanel
    @render()
    $(@stack).sortable(handle: '.label', axis: 'y')
    $(@stack).on "sortupdate", @sortupdate

  sortupdate: (e, jui) =>
    modelid = jui.item[0].getAttribute("model-id")
    @model.moveEffect(modelid, jui.item.index())

  insertEffectPanel: (effect) =>
    @panels.push effectPanel = new SignalUIBase model: effect
    effectPanel.open()
    @listenTo effect, "destroy", @destroyEffect
    v = effectPanel.render()
    @stack.appendChild v
    

  addEffect: (e) =>
    if e.target.value != -1
      @model.addEffectToStack new @model.effectClasses[e.target.value]
      e.target.selectedIndex = 0

  destroyEffect: (effect) =>
    for panel in @panels
      if panel.model == effect
        panel.remove()

  render: () =>
    @addButton.innerHTML = "<option value=-1>Add Effect</option>"
    for effect, i in @model.effectClasses
      option = document.createElement 'option'
      option.value = i
      option.textContent = effect.effectName
      @addButton.appendChild option
    @el
    
