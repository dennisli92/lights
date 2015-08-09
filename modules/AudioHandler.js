import _ from '../bower_components/lodash/lodash.js';

class AudioHandler {

  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); // define audio context
    this.analyser = this.getAnalyser();
    this.lowPassFilter = this.getLowPassfilter();

    this.setupMic(navigator);

    this.data = [];

    this.prevSound = {
      pitch: 0,
      loudness: 0,
      timbre: 0
    }
  }

  getAnalyser() {
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.25;

    return analyser;
  }

  getLowPassfilter() {
    const lowPassFilter = this.audioContext.createBiquadFilter();
    lowPassFilter.type="lowpass";
    lowPassFilter.frequency.value = 8000; // ignore frequencies > 8000 Hz

    return lowPassFilter;
  }

  setupMic() {
    navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    window.URL = window.URL || window.webkitURL;

    navigator.getUserMedia({audio: true}, 
      this.processStream.bind(this),
      error => console.error(error)
    );
  }

  processStream(stream) {
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.lowPassFilter);
    this.lowPassFilter.connect(this.analyser);

    window.setInterval(this.update.bind(this), 10);
  }

  update() {
    const fft = new Float32Array(this.analyser.frequencyBinCount); 
    const wave = new Float32Array(this.analyser.frequencyBinCount); 

    // http://stackoverflow.com/questions/24083349/understanding-getbytetimedomaindata-and-getbytefrequencydata-in-web-audio
    this.analyser.getFloatFrequencyData(fft); 
    this.analyser.getFloatTimeDomainData(wave);

    this.currSound = {
      pitch: this.getPitch(fft),
      loudness: this.getLoudness(wave),
      timbre: this.getTimbre(fft, wave)
    };

    const newColor = this.getColor(this.currSound, this.prevSound);
    this.prevSound = this.currSound;

    console.log(newColor)

    document.body.style.backgroundColor = newColor;
  }

  indexToHz(index) {
    const nyquistFreq = this.audioContext.sampleRate / 2;
    const freqPerIndex = nyquistFreq / this.analyser.frequencyBinCount;

    return freqPerIndex * (index + 0.5);
  }

  getPitch(fft) {
    const pitchIndex = _(fft).indexOf(_(fft).max());
    return this.indexToHz(pitchIndex)
  }

  getLoudness(wave) {
    return _(wave).max();
  }

  static dBToIntensity(dB) {
    return Math.pow(10, dB / 10);
  }

  // https://en.wikipedia.org/wiki/Timbre#Tristimulus_timbre_model
  getTimbre(fft, wave) {
    const peak = _(fft).max();
    const pitchIndex = _(fft).indexOf(peak);

    const harmonicsSum = _([1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .chain()
      .map(exponent => Math.pow(2, exponent))
      .map(multiplier => pitchIndex * multiplier)
      .filter(index => index < fft.length)
      .map(index => AudioHandler.dBToIntensity(fft[index]))
      .sum()
      .value();

    return (harmonicsSum / AudioHandler.dBToIntensity(peak)) || 0;
  }

  getColor(sound, prevSound) {
    const {pitch, loudness, timbre} = sound;
    const {pitch: prevPitch, loudness: prevLoudness, timbre: prevTimbre} = prevSound;

    const hue = timbre * 360;
    const saturation = loudness * 100;
    const lightness = pitch * 100 / this.lowPassFilter.frequency.value; 

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

}

export default AudioHandler;
