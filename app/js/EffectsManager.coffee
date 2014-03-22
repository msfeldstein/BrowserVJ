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
    @trigger "change"

class EffectParameter extends Backbone.Model
  constructor: () ->
    super()

class EffectsPanel extends Backbone.View
  el: ".effects"
  events:
    "change .add-effect": "addEffect"
  initialize: () ->
    @gui = new dat.gui.GUI { autoPlace: false, width: "100%"}
    @addButton = document.createElement 'select'
    @addButton.className = 'add-effect'
    @stack = document.createElement 'div'
    @el.appendChild @gui.domElement
    @el.appendChild @addButton
    @listenTo @model, "change", @render
    @render()

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
    @stack.innerHTML = ""
    for effect, i in @model.stack
      if effect.controls then continue
      f = @gui.addFolder "#{i} - #{effect.name}"
      f.open()
      effect.controls = f
      if effect.options
        for values in effect.options
          if values.default then effect[values.property] = values.default
          val = f.add(effect, values.property, values.start, values.end).name(values.name) 
          val.domElement.querySelector('.property-name').appendChild audio = document.createElement 'checkbox'
          audio.className = 'audio-toggle'
      if effect.uniformValues
        for values in effect.uniformValues
          if values.default
            effect.uniforms[values.uniform].value = values.default
          val = f.add(effect.uniforms[values.uniform], "value", values.start, values.end).name(values.name)
          val.domElement.previousSibling.appendChild audio = document.createElement 'input'
          audio.type = 'checkbox'
          audio.datgui = val
          audio.target = effect.uniforms
          audio.property = values.uniform
          audio.className = 'audio-toggle'
          audio.addEventListener 'change', (e) ->
            e.target.datgui.listen()
            application.audioVisualizer.addListener (params) ->
              audio.target[audio.property].value = params.peak

