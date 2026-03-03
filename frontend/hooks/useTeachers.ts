'use client';
import { useState, useCallback } from 'react';
import { Teacher, TeacherFilters } from '@/types';
import api from '@/lib/api';

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchTeachers = useCallback(async (filters: TeacherFilters, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = reset ? 1 : page;
      const params: Record<string, string> = { page: String(currentPage), limit: '4' };
      if (filters.language) params.language = filters.language;
      if (filters.level) params.level = filters.level;
      if (filters.price) params.price = filters.price;

      const { data } = await api.get('/teachers', { params });
      if (reset) {
        setTeachers(data.teachers);
        setPage(2);
      } else {
        setTeachers((prev) => [...prev, ...data.teachers]);
        setPage((p) => p + 1);
      }
      setHasMore(data.hasMore);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  return { teachers, loading, error, hasMore, fetchTeachers };
}

export function useFavoriteTeachers(ids: string[]) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (ids.length === 0) { setTeachers([]); return; }
    try {
      setLoading(true);
      const { data } = await api.get('/favorites');
      setTeachers(data.favorites);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [ids]);

  return { teachers, loading, fetchFavorites };
}
