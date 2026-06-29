import React from 'react';
import ReactDOM from 'react-dom/client';
import { HomePage } from './pages/HomePage';
import { PublicPropertyPage } from './pages/PublicPropertyPage';
import './styles.css';

function App() {
  const path = window.location.pathname;
  const publicPropertyMatch = path.match(/^\/r\/(.+)$/);

  if (publicPropertyMatch?.[1]) {
    return <PublicPropertyPage slug={decodeURIComponent(publicPropertyMatch[1])} />;
  }

  return <HomePage />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
