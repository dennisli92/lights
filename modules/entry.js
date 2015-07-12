import React from '../bower_components/react/react.js';
import $ from '../bower_components/jquery/dist/jquery.js';
import _ from '../bower_components/underscore/underscore.js'

let audioContext = new (window.AudioContext || window.webkitAudioContext)(); // define audio context

let oscillator = null;

let fft = audioContext.createAnalyser();
fft.fftSize = 256;
fft.smoothingTimeConstant = 0.99;

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
    },

    // see http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
    HSVtoRGB(h, s, v, intensity) {
      var r, g, b, i, f, p, q, t;
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      switch (i % 6) {
          case 0: r = v, g = t, b = p; break;
          case 1: r = q, g = v, b = p; break;
          case 2: r = p, g = v, b = t; break;
          case 3: r = p, g = q, b = v; break;
          case 4: r = t, g = p, b = v; break;
          case 5: r = v, g = p, b = q; break;
      }
      return {
          r: r * 255,
          g: g * 255,
          b: b * 255,
          t: intensity
      };
    },

    // See http://www.vamusic.info/p/thecolourscale
    
    frequencyToColor(frequency, intensity) {
      let {note, octave} = this.frequencyToNote(frequency);

      return this.HSVtoRGB(note * 360, octave, intensity / 256, intensity);
    },

    // Relative to c0 (16.35 Hz)
    frequencyToNote(frequency, amplitud) {
      let c0 = 16.35; //Hz
      let note = (frequency % c0) / c0; // [0, 1)

      let multiplier = frequency / c0;
      let octave = Math.max(Math.floor(Math.log10(multiplier) / Math.log10(2)), 0);

      return {note, octave};
    },

    /*
     * see http://stackoverflow.com/questions/726549/algorithm-for-additive-color-mixing-for-rgb-values
     */
    blendColors(colorsList) {
      let normalizer = _(colorsList).reduce((sum, c) => sum + c.t, 0);
      return {
        r: Math.sqrt(_(colorsList).reduce((sum, c) => sum + c.r * c.r * c.t / normalizer, 0)),
        g: Math.sqrt(_(colorsList).reduce((sum, c) => sum + c.g * c.g * c.t / normalizer, 0)),
        b: Math.sqrt(_(colorsList).reduce((sum, c) => sum + c.b * c.b * c.t / normalizer, 0)),
        t: 1
      };
    }
  },

  getInitialState() {
    return {
      data: []
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

    // this.updateOscillator(15000);
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
    source.connect(fft);

    window.setInterval(this.update, 100);
  },

  update() {
    let frequencyData = new Uint8Array(fft.frequencyBinCount); 
    fft.getByteFrequencyData(frequencyData); 

    if (this.state.data.length < 10) {
      this.state.data.shift();
    }

    this.state.data.push(frequencyData)

    this.setState({
      data: this.state.data
    });
  },

  getColor() {
    let data = this.state.data;

    if (_(data).isEmpty())
      return 'white';

    // let sortedData = _(data)
    //   .chain()
    //   .map((value, index) => ({value, freq: App.frequencyForIndex(index)}))
    //   .sortBy(obj => obj.value)
    //   .value();

    // let max = _(sortedData).last();
    // let red = max.freq / 5000 * 256;

    // let max2 = _(sortedData).last(2)[0];

    let colorsList = _(data)
      .chain()
      .last()
      .map((value, index) => {
        let frequency = App.frequencyForIndex(index);

        return App.frequencyToColor(frequency, value);
      })
      .value()

    console.log(colorsList)
    let colors = App.blendColors(colorsList);
    console.log(colors);
    return `rgb(${Math.floor(colors.r)}, ${Math.floor(colors.g)}, ${Math.floor(colors.b)})`;
  },

  render() {
    let color = this.getColor();
    // console.log(color);
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
