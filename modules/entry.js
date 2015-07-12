import React from '../bower_components/react/react.js';
import $ from '../bower_components/jquery/dist/jquery.js';
import _ from '../bower_components/underscore/underscore.js'

let audioContext = new (window.AudioContext || window.webkitAudioContext)(); // define audio context

let oscillator = null;

// let biquadFilter = audioContext.createBiquadFilter();
// biquadFilter.type = biquadFilter.BANDPASS;
// biquadFilter.frequency.value = 15000;
// biquadFilter.Q.value = biquadFilter.frequency.value / (17000 - 13000);

let fft = audioContext.createAnalyser();
fft.fftSize = 1024;

let nyquistFreq = audioContext.sampleRate / 2;
let freqPerIndex = nyquistFreq / fft.frequencyBinCount;

let gfx = null;

let App = React.createClass({

  statics: {
    dbAtFrequency(freqBuffer, freq) {
      return freqBuffer[this.indexForFrequency(freq)];
    },

    indexForFrequency(freq) {
      return Math.round(freq / freqPerIndex);
    },

    frequencyForIndex(index) {
      return freqPerIndex * index;
    }
  },

  setupMicrophone() {
    navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    window.URL = window.URL || window.webkitURL;

    navigator.getUserMedia({audio: true}, 
      this.processStream,
      error => console.error(error)
    );
  },

  componentDidMount() {
    this.setupMicrophone();

    this.updateOscillator(15000);
  },

  updateOscillator(freq) {
    if (oscillator) {
      oscillator.stop();
    }

    oscillator = audioContext.createOscillator();
    oscillator.frequency.value = freq;
    oscillator.connect(audioContext.destination);
    oscillator.start()
  },

  processStream(stream) {
    let out = audioContext.createBufferSource();

    let source = audioContext.createMediaStreamSource(stream);
    // source.connect(biquadFilter);
    source.connect(fft);
    // fft.connect(audioContext.destination)
    //
    let canvas = this.refs['analyser'].getDOMNode();
    gfx = canvas.getContext('2d');

    requestAnimationFrame(this.update); 
  },

  update() {
    requestAnimationFrame(this.update); 

    gfx.clearRect(0,0,800,600); 
    gfx.fillStyle = 'gray'; 
    let freqBuffer = new Uint8Array(fft.frequencyBinCount); 
    fft.getByteFrequencyData(freqBuffer); 

    let data = _(freqBuffer)
      .chain()
      .map((value, index) => ({value, freq: App.frequencyForIndex(index)}))
      .sortBy(obj => obj.value)
      .value();

    console.log(_(data).last())


    gfx.fillStyle = 'red'; 

    for(var i=0; i< freqBuffer.length; i++) { 
      gfx.fillRect(100 + i, 100 + 256 - freqBuffer[i] * 2, 3, 100); 
    } 
  },

  render() {
    return (
      <div>
        <canvas ref="analyser" />
      </div>
    );
  }
})

$(document).ready(() => React.render(<App />, document.body))
