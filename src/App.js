import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import routes from './routes';
import './App.css';
import './reset.css';

class App extends Component {
  render() {
    return (
      <Fragment>
        {routes}
      </Fragment>
    );
  }
}

export default App;
