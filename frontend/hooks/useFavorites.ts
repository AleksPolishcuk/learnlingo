"use client";
import { useState, useCallback } from "react";
import api from "@/lib/api";
import { getStoredFavorites, setStoredFavorites } from "@/lib/auth";

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<string[]>(
    userId ? getStoredFavorites(userId) : [],
  );

  const toggle = useCallback(
    async (teacherId: string) => {
      if (!userId) return;
      const isFav = favorites.includes(teacherId);
      const next = isFav
        ? favorites.filter((id) => id !== teacherId)
        : [...favorites, teacherId];
      setFavorites(next);
      setStoredFavorites(userId, next);
      try {
        if (isFav) {
          await api.delete(`/favorites/${teacherId}`);
        } else {
          await api.post(`/favorites/${teacherId}`);
        }
      } catch {
        setFavorites(favorites);
        setStoredFavorites(userId, favorites);
      }
    },
    [favorites, userId],
  );

  return { favorites, toggle, setFavorites };
}
