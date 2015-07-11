import React from '../bower_components/react/react.js';
import $ from '../bower_components/jquery/dist/jquery.js';

let App = React.createClass({
  render() {
    return (
      <div>
        Hello world
      </div>
    );
  }
})

$(document).ready(() => React.render(<App />, document.body))
