class AudioInputNode extends Backbone.Model
  constructor: () ->
    super()
    navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia_({audio: true}, @startAudio, (()->))
    @context = new webkitAudioContext()
    @analyzer = @context.createAnalyser()
    @set "selectedFreq", 500

  startAudio: (stream) =>
    mediaStreamSource = @context.createMediaStreamSource(stream)
    mediaStreamSource.connect @analyzer
    requestAnimationFrame @update

  update: () =>
    requestAnimationFrame @update
    if !@data
      @data = new Uint8Array(@analyzer.frequencyBinCount)
      @set "data", @data
    @analyzer.getByteFrequencyData(@data);
    @set "peak", @data[@get('selectedFreq')]
    @trigger "change:data"
