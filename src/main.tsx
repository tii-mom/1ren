import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const CLEANUP_KEY = '1ren-pwa-cleanup-v1';
if (
  'serviceWorker' in navigator &&
  !localStorage.getItem(CLEANUP_KEY)
) {
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister())
      );
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys.map((key) => caches.delete(key))
        );
      }
      localStorage.setItem(CLEANUP_KEY, 'done');
      window.location.reload();
    } catch (error) {
      console.warn('PWA cleanup failed:', error);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
