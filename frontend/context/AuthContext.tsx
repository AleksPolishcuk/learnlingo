"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/types";
import {
  saveAuth,
  clearAuth,
  getStoredToken,
  getStoredUser,
  getStoredFavorites,
  setStoredFavorites,
} from "@/lib/auth";
import api from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuth: boolean;
  favorites: string[];
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  toggleFavorite: (teacherId: string) => Promise<void>;
  toast: { message: string; type: "success" | "error" } | null;
  showToast: (message: string, type?: "success" | "error") => void;
  clearToast: () => void;
  authModal: "login" | "register" | null;
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  profileModal: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  authWarn: boolean;
  openAuthWarn: () => void;
  closeAuthWarn: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [profileModal, setProfileModal] = useState(false);
  const [authWarn, setAuthWarn] = useState(false);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setFavorites(getStoredFavorites(storedUser._id));
    }
    setLoading(false);
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
    },
    [],
  );

  const clearToast = useCallback(() => setToast(null), []);

  const login = useCallback(
    (tok: string, usr: User) => {
      saveAuth(tok, usr);
      setToken(tok);
      setUser(usr);
      setFavorites(getStoredFavorites(usr._id));
      setAuthModal(null);
      showToast(`Welcome back, ${usr.name}!`);
    },
    [showToast],
  );

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    setFavorites([]);
    showToast("Logged out successfully.");
  }, [showToast]);

  const updateUser = useCallback(
    (updated: User) => {
      if (token) saveAuth(token, updated);
      setUser(updated);
      showToast("Profile updated!");
    },
    [token, showToast],
  );

  const toggleFavorite = useCallback(
    async (teacherId: string) => {
      if (!user) return;
      const isFav = favorites.includes(teacherId);
      const next = isFav
        ? favorites.filter((id) => id !== teacherId)
        : [...favorites, teacherId];
      setFavorites(next);
      setStoredFavorites(user._id, next);
      try {
        if (isFav) {
          await api.delete(`/favorites/${teacherId}`);
        } else {
          await api.post(`/favorites/${teacherId}`);
        }
      } catch {
        setFavorites(favorites);
        setStoredFavorites(user._id, favorites);
      }
    },
    [user, favorites],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuth: !!user,
        favorites,
        login,
        logout,
        updateUser,
        toggleFavorite,
        toast,
        showToast,
        clearToast,
        authModal,
        openLogin: () => setAuthModal("login"),
        openRegister: () => setAuthModal("register"),
        closeAuthModal: () => setAuthModal(null),
        profileModal,
        openProfile: () => setProfileModal(true),
        closeProfile: () => setProfileModal(false),
        authWarn,
        openAuthWarn: () => setAuthWarn(true),
        closeAuthWarn: () => setAuthWarn(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
