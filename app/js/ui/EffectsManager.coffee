class EffectsManager extends Backbone.Model
  constructor: (@composer) ->
    super()
    @effectClasses = VJSLibrary.instance.get("effects")
    @stack = []

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

  serialize: () ->
    effects = []
    for effect in @stack
      effects.push effect.serialize()
    effects



class EffectsPanel extends Backbone.View
  className: "effects"
  events:
    "click .add-button": "showPopup"

  initialize: () ->
    @panels = []
    @popup = new VJSPopup
    @addButton = document.createElement 'div'
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

  showPopup: (e) =>
    values = []
    for effect in @model.effectClasses
      values.push(effect.effectName || effect.name)
    @popup.show({element: e.target}, values, @addEffect)

  insertEffectPanel: (effect) =>
    @panels.push effectPanel = new SignalUIBase model: effect
    effectPanel.open()
    @listenTo effect, "destroy", @destroyEffect
    v = effectPanel.render()
    @stack.appendChild v

  addEffect: (name) =>
    clazz = _.find(@model.effectClasses, ((s)->s.effectName==name))
    @model.addEffectToStack new clazz

  destroyEffect: (effect) =>
    for panel in @panels
      if panel.model == effect
        panel.remove()

  render: () =>
    @addButton.textContent = "+ Add Effect"
    @el
    
