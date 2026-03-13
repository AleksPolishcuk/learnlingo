"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Booking } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import DashboardBookingCard from "@/components/DashboardBookingCard/DashboardBookingCard";
import EarningsPanel from "@/components/EarningsPanel/EarningsPanel";
import api from "@/lib/api";
import styles from "./page.module.css";

type FilterTab = "all" | "pending" | "confirmed" | "completed" | "cancelled";
type SectionTab = "bookings" | "earnings";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuth, loading: authLoading } = useAuthContext();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sectionTab, setSectionTab] = useState<SectionTab>("bookings");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuth || user?.role !== "business") {
      router.replace(isAuth ? "/reservations" : "/teachers");
    }
  }, [isAuth, user, authLoading, router]);

  useEffect(() => {
    if (!isAuth || user?.role !== "business") return;
    api
      .get("/bookings")
      .then(({ data }) => {
        setBookings(data.bookings);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuth, user]);

  const handleChange = (updated: Booking) =>
    setBookings((prev) =>
      prev.map((b) => (b._id === updated._id ? updated : b)),
    );

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

  if (authLoading || (!isAuth && !authLoading)) return null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <div className={styles.sectionTabs}>
          <button
            className={`${styles.sectionTab} ${sectionTab === "bookings" ? styles.sectionTabActive : ""}`}
            onClick={() => setSectionTab("bookings")}
          >
            Bookings
          </button>
          <button
            className={`${styles.sectionTab} ${sectionTab === "earnings" ? styles.sectionTabActive : ""}`}
            onClick={() => setSectionTab("earnings")}
          >
            Earnings
          </button>
        </div>
      </div>

      {sectionTab === "earnings" ? (
        <EarningsPanel />
      ) : (
        <>
          <div className={styles.statsBar}>
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
                className={`${styles.statCard} ${filter === f ? styles.statCardActive : ""}`}
                onClick={() => setFilter(f)}
              >
                <span className={styles.statNum}>{counts[f]}</span>
                <span className={styles.statLabel}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}>Loading bookings…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              No {filter === "all" ? "" : filter} bookings yet.
            </div>
          ) : (
            <div className={styles.list}>
              {filtered.map((b) => (
                <DashboardBookingCard
                  key={b._id}
                  booking={b}
                  onChange={handleChange}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
