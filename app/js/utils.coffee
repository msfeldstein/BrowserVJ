Math.clamp = (val, min, max) ->
  Math.min(max, Math.max(val, min))

Math.roundTo = (val, places) ->
  power = Math.pow(10, places)
  Math.round(val * power) / power