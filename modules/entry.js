import React from '../bower_components/react/react.js';
import $ from '../bower_components/jquery/dist/jquery.js';

let audioContext = new (window.AudioContext || window.webkitAudioContext)(); // define audio context

let oscillator = audioContext.createOscillator();
oscillator.frequency.value = 17000;

// let biquadFilter = audioContext.createBiquadFilter();
// biquadFilter.type = biquadFilter.BANDPASS;
// biquadFilter.frequency.value = 15000;
// biquadFilter.Q.value = biquadFilter.frequency.value / (17000 - 13000);

let fft = audioContext.createAnalyser();
let gfx = null;

let App = React.createClass({

  statics: {
    setupMicrophone() {
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      window.URL = window.URL || window.webkitURL;
    },
  },

  componentDidMount() {
    App.setupMicrophone();

    navigator.getUserMedia(
      {
        audio: {
          'mandatory': {
              'googEchoCancellation': 'false',
              'googAutoGainControl': 'false',
              'googNoiseSuppression': 'false',
              'googHighpassFilter': 'false'
          },
          optional: []
        }
      },

      this.processStream,

      error => console.error(error)
    );

    this.setupOscillator();
  },

  setupOscillator() {
    oscillator.connect(audioContext.destination);
    oscillator.start()
  },

  processStream(stream) {
    // let audio = this.refs['audio'].getDOMNode();
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
    gfx.fillRect(0,0,800,600); 
     
    var data = new Uint8Array(audioContext.sampleRate); 
    fft.getByteFrequencyData(data); 
    gfx.fillStyle = 'red'; 

    for(var i=0; i<data.length; i++) { 
      gfx.fillRect(100 + i*4, 100 + 256 - data[i] * 2, 3, 100); 
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
