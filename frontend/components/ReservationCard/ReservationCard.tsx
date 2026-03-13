"use client";
import { useState } from "react";
import { Booking, TeacherAd, Teacher } from "@/types";
import Modal from "@/components/Modal/Modal";
import ReviewForm from "@/components/ReviewForm/ReviewForm";
import api from "@/lib/api";
import styles from "./ReservationCard.module.css";

const REASONS = [
  "Career and business",
  "Lesson for kids",
  "Living abroad",
  "Exams and coursework",
  "Culture, travel or hobby",
];

interface Props {
  booking: Booking;
  onChange: (updated: Booking) => void;
  onRemove: (id: string) => void;
}

function getTeacher(b: Booking): {
  name: string;
  surname: string;
  avatar_url?: string;
  price_per_hour?: number;
} | null {
  if (b.teacherAd && typeof b.teacherAd === "object")
    return b.teacherAd as TeacherAd;
  if (b.teacher && typeof b.teacher === "object") return b.teacher as Teacher;
  return null;
}

export default function ReservationCard({
  booking,
  onChange,
  onRemove,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  const [reason, setReason] = useState(booking.reason);
  const [fullName, setFullName] = useState(booking.fullName);
  const [email, setEmail] = useState(booking.email);
  const [phone, setPhone] = useState(booking.phone);
  const [dateVal, setDateVal] = useState(
    booking.scheduledAt ? booking.scheduledAt.slice(0, 10) : "",
  );
  const [timeVal, setTimeVal] = useState(
    booking.scheduledAt ? booking.scheduledAt.slice(11, 16) : "",
  );

  const teacher = getTeacher(booking);
  const status = booking.teacherStatus;
  const isPending = status === "pending";
  const isConfirmed = status === "confirmed";
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";

  const handleSave = async () => {
    setError("");
    try {
      setSaving(true);
      const scheduledAt = dateVal
        ? `${dateVal}T${timeVal || "00:00"}:00.000Z`
        : undefined;
      const { data } = await api.patch(`/bookings/${booking._id}`, {
        reason,
        fullName,
        email,
        phone,
        ...(scheduledAt ? { scheduledAt } : {}),
      });
      onChange(data.booking);
      setEditing(false);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this booking?")) return;
    try {
      const { data } = await api.delete(`/bookings/${booking._id}`);
      onChange(data.booking);
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const statusConfig = {
    pending: { label: "Pending", cls: styles.statusPending },
    confirmed: { label: "Confirmed", cls: styles.statusConfirmed },
    completed: { label: "Completed", cls: styles.statusCompleted },
    cancelled: { label: "Cancelled", cls: styles.statusCancelled },
  }[status];

  return (
    <>
      <div className={styles.card}>
        <div className={styles.inner}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarRing}>
              {teacher?.avatar_url ? (
                <img
                  src={teacher.avatar_url}
                  alt={teacher.name}
                  className={styles.avatarImg}
                />
              ) : (
                <span className={styles.avatarFallback}>
                  {teacher?.name?.[0] ?? "?"}
                </span>
              )}
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.topRow}>
              <div>
                <div className={styles.categoryLabel}>Languages</div>
                <h3 className={styles.name}>
                  {teacher ? `${teacher.name} ${teacher.surname}` : "Teacher"}
                </h3>
              </div>
              <span className={`${styles.statusBadge} ${statusConfig.cls}`}>
                {statusConfig.label}
              </span>
            </div>

            {booking.scheduledAt && (
              <div className={styles.timeBadge}>
                🗓 {new Date(booking.scheduledAt).toLocaleString()}
              </div>
            )}

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Reason: </span>
              <span className={styles.infoValue}>{booking.reason}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Contact: </span>
              <span className={styles.infoValue}>
                {booking.fullName} · {booking.email} · {booking.phone}
              </span>
            </div>

            {booking.teacherMessage && (
              <div
                className={`${styles.teacherMsg} ${isConfirmed ? styles.teacherMsgConfirmed : isCompleted ? styles.teacherMsgCompleted : styles.teacherMsgCancelled}`}
              >
                <strong>Teacher's note: </strong>
                {booking.teacherMessage}
              </div>
            )}

            {isCancelled && booking.cancelledBy && (
              <div className={styles.cancelledBy}>
                Cancelled by{" "}
                {booking.cancelledBy === "teacher" ? "teacher" : "you"}
              </div>
            )}

            {isCompleted && booking.earnedAmount > 0 && (
              <div className={styles.completedNote}>
                💳 Lesson fee: <strong>${booking.earnedAmount}</strong> credited
                to the teacher.
              </div>
            )}

            <div className={styles.actions}>
              {isPending && (
                <>
                  <button
                    className={styles.editBtn}
                    onClick={() => setEditing((p) => !p)}
                  >
                    {editing ? "Close" : "Edit"}
                  </button>
                  <button className={styles.cancelBtn} onClick={handleCancel}>
                    Cancel Booking
                  </button>
                </>
              )}

              {isCompleted && !booking.reviewLeft && (
                <button
                  className={styles.reviewBtn}
                  onClick={() => setReviewOpen(true)}
                >
                  ⭐ Leave a Review
                </button>
              )}

              {isCompleted && booking.reviewLeft && (
                <span className={styles.reviewedBadge}>
                  ✅ Review submitted
                </span>
              )}
            </div>

            {editing && isPending && (
              <div className={styles.editPanel}>
                <div className={styles.editTitle}>Edit Booking</div>
                {error && <div className={styles.editError}>{error}</div>}

                <div className={styles.editGrid}>
                  <div>
                    <label className={styles.fieldLabel}>Date</label>
                    <input
                      type="date"
                      className={styles.fieldInput}
                      value={dateVal}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setDateVal(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Time (optional)</label>
                    <input
                      type="time"
                      className={styles.fieldInput}
                      value={timeVal}
                      onChange={(e) => setTimeVal(e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <label className={styles.fieldLabel}>Reason</label>
                    <select
                      className={styles.reasonSelect}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    >
                      {REASONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Full Name</label>
                    <input
                      className={styles.fieldInput}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Email</label>
                    <input
                      className={styles.fieldInput}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <label className={styles.fieldLabel}>Phone</label>
                    <input
                      className={styles.fieldInput}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.editActions}>
                  <button
                    className={styles.discardBtn}
                    onClick={() => setEditing(false)}
                  >
                    Discard
                  </button>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)}>
        <ReviewForm
          booking={booking}
          onReviewed={() => {
            setReviewOpen(false);
            onChange({ ...booking, reviewLeft: true });
          }}
          onClose={() => setReviewOpen(false)}
        />
      </Modal>
    </>
  );
}
