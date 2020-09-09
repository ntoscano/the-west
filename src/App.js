import React, { Component } from 'react';
import './App.css';

import MapChart from "./MapChart";

class App extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div className="App">
        <MapChart />
      </div>
    );
  }
}

export default App;
