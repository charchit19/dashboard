import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './components/dashboard';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);

reportWebVitals();
