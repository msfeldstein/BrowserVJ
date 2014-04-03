# Don't allow dropping of files onto the body to change the page
# in case people accidentally miss the composition picker.
$ ->
  $(document.body).on "dragover", (e) ->
    e.preventDefault()
  $(document.body).on "drop", (e) ->
    e.preventDefault()