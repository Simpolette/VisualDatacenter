import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import keycloak, { initKeycloak } from './lib/keycloak';
import { useAuthStore } from './stores/useAuthStore';
import { setupApiInterceptors } from './lib/api';

const rootElement = document.getElementById('root')!;

// Render loading state while authenticating
const renderLoading = () => {
  createRoot(rootElement).render(
    <div style={{
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #38bdf8',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px auto'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2>Authenticating with Keycloak...</h2>
      </div>
    </div>
  );
};

renderLoading();

initKeycloak().then((authenticated) => {
  if (authenticated) {
    useAuthStore.getState().setAuth(keycloak);
    setupApiInterceptors();

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) {
          useAuthStore.getState().setAuth(keycloak);
        }
      }).catch(() => {
        console.error('Failed to refresh token');
      });
    };

    createRoot(rootElement).render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    );
  }
}).catch((err) => {
  console.error('Keycloak initialization error:', err);
});
