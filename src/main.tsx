import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {I18nProvider} from './i18n';
import './styles.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><I18nProvider><App/></I18nProvider></React.StrictMode>);
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(()=>{}); });
}
