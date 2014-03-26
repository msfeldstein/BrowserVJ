# Model is a module, being an effect or a signal patch
class VJSSlider extends VJSControl
  events: 
    "click .slider": "click"
    "mousedown .slider": "dragBegin"

  initialize: () ->
    super()
    div = document.createElement 'div'
    div.className = 'slider'
    div.appendChild @level = document.createElement 'div'
    @level.className = 'level'
    @el.appendChild div

    @max = @property.max
    @min = @property.min
    @listenTo @model, "change:#{@property.name}", @render
    @render()

  dragBegin: (e) =>
    if e.button != 0 then return
    $(document).on 
      'mousemove': @dragMove
      'mouseup': @dragEnd
    @click(e)

  dragMove: (e) =>
    @click(e)

  dragEnd: (e) =>
    $(document).off
      'mousemove': @dragMove
      'mouseup': @dragEnd

  click: (e) =>
    x = e.pageX - @el.offsetLeft
    percent = x / @el.clientWidth
    value = (@max - @min) * percent + @min
    value = Math.clamp(value, @min, @max)
    @model.set(@property.name, value)

  render: () => 
    value = @model.get(@property.name)
    percent = (value - @min) / (@max - @min) * 100
    @level.style.width = "#{percent}%"
    @level.textContent = Math.roundTo value, 2
    @el

class VJSSelect extends Backbone.View
  events: 
    "change select": "change"
  constructor: (model, @property) ->
    super(model: model)

  initialize: () ->
    @el.appendChild div = document.createElement 'div'
    div.appendChild select = document.createElement 'select'
    for option in @property.options
      select.appendChild opt = document.createElement 'option'
      opt.value = option
      opt.textContent = option

  change: (e) =>
    @model.set(@property.name, e.target.value)
    
  render: () =>
    @el