class VJSSlider extends Backbone.View
  events: 
    "click .slider": "click"

  constructor:(model, @property) ->
    super(model: model)

  initialize: () ->
    div = document.createElement 'div'
    div.className = 'slider'
    div.appendChild @level = document.createElement 'div'
    @level.className = 'level'
    @el.appendChild div

    @max = @property.max
    @min = @property.min
    @listenTo @model, "change:#{@property.name}", @render
    @render()

  click: (e) =>
    if e.button then console.log e
    x = e.offsetX
    percent = x / @el.clientWidth
    value = (@max - @min) * percent + @min
    @model.set(@property.name, value)

  render: () => 
    if @model.name == "Invert" then console.log @
    value = @model.get(@property.name)
    percent = (value - @min) / (@max - @min) * 100
    @level.style.width = "#{percent}%"
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