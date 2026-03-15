"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnyTeacher, Teacher } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import TeacherCard from "@/components/TeacherCard/TeacherCard";
import Modal from "@/components/Modal/Modal";
import BookingForm from "@/components/BookingForm/BookingForm";
import SkeletonCard from "@/components/SkeletonCard/SkeletonCard";
import api from "@/lib/api";
import styles from "./page.module.css";

export default function FavoritesPage() {
  useRoleGuard(["client"], "/");

  const router = useRouter();
  const {
    isAuth,
    user,
    loading: authLoading,
    favorites,
    toggleFavorite,
  } = useAuthContext();

  const [favTeachers, setFavTeachers] = useState<AnyTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingTarget, setBookingTarget] = useState<{
    teacher: AnyTeacher;
    isAd: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isAuth) return;
    setLoading(true);
    api
      .get("/favorites")
      .then(({ data }) => setFavTeachers(data.favorites ?? []))
      .catch(() => setFavTeachers([]))
      .finally(() => setLoading(false));
  }, [isAuth]);

  const handleToggleFav = (
    id: string,
    kind: "Teacher" | "TeacherAd" = "Teacher",
  ) => {
    toggleFavorite(id, kind);
    setFavTeachers((prev) => prev.filter((t) => t._id !== id));
  };

  const handleBook = (teacher: AnyTeacher) => {
    const isAd = (teacher as any)._kind === "TeacherAd";
    setBookingTarget({ teacher, isAd });
  };

  if (authLoading || user?.role === "business") return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Favorites</h1>

      {loading ? (
        <div className={styles.list}>
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : favTeachers.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            You haven't added any teachers to your favorites yet.
          </p>
          <button
            className={styles.browseBtn}
            onClick={() => router.push("/teachers")}
          >
            Browse Teachers
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {favTeachers.map((t) => (
            <TeacherCard
              key={t._id}
              teacher={t as Teacher}
              isFav={favorites.includes(t._id)}
              onToggleFav={() =>
                handleToggleFav(
                  t._id,
                  (t as any)._kind === "TeacherAd" ? "TeacherAd" : "Teacher",
                )
              }
              onBook={() => handleBook(t)}
              isAuth={isAuth}
              onAuthRequired={() => router.push("/teachers")}
            />
          ))}
        </div>
      )}

      <Modal open={!!bookingTarget} onClose={() => setBookingTarget(null)} wide>
        {bookingTarget && (
          <BookingForm
            teacher={bookingTarget.teacher}
            isAd={bookingTarget.isAd}
            onClose={() => setBookingTarget(null)}
            onBooked={() => setBookingTarget(null)}
          />
        )}
      </Modal>
    </div>
  );
}
