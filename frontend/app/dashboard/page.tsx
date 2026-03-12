"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Booking } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import DashboardBookingCard from "@/components/DashboardBookingCard/DashboardBookingCard";
import SkeletonCard from "@/components/SkeletonCard/SkeletonCard";
import api from "@/lib/api";
import styles from "./page.module.css";

type FilterTab = "all" | "pending" | "confirmed" | "cancelled";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuth, loading, user } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<FilterTab>("all");

  // Redirect non-business users
  useEffect(() => {
    if (!loading) {
      if (!isAuth) router.replace("/teachers");
      else if (user?.role !== "business") router.replace("/reservations");
    }
  }, [loading, isAuth, user, router]);

  useEffect(() => {
    if (!isAuth || user?.role !== "business") return;
    api
      .get("/bookings")
      .then(({ data }) => setBookings(data.bookings))
      .catch(() => setBookings([]))
      .finally(() => setFetching(false));
  }, [isAuth, user]);

  const handleUpdate = (updated: Booking) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updated._id ? updated : b)),
    );
  };

  const filtered =
    tab === "all" ? bookings : bookings.filter((b) => b.teacherStatus === tab);

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.teacherStatus === "pending").length,
    confirmed: bookings.filter((b) => b.teacherStatus === "confirmed").length,
    cancelled: bookings.filter((b) => b.teacherStatus === "cancelled").length,
  };

  if (loading || !isAuth || user?.role !== "business") return null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Lesson Dashboard</h1>
          <p className={styles.subheading}>
            Manage booking requests from your students
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{counts.pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>{counts.confirmed}</span>
            <span className={styles.statLabel}>Confirmed</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>{counts.all}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.tabs}>
        {(["all", "pending", "confirmed", "cancelled"] as FilterTab[]).map(
          (t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className={styles.tabCount}>{counts[t]}</span>
            </button>
          ),
        )}
      </div>

      {fetching ? (
        <div className={styles.list}>
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <svg
            className={styles.emptyIcon}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use
              href="/sprite.svg#icon-calendar-svg"
              xlinkHref="/sprite.svg#icon-calendar-svg"
            />
          </svg>
          <p className={styles.emptyTitle}>
            {tab === "all" ? "No bookings yet" : `No ${tab} bookings`}
          </p>
          <p className={styles.emptyText}>
            {tab === "all"
              ? "Students will appear here once they book a lesson with you."
              : `No bookings with "${tab}" status.`}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((b) => (
            <DashboardBookingCard
              key={b._id}
              booking={b}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
