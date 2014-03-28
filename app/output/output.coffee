$ ->
  canvas = document.querySelector('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  opener.application.setOutputCanvas canvas