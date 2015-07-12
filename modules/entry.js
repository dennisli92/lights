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
fft.fftSize = 256;

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

  getInitialState() {
    return {
      data: false
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

    window.setInterval(this.update, 100);
  },

  update() {
    let data = new Uint8Array(fft.frequencyBinCount); 
    fft.getByteFrequencyData(data); 

    this.setState({
      data
    });
  },

  getColor() {
    let data = this.state.data;

    if (!data)
      return 'white';

    // let sortedData = _(data)
    //   .chain()
    //   .map((value, index) => ({value, freq: App.frequencyForIndex(index)}))
    //   .sortBy(obj => obj.value)
    //   .value();

    // let max = _(sortedData).last();
    // let red = max.freq / 5000 * 256;

    // let max2 = _(sortedData).last(2)[0];

    let bass = 0, mids = 0, trebble = 0;

    _(data).each((value, index) => {
      let freq = App.frequencyForIndex(index);

      if (freq < 512) {
        bass = Math.floor(Math.max(bass, value));
      } else if (freq < 2048) {
        mids = Math.floor(Math.max(mids, value));
      } else if (freq < 12000) {
        trebble = Math.floor(Math.max(trebble, value));
      }
    });

    return `rgb(${bass}, ${mids}, ${trebble})`;
  },

  render() {
    let color = this.getColor();
    console.log(color);
    return (
      <div style={{
        'width':'100%', 
        'height': '100%',
        'content': ' ',
        'backgroundColor': color
      }}>
      </div>
    );
  }
})

$(document).ready(() => React.render(<App />, document.body))
