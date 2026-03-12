"use client";
import { useState } from "react";
import { Booking } from "@/types";
import api from "@/lib/api";
import styles from "./DashboardBookingCard.module.css";

interface Props {
  booking: Booking;
  onUpdate: (updated: Booking) => void;
}

export default function DashboardBookingCard({ booking: b, onUpdate }: Props) {
  const [message, setMessage] = useState("");
  const [showMsgBox, setShowMsgBox] = useState<"confirm" | "cancel" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPending = b.teacherStatus === "pending";
  const isConfirmed = b.teacherStatus === "confirmed";
  const isCancelled = b.teacherStatus === "cancelled";

  const studentName =
    typeof b.user === "object" && b.user !== null
      ? (b.user as any).name
      : b.fullName;

  const scheduledDisplay = b.scheduledAt
    ? new Date(b.scheduledAt).toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Time not specified";

  const bookedOn = new Date(b.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleAction = async (action: "confirm" | "cancel") => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.patch(`/bookings/${b._id}/${action}`, {
        message: message.trim(),
      });
      onUpdate(data.booking);
      setShowMsgBox(null);
      setMessage("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${styles.card} ${isCancelled ? styles.cardCancelled : isConfirmed ? styles.cardConfirmed : ""}`}
    >
      <div className={styles.header}>
        <div className={styles.studentInfo}>
          <div className={styles.avatar}>{b.fullName[0]?.toUpperCase()}</div>
          <div>
            <div className={styles.studentName}>{b.fullName}</div>
            <div className={styles.studentMeta}>
              {b.email} · {b.phone}
            </div>
          </div>
        </div>

        <span
          className={`${styles.badge} ${
            isConfirmed
              ? styles.badgeConfirmed
              : isCancelled
                ? styles.badgeCancelled
                : styles.badgePending
          }`}
        >
          {isConfirmed ? "Confirmed ✓" : isCancelled ? "Cancelled" : "Pending"}
        </span>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <svg className={styles.icon} aria-hidden="true">
            <use href="/sprite.svg#icon-Iconclock" />
          </svg>
          <span>{scheduledDisplay}</span>
        </div>
        <div className={styles.detailItem}>
          <svg className={styles.icon} aria-hidden="true">
            <use href="/sprite.svg#icon-calendar" />
          </svg>
          <span>Booked on {bookedOn}</span>
        </div>
        <div className={styles.detailItem}>
          <strong>Goal:</strong>&nbsp;{b.reason}
        </div>
      </div>

      {/* Previous teacher message */}
      {b.teacherMessage && (
        <div
          className={`${styles.prevMsg} ${isConfirmed ? styles.prevMsgGreen : styles.prevMsgRed}`}
        >
          Your message: <em>{b.teacherMessage}</em>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {/* Actions only when pending */}
      {isPending && (
        <>
          {!showMsgBox ? (
            <div className={styles.actions}>
              <button
                className={styles.confirmBtn}
                onClick={() => setShowMsgBox("confirm")}
              >
                Confirm lesson
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowMsgBox("cancel")}
              >
                Cancel lesson
              </button>
            </div>
          ) : (
            <div className={styles.msgBox}>
              <label className={styles.msgLabel}>
                Optional message to student
              </label>
              <textarea
                className={styles.msgTextarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  showMsgBox === "confirm"
                    ? "Looking forward to our lesson!"
                    : "I need to reschedule, sorry for the inconvenience."
                }
                rows={2}
              />
              <div className={styles.msgActions}>
                <button
                  className={styles.discardBtn}
                  onClick={() => {
                    setShowMsgBox(null);
                    setMessage("");
                  }}
                >
                  Back
                </button>
                <button
                  className={
                    showMsgBox === "confirm"
                      ? styles.confirmBtn
                      : styles.cancelBtn
                  }
                  onClick={() => handleAction(showMsgBox)}
                  disabled={loading}
                >
                  {loading
                    ? "Saving…"
                    : showMsgBox === "confirm"
                      ? "Confirm"
                      : "Cancel lesson"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
