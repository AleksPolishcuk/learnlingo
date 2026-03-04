"use client";
import { useState, useEffect, useCallback } from "react";
import { Teacher, TeacherFilters } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import FilterBar from "@/components/FilterBar/FilterBar";
import TeacherCard from "@/components/TeacherCard/TeacherCard";
import Modal from "@/components/Modal/Modal";
import BookingForm from "@/components/BookingForm/BookingForm";
import api from "@/lib/api";
import styles from "./page.module.css";
import SkeletonCard from "@/components/SkeletonCard/SkeletonCard";

const PAGE_SIZE = 4;
const DEFAULT_FILTERS: TeacherFilters = { language: "", level: "", price: "" };

export default function TeachersPage() {
  const { isAuth, favorites, toggleFavorite, openAuthWarn, showToast } =
    useAuthContext();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TeacherFilters>(DEFAULT_FILTERS);
  const [bookingTeacher, setBookingTeacher] = useState<Teacher | null>(null);

  const fetchTeachers = useCallback(
    async (nextFilters: TeacherFilters, nextPage: number, append: boolean) => {
      try {
        setLoading(true);
        const params: Record<string, string> = {
          page: String(nextPage),
          limit: String(PAGE_SIZE),
        };
        if (nextFilters.language) params.language = nextFilters.language;
        if (nextFilters.level) params.level = nextFilters.level;
        if (nextFilters.price) params.price = nextFilters.price;

        const { data } = await api.get("/teachers", { params });
        setTeachers((prev) =>
          append ? [...prev, ...data.teachers] : data.teachers,
        );
        setHasMore(data.hasMore);
      } catch (err: any) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    setPage(1);
    fetchTeachers(filters, 1, false);
  }, [filters]); // eslint-disable-line

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchTeachers(filters, next, true);
  };

  const handleFiltersChange = (f: TeacherFilters) => {
    setFilters(f);
  };

  const handleBook = (teacher: Teacher) => {
    if (!isAuth) {
      openAuthWarn();
      return;
    }
    setBookingTeacher(teacher);
  };

  return (
    <div className={styles.page}>
      <FilterBar filters={filters} onChange={handleFiltersChange} />

      {loading && teachers.length === 0 ? (
        <div className={styles.list}>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className={styles.empty}>
          <svg
            className={styles.emptyIcon}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use
              href="/sprite.svg#icon-glass"
              xlinkHref="/sprite.svg#icon-glass"
            />
          </svg>

          <p className={styles.emptyTitle}>
            No teachers found for these filters
          </p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {teachers.map((t) => (
              <TeacherCard
                key={t._id}
                teacher={t}
                isFav={favorites.includes(t._id)}
                onToggleFav={() => {
                  if (!isAuth) {
                    openAuthWarn();
                    return;
                  }
                  toggleFavorite(t._id);
                }}
                onBook={() => handleBook(t)}
                isAuth={isAuth}
                onAuthRequired={openAuthWarn}
              />
            ))}
          </div>

          {hasMore && (
            <div className={styles.loadMore}>
              <button
                className={styles.loadMoreBtn}
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!bookingTeacher}
        onClose={() => setBookingTeacher(null)}
        wide
      >
        {bookingTeacher && (
          <BookingForm
            teacher={bookingTeacher}
            onClose={() => setBookingTeacher(null)}
            onBooked={() => showToast("Trial lesson booked!")}
          />
        )}
      </Modal>
    </div>
  );
}
