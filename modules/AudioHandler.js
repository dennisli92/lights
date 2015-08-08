class AudioHandler {

  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); // define audio context
    this.fftAnalyser = this.getFFTAnalyser();
    this.lowPassFilter = this.getLowPassfilter();

    this.setupMic(navigator);

    this.data = [];
  }

  getFFTAnalyser() {
    const fftAnalyser = this.audioContext.createAnalyser();
    fftAnalyser.fftSize = 256;
    fftAnalyser.smoothingTimeConstant = 0.25;

    return fftAnalyser;
  }

  getLowPassfilter() {
    const lowPassFilter = this.audioContext.createBiquadFilter();
    lowPassFilter.type="lowpass";
    lowPassFilter.frequency.value = 8000;

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
    this.lowPassFilter.connect(this.fftAnalyser);

    window.setInterval(this.update.bind(this), 100);
  }

  update() {
    const frequencyData = new Uint8Array(this.fftAnalyser.frequencyBinCount); 
    this.fftAnalyser.getByteFrequencyData(frequencyData); 

    // document.body.style.backgroundColor = 'red';

    console.log(frequencyData)
  }
}

export default AudioHandler;
