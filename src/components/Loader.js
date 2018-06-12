import React, { Component } from 'react';
import '../styles/loader.css';

const Loader = (propList) => (WrappedComponent) => {
  return class Loader extends Component {

    isEmpty(prop) {
      return (
        prop === null ||
        prop === undefined ||
        (prop.hasOwnProperty('length') && prop.length === 0) || //Empty Array
        (prop.constructor === Object && Object.keys(prop).length === 0) // Empty Object
      )
    }
    
    render() {
      return propList.some(propName => this.isEmpty(this.props[propName]))
          ? <div className="loader" />
          : <WrappedComponent {...this.props} />
    }
  }  
}

export default Loader;