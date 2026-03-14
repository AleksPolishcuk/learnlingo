"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Teacher, AnyTeacher } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import TeacherCard from "@/components/TeacherCard/TeacherCard";
import Modal from "@/components/Modal/Modal";
import BookingForm from "@/components/BookingForm/BookingForm";
import SkeletonCard from "@/components/SkeletonCard/SkeletonCard";
import api from "@/lib/api";
import styles from "./page.module.css";

const PAGE_SIZE = 3;

export default function FavoritesPage() {
  const router = useRouter();
  const {
    isAuth,
    loading,
    favorites,
    toggleFavorite,
    showToast,
    openAuthWarn,
  } = useAuthContext();

  const allRef = useRef<AnyTeacher[]>([]);
  const [visible, setVisible] = useState<AnyTeacher[]>([]);
  const [fetching, setFetching] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const [bookingTeacher, setBookingTeacher] = useState<{
    teacher: AnyTeacher;
    isAd: boolean;
  } | null>(null);

  useEffect(() => {
    if (!loading && !isAuth) router.replace("/teachers");
  }, [loading, isAuth, router]);

  useEffect(() => {
    if (!isAuth) return;
    api
      .get("/favorites")
      .then(({ data }) => {
        const all: AnyTeacher[] = data.favorites ?? [];
        allRef.current = all;
        setVisible(all.slice(0, PAGE_SIZE));
        setHasMore(all.length > PAGE_SIZE);
      })
      .catch(() => {
        allRef.current = [];
        setVisible([]);
        setHasMore(false);
      })
      .finally(() => setFetching(false));
  }, [isAuth]);

  const handleLoadMore = () => {
    const currentCount = visible.length;
    const next = allRef.current.slice(0, currentCount + PAGE_SIZE);
    setVisible(next);
    setHasMore(next.length < allRef.current.length);
  };

  const handleRemove = (id: string) => {
    allRef.current = allRef.current.filter((x) => x._id !== id);
    setVisible((prev) => {
      const next = prev.filter((x) => x._id !== id);
      if (next.length < prev.length && allRef.current.length >= next.length) {
        const replenished = allRef.current.slice(0, next.length);
        setHasMore(replenished.length < allRef.current.length);
        return replenished;
      }
      setHasMore(next.length < allRef.current.length);
      return next;
    });
  };

  if (loading || !isAuth) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>My Favorites</h1>

      {fetching ? (
        <div className={styles.list}>
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💛</div>
          <p className={styles.emptyTitle}>No favorites yet</p>
          <p className={styles.emptyText}>
            Browse teachers and click ♥ to save them here.
          </p>
          <button
            className={styles.goBtn}
            onClick={() => router.push("/teachers")}
          >
            Browse Teachers
          </button>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {visible.map((t) => (
              <TeacherCard
                key={t._id}
                teacher={t as Teacher}
                isFav={favorites.includes(t._id)}
                onToggleFav={() => {
                  if (!isAuth) {
                    openAuthWarn();
                    return;
                  }
                  const kind =
                    (t as any)._kind === "TeacherAd" ? "TeacherAd" : "Teacher";
                  toggleFavorite(t._id, kind);
                  handleRemove(t._id);
                }}
                onBook={() => {
                  const isAd = (t as any)._kind === "TeacherAd";
                  setBookingTeacher({ teacher: t, isAd });
                }}
                isAuth={true}
                onAuthRequired={() => {}}
              />
            ))}
          </div>

          {hasMore && (
            <div className={styles.loadMore}>
              <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
                Load more
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
