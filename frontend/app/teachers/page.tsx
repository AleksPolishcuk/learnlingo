"use client";
import { useState, useEffect, useCallback } from "react";
import { Teacher, TeacherFilters, AnyTeacher } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import FilterBar from "@/components/FilterBar/FilterBar";
import TeacherCard from "@/components/TeacherCard/TeacherCard";
import Modal from "@/components/Modal/Modal";
import BookingForm from "@/components/BookingForm/BookingForm";
import api from "@/lib/api";
import styles from "./page.module.css";
import SkeletonCard from "@/components/SkeletonCard/SkeletonCard";

const PAGE_SIZE = 4;
const DEFAULT_FILTERS: TeacherFilters = {
  language: "",
  level: "",
  price: "",
  sortBy: "",
};

export default function TeachersPage() {
  const { isAuth, favorites, toggleFavorite, openAuthWarn, showToast } =
    useAuthContext();

  const [teachers, setTeachers] = useState<AnyTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TeacherFilters>(DEFAULT_FILTERS);

  const [bookingTeacher, setBookingTeacher] = useState<{
    teacher: AnyTeacher;
    isAd: boolean;
  } | null>(null);

  const fetchAll = useCallback(
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
        if (nextFilters.sortBy) params.sortBy = nextFilters.sortBy;

        const [teachersRes, adsRes] = await Promise.allSettled([
          api.get("/teachers", { params }),
          api.get("/teacher-ads", { params }),
        ]);

        const seeded: AnyTeacher[] =
          teachersRes.status === "fulfilled"
            ? (teachersRes.value.data.teachers ?? [])
            : [];

        const ads: AnyTeacher[] =
          adsRes.status === "fulfilled"
            ? (adsRes.value.data.teachers ?? [])
            : [];

        const taggedAds = ads.map((a) => ({ ...a, _isAd: true }));

        let merged: AnyTeacher[] = [...seeded, ...taggedAds];

        if (nextFilters.sortBy === "name_asc") {
          merged.sort((a, b) =>
            `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`),
          );
        } else if (nextFilters.sortBy === "name_desc") {
          merged.sort((a, b) =>
            `${b.name} ${b.surname}`.localeCompare(`${a.name} ${a.surname}`),
          );
        } else if (nextFilters.sortBy === "newest") {
          merged.sort((a, b) => {
            const aDate = (a as any).createdAt
              ? new Date((a as any).createdAt).getTime()
              : 0;
            const bDate = (b as any).createdAt
              ? new Date((b as any).createdAt).getTime()
              : 0;
            return bDate - aDate;
          });
        } else if (nextFilters.sortBy === "oldest") {
          merged.sort((a, b) => {
            const aDate = (a as any).createdAt
              ? new Date((a as any).createdAt).getTime()
              : Infinity;
            const bDate = (b as any).createdAt
              ? new Date((b as any).createdAt).getTime()
              : Infinity;
            return aDate - bDate;
          });
        }

        setTeachers((prev) => (append ? [...prev, ...merged] : merged));

        const seededHasMore =
          teachersRes.status === "fulfilled"
            ? teachersRes.value.data.hasMore
            : false;
        const adsHasMore =
          adsRes.status === "fulfilled" ? adsRes.value.data.hasMore : false;
        setHasMore(seededHasMore || adsHasMore);
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
    fetchAll(filters, 1, false);
  }, [filters]); // eslint-disable-line

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchAll(filters, next, true);
  };

  const handleBook = (teacher: AnyTeacher) => {
    if (!isAuth) {
      openAuthWarn();
      return;
    }
    const isAd = !!(teacher as any)._isAd;
    setBookingTeacher({ teacher, isAd });
  };

  return (
    <div className={styles.page}>
      <FilterBar filters={filters} onChange={setFilters} />

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
                teacher={t as Teacher}
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
            teacher={bookingTeacher.teacher}
            isAd={bookingTeacher.isAd}
            onClose={() => setBookingTeacher(null)}
            onBooked={() => showToast("Trial lesson booked!")}
          />
        )}
      </Modal>
    </div>
  );
}
