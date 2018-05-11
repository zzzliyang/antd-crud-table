import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppAuth from './AppAuth';
import App from './App';
import { Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

// optional cofiguration
const options = {
  position: 'bottom center',
  timeout: 10000,
  offset: '50px',
  transition: 'scale'
};

class Root extends Component  {
  render () {
    return (
      <AlertProvider template={AlertTemplate} {...options}>
        <App />
      </AlertProvider>
    )
  }
};

ReactDOM.render(<Root />, document.getElementById('root'));
