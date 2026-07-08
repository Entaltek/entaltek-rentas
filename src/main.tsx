import React from 'react';
import ReactDOM from 'react-dom/client';
import { EditorPage } from './pages/EditorPage';
import { HomePage } from './pages/HomePage';
import { PublicPropertyPage } from './pages/PublicPropertyPage';
import './styles.css';
import './layout-overrides.css';
import './ux-overrides.css';
import './home-polish.css';
import './property-flow-polish.css';
import './form-copy-polish.css';

function App() {
  const path = window.location.pathname;
  const publicPropertyMatch = path.match(/^\/r\/(.+)$/);

  if (publicPropertyMatch?.[1]) {
    return <PublicPropertyPage slug={decodeURIComponent(publicPropertyMatch[1])} />;
  }

  if (path === '/crear' || path === '/crear/') {
    return <EditorPage />;
  }

  return <HomePage />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
