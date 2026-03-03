"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { bookingSchema } from "@/lib/validation";
import api from "@/lib/api";
import { Teacher } from "@/types";
import TimePicker from "@/components/TimePicker/TimePicker";
import styles from "./BookingForm.module.css";

const REASONS = [
  "Career and business",
  "Lesson for kids",
  "Living abroad",
  "Exams and coursework",
  "Culture, travel or hobby",
];

interface FormData {
  reason: string;
  fullName: string;
  email: string;
  phone: string;
}
interface Props {
  teacher: Teacher;
  onClose: () => void;
  onBooked: () => void;
}

export default function BookingForm({ teacher, onClose, onBooked }: Props) {
  const [reason, setReason] = useState(REASONS[0]);
  const [time, setTime] = useState("");
  const [serverError, setServerError] = useState("");
  const [imgErr, setImgErr] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(bookingSchema) as any,
    defaultValues: { reason: REASONS[0] },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError("");

      let scheduledAt: string | undefined;
      if (time) {
        const [hh, mm] = time.split(":").map(Number);
        const d = new Date();
        d.setHours(hh, mm, 0, 0);
        scheduledAt = d.toISOString();
      }

      await api.post("/bookings", {
        ...data,
        reason,
        teacherId: teacher._id,
        scheduledAt,
      });

      onBooked();
      onClose();
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <div>
      <h2 className={styles.title}>Book trial lesson</h2>
      <p className={styles.subtitle}>
        Our tutor will assess your level, discuss your goals, and tailor the
        lesson to your needs.
      </p>

      <div className={styles.teacherCard}>
        <div className={styles.teacherAvatarWrap}>
          {!imgErr ? (
            <img
              src={teacher.avatar_url}
              alt={teacher.name}
              className={styles.teacherAvatar}
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className={styles.teacherAvatarFallback}>
              {teacher.name[0]}
            </div>
          )}
        </div>
        <div>
          <div className={styles.teacherLabel}>Your teacher</div>
          <div className={styles.teacherName}>
            {teacher.name} {teacher.surname}
          </div>
        </div>
      </div>

      <p className={styles.reasonTitle}>
        What is your main reason for learning?
      </p>
      <div className={styles.reasons}>
        {REASONS.map((r) => (
          <label
            key={r}
            className={styles.reasonLabel}
            onClick={() => setReason(r)}
          >
            <div
              className={`${styles.radio} ${reason === r ? styles.radioActive : ""}`}
            />
            {r}
          </label>
        ))}
      </div>

      {serverError && (
        <p className={styles.error} style={{ marginBottom: 14 }}>
          {serverError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label className={styles.label}>Meeting Time (optional)</label>
          <TimePicker value={time} onChange={setTime} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input
            {...register("fullName")}
            className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
            placeholder="John Smith"
          />
          {errors.fullName && (
            <p className={styles.error}>{errors.fullName.message}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            {...register("email")}
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className={styles.error}>{errors.email.message}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Phone Number</label>
          <input
            {...register("phone")}
            className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
            placeholder="+1 234 567 8900"
          />
          {errors.phone && (
            <p className={styles.error}>{errors.phone.message}</p>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Booking…" : "Book"}
        </button>
      </form>
    </div>
  );
}
