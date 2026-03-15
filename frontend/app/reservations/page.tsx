"use client";
import { useState, useEffect } from "react";
import { Booking } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import ReservationCard from "@/components/ReservationCard/ReservationCard";
import api from "@/lib/api";
import styles from "./page.module.css";

type FilterTab = "all" | "pending" | "confirmed" | "completed" | "cancelled";

export default function ReservationsPage() {
  useRoleGuard(["client"], "/teachers");

  const { isAuth, user, loading: authLoading } = useAuthContext();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    if (!isAuth || user?.role !== "client") return;
    api
      .get("/bookings")
      .then(({ data }) => setBookings(data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuth, user?.role]);

  const handleChange = (updated: Booking) =>
    setBookings((prev) =>
      prev.map((b) => (b._id === updated._id ? updated : b)),
    );

  const handleRemove = (id: string) =>
    setBookings((prev) => prev.filter((b) => b._id !== id));

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.teacherStatus === "pending").length,
    confirmed: bookings.filter((b) => b.teacherStatus === "confirmed").length,
    completed: bookings.filter((b) => b.teacherStatus === "completed").length,
    cancelled: bookings.filter((b) => b.teacherStatus === "cancelled").length,
  };

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.teacherStatus === filter);

  if (authLoading || user?.role === "business") return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>My Reservations</h1>

      <div className={styles.filterTabs}>
        {(
          [
            "all",
            "pending",
            "confirmed",
            "completed",
            "cancelled",
          ] as FilterTab[]
        ).map((f) => (
          <button
            key={f}
            className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={styles.filterCount}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading reservations…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>No {filter === "all" ? "" : filter} reservations.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((b) => (
            <ReservationCard
              key={b._id}
              booking={b}
              onChange={handleChange}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
