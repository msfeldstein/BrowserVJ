class EffectsManager extends Backbone.Model
  constructor: (@composer) ->
    super()
    @effectClasses = []
    @stack = []

  registerEffect: (effectClass) ->
    @effectClasses.push effectClass
    @trigger "change"

  addEffectToStack: (effect) ->
    @stack.push effect
    @composer.insertPass effect, @composer.passes.length - 1
    @trigger "add-effect", effect

class EffectParameter extends Backbone.Model


class EffectControl extends Backbone.View
  className: "effect-control"
  initialize: () ->

  render: () ->
    @el.textContent = @model.get("name")

class EffectsPanel extends Backbone.View
  el: ".effects"
  events:
    "change .add-effect": "addEffect"
  initialize: () ->
    @addButton = document.createElement 'select'
    @addButton.className = 'add-effect'
    @stack = document.createElement 'div'
    @el.appendChild @stack
    @el.appendChild @addButton
    @listenTo @model, "change", @render
    @listenTo @model, "add-effect", @insertEffectPanel
    @render()

  insertEffectPanel: (effect) =>
    effectParameter = new SignalUIBase model: effect
    @stack.appendChild effectParameter.render()

  addEffect: (e) =>
    if e.target.value != -1
      @model.addEffectToStack new @model.effectClasses[e.target.value]
      e.target.selectedIndex = 0

  render: () =>
    @addButton.innerHTML = "<option value=-1>Add Effect</option>"
    for effect, i in @model.effectClasses
      option = document.createElement 'option'
      option.value = i
      option.textContent = effect.name
      @addButton.appendChild option
    
