import { User } from '@/types';

const TOKEN_KEY = 'll_token';
const USER_KEY = 'll_user';

export const saveAuth = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const getFavoritesKey = (userId: string) => `ll_favs_${userId}`;

export const getStoredFavorites = (userId: string): string[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(getFavoritesKey(userId));
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};

export const setStoredFavorites = (userId: string, favs: string[]) => {
  localStorage.setItem(getFavoritesKey(userId), JSON.stringify(favs));
};
