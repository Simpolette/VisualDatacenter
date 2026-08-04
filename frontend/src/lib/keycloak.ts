import Keycloak from 'keycloak-js';

const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'vdt';
const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'vdt-app';

const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
});

export const initKeycloak = async (): Promise<boolean> => {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
    return authenticated;
  } catch (error) {
    console.error('Failed to initialize Keycloak', error);
    return false;
  }
};

export default keycloak;
