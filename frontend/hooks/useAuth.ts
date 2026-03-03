"use client";
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { saveAuth, clearAuth, getStoredToken, getStoredUser } from "@/lib/auth";
import api from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((tok: string, usr: User) => {
    saveAuth(tok, usr);
    setToken(tok);
    setUser(usr);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(
    (updated: User) => {
      if (token) saveAuth(token, updated);
      setUser(updated);
    },
    [token],
  );

  return { user, token, loading, login, logout, updateUser, isAuth: !!user };
}
