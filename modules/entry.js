import React from '../bower_components/react/react.js';
import $ from '../bower_components/jquery/dist/jquery.js';

let App = React.createClass({

  statics: {
    setupMicrophone() {
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      window.URL = window.URL || window.webkitURL;
    }
  }

  componentDidMount() {
    let audio = this.refs['audio'].getDOMNode();
    App.setupMicrophone();

    navigator.getUserMedia({audio: true, video: false},
      stream => audio.src = window.URL.createObjectURL(stream),
      error => console.error(error)
    );
  },

  render() {
    return (
      <div>
        Hello world
        <audio ref="audio" autoPlay />
      </div>
    );
  }
})

$(document).ready(() => React.render(<App />, document.body))
