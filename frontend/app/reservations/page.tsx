"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Booking } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import ReservationCard from "@/components/ReservationCard/ReservationCard";
import api from "@/lib/api";
import styles from "./page.module.css";

export default function ReservationsPage() {
  const router = useRouter();
  const { isAuth, loading, showToast } = useAuthContext();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isAuth) router.replace("/teachers");
  }, [loading, isAuth, router]);

  useEffect(() => {
    if (!isAuth) return;
    api
      .get("/bookings")
      .then(({ data }) => setBookings(data.bookings))
      .catch(() => setBookings([]))
      .finally(() => setFetching(false));
  }, [isAuth]);

  const handleCancel = async (id: string) => {
    try {
      await api.delete(`/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      showToast("Booking cancelled.");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleUpdate = (updated: Booking) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updated._id ? updated : b)),
    );
    showToast("Reservation updated!");
  };

  if (loading || !isAuth) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>My Reservations</h1>

      {fetching ? (
        <p className={styles.loading}>Loading…</p>
      ) : bookings.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📅</div>
          <p className={styles.emptyTitle}>No bookings yet</p>
          <p className={styles.emptyText}>
            Book a trial lesson with a teacher to see your reservations here.
          </p>
          <button
            className={styles.goBtn}
            onClick={() => router.push("/teachers")}
          >
            Find a Teacher
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {bookings.map((b) => (
            <ReservationCard
              key={b._id}
              booking={b}
              onCancel={handleCancel}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
