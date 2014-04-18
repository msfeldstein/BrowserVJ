class VJSSelect extends VJSControl
  className: 'vjs-select'
  events: 
    "click .row": "change"
    "click .button": "showPopup"

  showBindings: () =>
    "do nothing"

  initialize: () ->
    super()
    @el.appendChild @button = @div('button')
    @el.appendChild @popup = @div('popup')

  change: (e) =>
    @model.set(@property.name, e.target.textContent.trim())
    @popup.style.display = "none"

  showPopup: () =>
    @popup.style.display = "block"
    
  render: () =>
    @button.textContent = @model.get(@property.name)
    @popup.innerHTML = ''
    for option in @property.options
      @popup.appendChild opt = @div('row', option)
    @el
