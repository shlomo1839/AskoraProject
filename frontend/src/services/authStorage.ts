import type { User } from '../types/auth.types';

const USER_KEY = 'survey_master_user';
const TOKEN_KEY = 'survey_token';

export const AuthStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuth(user: User, token: string): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  },

  getCurrentUser(): User | null {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved) as User;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  isLoggedIn(): boolean {
    return Boolean(AuthStorage.getToken() && AuthStorage.getCurrentUser());
  },
};
