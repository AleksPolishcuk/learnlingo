"use client";
import { useState } from "react";
import { Booking } from "@/types";
import TimePicker from "@/components/TimePicker/TimePicker";
import api from "@/lib/api";
import styles from "./ReservationCard.module.css";

const REASONS = [
  "Career and business",
  "Lesson for kids",
  "Living abroad",
  "Exams and coursework",
  "Culture, travel or hobby",
];

function timeFromISO(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface Props {
  booking: Booking;
  onCancel: (id: string) => void;
  onUpdate: (updated: Booking) => void;
}

export default function ReservationCard({
  booking: b,
  onCancel,
  onUpdate,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const [fullName, setFullName] = useState(b.fullName);
  const [email, setEmail] = useState(b.email);
  const [phone, setPhone] = useState(b.phone);
  const [reason, setReason] = useState(b.reason);
  const [time, setTime] = useState(timeFromISO(b.scheduledAt));

  const handleSave = async () => {
    try {
      setSaving(true);
      let scheduledAt: string | undefined;
      if (time) {
        const [hh, mm] = time.split(":").map(Number);
        const d = new Date(b.scheduledAt ?? Date.now());
        d.setHours(hh, mm, 0, 0);
        scheduledAt = d.toISOString();
      }
      const { data } = await api.patch(`/bookings/${b._id}`, {
        fullName,
        email,
        phone,
        reason,
        scheduledAt,
      });
      onUpdate(data.booking);
      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setFullName(b.fullName);
    setEmail(b.email);
    setPhone(b.phone);
    setReason(b.reason);
    setTime(timeFromISO(b.scheduledAt));
    setEditing(false);
  };

  const bookedDate = new Date(b.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeDisplay = timeFromISO(b.scheduledAt);

  return (
    <div className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatarRing}>
            {b.teacher?.avatar_url && !imgErr ? (
              <img
                src={b.teacher.avatar_url}
                alt={b.teacher?.name ?? ""}
                className={styles.avatarImg}
                onError={() => setImgErr(true)}
              />
            ) : (
              <span className={styles.avatarFallback}>
                {b.teacher?.name?.[0] ?? "?"}
              </span>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.topRow}>
            <div>
              <div className={styles.categoryLabel}>Reservation</div>
              <h3 className={styles.name}>
                {b.teacher
                  ? `${b.teacher.name} ${b.teacher.surname}`
                  : "Unknown Teacher"}
              </h3>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <svg className={styles.iconClock} aria-hidden="true">
                  <use href="/sprite.svg#icon-calendar" />
                </svg>
                {bookedDate}
              </span>

              <span
                className={`${styles.statusBadge} ${
                  b.status === "active"
                    ? styles.statusActive
                    : styles.statusCancelled
                }`}
              >
                {b.status === "active" ? "Active" : "Cancelled"}
              </span>
            </div>
          </div>

          <p className={styles.infoRow}>
            <span className={styles.infoLabel}>Goal: </span>
            <span className={styles.infoValue}>{b.reason}</span>
          </p>
          <p className={styles.infoRow}>
            <span className={styles.infoLabel}>Contact: </span>
            <span className={styles.infoValue}>
              Name: {b.fullName} · Email: {b.email} · Phone: {b.phone}
            </span>
          </p>

          {timeDisplay && (
            <span className={styles.timeBadge}>
              <svg className={styles.iconClock} aria-hidden="true">
                <use href="/sprite.svg#icon-Iconclock" />
              </svg>
              {timeDisplay}
            </span>
          )}

          <div className={styles.actions}>
            <button
              className={styles.editBtn}
              onClick={() => setEditing((p) => !p)}
            >
              {editing ? "Close editor" : " Edit"}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => onCancel(b._id)}
            >
              Cancel
            </button>
          </div>

          {editing && (
            <div className={styles.editPanel}>
              <div className={styles.editTitle}>Edit reservation</div>

              <div className={styles.editGrid}>
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
                    type="email"
                    className={styles.fieldInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className={styles.fieldLabel}>Phone</label>
                  <input
                    className={styles.fieldInput}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className={styles.fieldLabel}>Meeting Time</label>
                  <TimePicker value={time} onChange={setTime} />
                </div>

                <div className={styles.fieldFull}>
                  <label className={styles.fieldLabel}>Reason</label>
                  <select
                    className={styles.reasonSelect}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    {REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.editActions}>
                <button className={styles.discardBtn} onClick={discard}>
                  Discard
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
