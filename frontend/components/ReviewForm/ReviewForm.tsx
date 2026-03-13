"use client";
import { useState } from "react";
import { Booking } from "@/types";
import api from "@/lib/api";
import styles from "./ReviewForm.module.css";

interface Props {
  booking: Booking;
  onReviewed: () => void;
  onClose: () => void;
}

export default function ReviewForm({ booking, onReviewed, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const teacherName = (() => {
    const ta = booking.teacherAd;
    if (ta && typeof ta === "object") return `${ta.name} ${ta.surname}`;
    const t = booking.teacher;
    if (t && typeof t === "object") return `${t.name} ${t.surname}`;
    return "the teacher";
  })();

  const handleSubmit = async () => {
    setError("");
    if (rating === 0) {
      setError("Please select a rating (1–5 stars).");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    try {
      setSaving(true);
      await api.post(`/bookings/${booking._id}/review`, {
        rating,
        comment: comment.trim(),
      });
      onReviewed();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Leave a Review</h2>
      <p className={styles.sub}>
        Share your experience learning with <strong>{teacherName}</strong>. Your
        feedback helps other students choose the right teacher.
      </p>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.starsLabel}>Your rating</div>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${star <= (hover || rating) ? styles.starFilled : ""}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${star} star`}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className={styles.ratingText}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Your comment *</label>
        <textarea
          className={styles.textarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe your experience — what was great, what could be improved…"
          rows={5}
          maxLength={1000}
        />
        <span className={styles.charCount}>{comment.length}/1000</span>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Submitting…" : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
