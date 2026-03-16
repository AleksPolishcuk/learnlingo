"use client";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuthContext } from "@/context/AuthContext";
import api from "@/lib/api";
import { Booking } from "@/types";
import { CalEvent, bookingsToEvents, buildICS } from "@/utils/calendar.Utils";
import styles from "./page.module.css";

const BigCalendar = dynamic(() => import("./widget/calendarWidget"), {
  ssr: false,
  loading: () => <div className={styles.calLoading}>Loading calendar…</div>,
});

const LESSON_DURATION = 60;

export default function CalendarPage() {
  useRoleGuard(["business"], "/");

  const { user, loading: authLoading } = useAuthContext();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month" | "day">("week");
  const [selBooking, setSelBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user || user.role !== "business") return;
    api
      .get("/bookings")
      .then(({ data }) => setBookings(data.bookings ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const events = useMemo(
    () =>
      bookingsToEvents(
        bookings.filter((b) => b.teacherStatus !== "cancelled"),
        LESSON_DURATION,
      ),
    [bookings],
  );

  const handleEventClick = (ev: CalEvent) => {
    setSelBooking(bookings.find((b) => b._id === ev.bookingId) ?? null);
  };

  const handleAction = async (action: "confirm" | "cancel" | "complete") => {
    if (!selBooking) return;
    try {
      const { data } = await api.patch(`/bookings/${selBooking._id}/${action}`);
      const updated: Booking = data.booking;
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b)),
      );
      setSelBooking(updated);
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleExport = () => {
    const blob = new Blob([buildICS(bookings, LESSON_DURATION)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "learnlingo-schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || user?.role !== "business") return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = bookings.filter(
    (b) =>
      b.scheduledAt?.slice(0, 10) === todayStr &&
      b.teacherStatus === "confirmed",
  ).length;
  const pendingCount = bookings.filter(
    (b) => b.teacherStatus === "pending",
  ).length;
  const confirmedCount = bookings.filter(
    (b) => b.teacherStatus === "confirmed",
  ).length;
  const completedCount = bookings.filter(
    (b) => b.teacherStatus === "completed",
  ).length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Schedule</h1>
        <button className={styles.exportBtn} onClick={handleExport}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.exportIcon}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export .ics
        </button>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{todayCount}</span>
          <span className={styles.statLabel}>Today</span>
        </div>

        <div className={`${styles.statCard} ${styles.legendCard}`}>
          <span className={`${styles.legendDot} ${styles.dotPending}`} />
          <span className={styles.legendLabel}>Pending</span>
          <span className={`${styles.legendDot} ${styles.dotConfirmed}`} />
          <span className={styles.legendLabel}>Confirmed</span>
          <span className={`${styles.legendDot} ${styles.dotCompleted}`} />
          <span className={styles.legendLabel}>Completed</span>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.calendarWrap}>
          {loading ? (
            <div className={styles.calLoading}>Loading your schedule…</div>
          ) : (
            <BigCalendar
              events={events}
              view={view}
              onView={setView as any}
              date={viewDate}
              onNavigate={setViewDate}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        {selBooking && (
          <aside className={styles.panel}>
            <button
              className={styles.panelClose}
              onClick={() => setSelBooking(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <BookingDetailPanel booking={selBooking} onAction={handleAction} />
          </aside>
        )}
      </div>
    </div>
  );
}

function BookingDetailPanel({
  booking,
  onAction,
}: {
  booking: Booking;
  onAction: (a: "confirm" | "cancel" | "complete") => void;
}) {
  const student =
    typeof booking.user === "object"
      ? `${booking.user.name} ${booking.user.surname}`.trim()
      : booking.fullName;

  const badgeClass: Record<string, string> = {
    pending: styles.badgePending,
    confirmed: styles.badgeConfirmed,
    completed: styles.badgeCompleted,
    cancelled: styles.badgeCancelled,
  };

  const scheduledDate = booking.scheduledAt
    ? new Date(booking.scheduledAt).toLocaleString([], {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className={styles.detailWrap}>
      <div className={styles.detailHeader}>
        <div className={styles.detailName}>{student}</div>
        <span
          className={`${styles.statusBadge} ${badgeClass[booking.teacherStatus]}`}
        >
          {booking.teacherStatus.charAt(0).toUpperCase() +
            booking.teacherStatus.slice(1)}
        </span>
      </div>

      <div className={styles.detailRows}>
        <div className={styles.detailRow}>
          <span className={styles.detailKey}>Scheduled</span>
          <span className={styles.detailVal}>{scheduledDate}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailKey}>Reason</span>
          <span className={styles.detailVal}>{booking.reason}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailKey}>Email</span>
          <span className={styles.detailVal}>{booking.email}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailKey}>Phone</span>
          <span className={styles.detailVal}>{booking.phone}</span>
        </div>
        {typeof booking.teacherAd === "object" && booking.teacherAd && (
          <div className={styles.detailRow}>
            <span className={styles.detailKey}>Ad</span>
            <span className={styles.detailVal}>
              {booking.teacherAd.name} {booking.teacherAd.surname}
            </span>
          </div>
        )}
        {booking.teacherMessage && (
          <div className={styles.detailRow}>
            <span className={styles.detailKey}>Message</span>
            <span className={styles.detailVal}>{booking.teacherMessage}</span>
          </div>
        )}
        {booking.teacherStatus === "completed" && booking.earnedAmount > 0 && (
          <div className={styles.detailRow}>
            <span className={styles.detailKey}>Earned</span>
            <span className={`${styles.detailVal} ${styles.earnedVal}`}>
              ${booking.earnedAmount}
            </span>
          </div>
        )}
      </div>

      <div className={styles.detailActions}>
        {booking.teacherStatus === "pending" && (
          <button
            className={styles.btnConfirm}
            onClick={() => onAction("confirm")}
          >
            Confirm
          </button>
        )}
        {booking.teacherStatus === "confirmed" && (
          <button
            className={styles.btnComplete}
            onClick={() => onAction("complete")}
          >
            Mark Complete
          </button>
        )}
        {(booking.teacherStatus === "pending" ||
          booking.teacherStatus === "confirmed") && (
          <button
            className={styles.btnCancel}
            onClick={() => onAction("cancel")}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
