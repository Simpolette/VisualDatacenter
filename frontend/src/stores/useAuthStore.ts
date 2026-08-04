import { create } from 'zustand';
import Keycloak from 'keycloak-js';

export interface UserProfile {
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  keycloakInstance: Keycloak | null;
  setAuth: (keycloak: Keycloak) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isViewer: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  keycloakInstance: null,

  setAuth: (keycloak: Keycloak) => {
    if (!keycloak.authenticated || !keycloak.tokenParsed) {
      set({ isAuthenticated: false, user: null, token: null, keycloakInstance: keycloak });
      return;
    }

    const parsed = keycloak.tokenParsed as Record<string, any>;
    const realmAccess = parsed.realm_access || {};
    const roles: string[] = realmAccess.roles || [];

    const user: UserProfile = {
      username: parsed.preferred_username || parsed.sub || 'User',
      email: parsed.email,
      firstName: parsed.given_name,
      lastName: parsed.family_name,
      roles,
    };

    set({
      isAuthenticated: true,
      user,
      token: keycloak.token || null,
      keycloakInstance: keycloak,
    });
  },

  logout: () => {
    const { keycloakInstance } = get();
    if (keycloakInstance) {
      keycloakInstance.logout({ redirectUri: window.location.origin });
    }
    set({ isAuthenticated: false, user: null, token: null });
  },

  hasRole: (role: string) => {
    const { user } = get();
    return user ? user.roles.includes(role) : false;
  },

  isAdmin: () => {
    return get().hasRole('platform_admin');
  },

  isManager: () => {
    return get().hasRole('dc_manager') || get().isAdmin();
  },

  isViewer: () => {
    return get().isAuthenticated;
  },
}));
