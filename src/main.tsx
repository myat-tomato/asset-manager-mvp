import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/login.css';
import './styles/menu.css';
import './styles/device-list.css';
import './styles/history-table.css';
import './styles/device-detail.css';
import './styles/device-qr.css';
import './styles/device-history.css';
import './styles/employee-search-result.css';
import './styles/qr-scan.css';
import './styles/qr-generate.css';
import './styles/loan.css';
import './styles/complete.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);