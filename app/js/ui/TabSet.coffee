###
Pass views as an array of objects with a name property and a view property
###
class TabSet extends Backbone.View
  className: 'tab-set'
  events:
    "click .tab-label": "show"
  constructor: (parent, @views) ->
    super()
    parent.appendChild @el
    @labels = document.createElement('div')
    @el.appendChild @labels
    @labels.className = 'labels'
    @contents = document.createElement('div')
    @el.appendChild @contents
    @contents.className = 'contents'
    for viewDesc, i in @views
      @labels.appendChild label = document.createElement('div')
      label.className = 'tab-label'
      label.textContent = viewDesc.name
      label.view = viewDesc.view
      viewDesc.label = label
      @contents.appendChild viewDesc.view
      if i == 0
        label.classList.add('active')
      else
        viewDesc.view.style.display = 'none'


  show: (e) =>
    for viewDesc in @views
      if viewDesc.view == e.target.view
        viewDesc.label.classList.add('active')
        viewDesc.view.style.display = 'block'
      else
        viewDesc.label.classList.remove('active')
        viewDesc.view.style.display = 'none'

  render: () ->
    @el