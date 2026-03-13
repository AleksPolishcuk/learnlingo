"use client";
import { useState } from "react";
import { Booking } from "@/types";
import api from "@/lib/api";
import styles from "./DashboardBookingCard.module.css";

interface Props {
  booking: Booking;
  onChange: (updated: Booking) => void;
}

type Action = "confirm" | "cancel" | "complete" | null;

export default function DashboardBookingCard({ booking, onChange }: Props) {
  const [action, setAction] = useState<Action>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const student = typeof booking.user === "object" ? booking.user : null;
  const teacher =
    typeof booking.teacherAd === "object" ? booking.teacherAd : null;
  const status = booking.teacherStatus;

  const isPending = status === "pending";
  const isConfirmed = status === "confirmed";

  const handleSubmit = async () => {
    if (!action) return;
    setError("");
    try {
      setSaving(true);
      const url =
        action === "confirm"
          ? `/bookings/${booking._id}/confirm`
          : action === "cancel"
            ? `/bookings/${booking._id}/cancel`
            : `/bookings/${booking._id}/complete`;

      const { data } = await api.patch(url, { message });
      onChange(data.booking);
      setAction(null);
      setMessage("");
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const statusBorderCls =
    status === "pending"
      ? styles.borderPending
      : status === "confirmed"
        ? styles.borderConfirmed
        : status === "completed"
          ? styles.borderCompleted
          : styles.borderCancelled;

  const statusLabel = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  }[status];

  const statusBadgeCls = {
    pending: styles.badgePending,
    confirmed: styles.badgeConfirmed,
    completed: styles.badgeCompleted,
    cancelled: styles.badgeCancelled,
  }[status];

  return (
    <div className={`${styles.card} ${statusBorderCls}`}>
      <div className={styles.header}>
        <div className={styles.studentInfo}>
          <div className={styles.studentName}>
            {student?.name ?? booking.fullName}
          </div>
          <div className={styles.studentEmail}>
            {student?.email ?? booking.email}
          </div>
        </div>
        <span className={`${styles.badge} ${statusBadgeCls}`}>
          {statusLabel}
        </span>
      </div>

      <div className={styles.details}>
        {teacher && (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Ad</span>
            <span className={styles.detailValue}>
              {teacher.name} {teacher.surname}
            </span>
          </div>
        )}
        {booking.scheduledAt && (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Scheduled</span>
            <span className={styles.detailValue}>
              {new Date(booking.scheduledAt).toLocaleString()}
            </span>
          </div>
        )}
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Reason</span>
          <span className={styles.detailValue}>{booking.reason}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Phone</span>
          <span className={styles.detailValue}>{booking.phone}</span>
        </div>
        {status === "completed" && booking.earnedAmount > 0 && (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Earned</span>
            <span className={`${styles.detailValue} ${styles.earnedValue}`}>
              💰 ${booking.earnedAmount}
            </span>
          </div>
        )}
        {booking.reviewLeft && (
          <div className={styles.reviewNote}>⭐ Student left a review</div>
        )}
      </div>

      {(isPending || isConfirmed) && !action && (
        <div className={styles.actions}>
          {isPending && (
            <button
              className={styles.confirmBtn}
              onClick={() => setAction("confirm")}
            >
              Confirm
            </button>
          )}
          {isConfirmed && (
            <button
              className={styles.completeBtn}
              onClick={() => setAction("complete")}
            >
              Mark Complete
            </button>
          )}
          {(isPending || isConfirmed) && (
            <button
              className={styles.cancelBtn}
              onClick={() => setAction("cancel")}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {action && (
        <div className={styles.actionPanel}>
          {error && <div className={styles.actionError}>{error}</div>}
          <label className={styles.msgLabel}>
            {action === "confirm"
              ? "Message to student (optional)"
              : action === "complete"
                ? "Note to student (optional)"
                : "Reason for cancellation (optional)"}
          </label>
          <textarea
            className={styles.msgArea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder={
              action === "confirm"
                ? "e.g. Looking forward to the lesson!"
                : action === "complete"
                  ? "e.g. Great lesson today!"
                  : "e.g. Unavailable at this time…"
            }
          />
          <div className={styles.actionBtns}>
            <button
              className={styles.discardBtn}
              onClick={() => {
                setAction(null);
                setError("");
              }}
            >
              Back
            </button>
            <button
              className={
                action === "cancel"
                  ? styles.confirmCancelBtn
                  : styles.confirmActionBtn
              }
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : action === "confirm"
                  ? "Confirm Booking"
                  : action === "complete"
                    ? "Complete Lesson"
                    : "Cancel Booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
