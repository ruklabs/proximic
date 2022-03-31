import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './components/App/App.css';
import App from './components/App/App';
import Voice from './components/Voice/Voice';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<App />} />
          <Route exact path='/voice' element={<Voice />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
