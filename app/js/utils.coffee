$ ->
  mouseCount = 0
  $(document.body).on "mousedown", () ->
    window.mouseIsDown = true

  $(document.body).on "mouseup", () ->
    window.mouseIsDown = false

