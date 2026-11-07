import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure window.fetch has both getter and setter in environments where Chrome extensions attempt to assign window.fetch = ...
if (typeof window !== 'undefined') {
  try {
    let _activeFetch = window.fetch ? window.fetch.bind(window) : null;
    const descriptor = {
      get: () => _activeFetch,
      set: (fn: any) => {
        _activeFetch = fn;
      },
      configurable: true,
      enumerable: true,
    };
    try {
      Object.defineProperty(window, 'fetch', descriptor);
    } catch {}
    if ((window as any).Window && (window as any).Window.prototype) {
      try {
        Object.defineProperty((window as any).Window.prototype, 'fetch', descriptor);
      } catch {}
    }
  } catch {}
}

createRoot(document.getElementById('root')!).render(<App />);
