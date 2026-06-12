import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './showcase/App';
import Smoke from './showcase/smoke';

/* `?smoke` 进入工具链冒烟页，默认进入完整展示站 */
const Root = new URLSearchParams(window.location.search).has('smoke') ? Smoke : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
