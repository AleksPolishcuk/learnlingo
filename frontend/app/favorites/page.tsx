"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Teacher, AnyTeacher } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import TeacherCard from "@/components/TeacherCard/TeacherCard";
import Modal from "@/components/Modal/Modal";
import BookingForm from "@/components/BookingForm/BookingForm";
import SkeletonCard from "@/components/SkeletonCard/SkeletonCard";
import api from "@/lib/api";
import styles from "./page.module.css";

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

  const [teachers, setTeachers] = useState<AnyTeacher[]>([]);
  const [fetching, setFetching] = useState(true);
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
      .then(({ data }) => setTeachers(data.favorites ?? []))
      .catch(() => setTeachers([]))
      .finally(() => setFetching(false));
  }, [isAuth]);

  if (loading || !isAuth) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>My Favorites</h1>

      {fetching ? (
        <div className={styles.list}>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : teachers.length === 0 ? (
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
                const kind =
                  (t as any)._kind === "TeacherAd" ? "TeacherAd" : "Teacher";
                toggleFavorite(t._id, kind);
                setTeachers((prev) => prev.filter((x) => x._id !== t._id));
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
