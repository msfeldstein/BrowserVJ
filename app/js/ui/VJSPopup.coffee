class VJSPopup extends Backbone.View
  className: 'popup'

  events:
    'click .row': 'clickRow'

  initialize: () ->
    document.body.appendChild @el

  show: (pos, options, callback) ->
    @el.textContent = ""
    @nextCallback = callback
    for option in options
      @addOption option

    $(document).on "keydown", @keydown
    $(document).on "mousedown", @mousedown

    @el.style.display = 'block'
    x = pos.x
    y = pos.y
    if x + @el.offsetWidth > window.innerWidth
      @el.style.left = (x - @el.offsetWidth) + "px"
    else
      @el.style.left = x + "px"
    if y + @el.offsetHeight > window.innerHeight
      @el.style.top = (y - @el.offsetHeight) + "px"
    else
      @el.style.top = y + "px"

    

  addOption: (option) ->
    @el.appendChild row = document.createElement('div')
    row.className = "row"
    row.textContent = option

  clickRow: (e) =>
    @nextCallback e.target.textContent
    @hide()


  hide: () =>
    @nextCallback = null
    $(document).off "keydown", @keydown
    $(document).off "mousedown", @mousedown
    @$el.hide()

  mousedown: (e) =>
    console.log "STOLEN"
    if $(e.target).closest(".popup").length == 0
      @hide()

  keydown: (e) =>
    if e.keyCode == 27
      @hide()
