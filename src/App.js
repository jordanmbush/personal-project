import React, { Component } from 'react';
import logo from './logo.svg';
import routes from './routes';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        {routes}
      </div>
    );
  }
}

export default App;
