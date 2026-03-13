"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { profileSchema } from "@/lib/validation";
import api from "@/lib/api";
import { User, TeacherAd } from "@/types";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import TeacherAdForm from "@/components/TeacherAdForm/TeacherAdForm";
import styles from "./ProfileModal.module.css";

const ALL_LANGUAGES = [
  "English",
  "French",
  "German",
  "Spanish",
  "Italian",
  "Mandarin Chinese",
  "Korean",
  "Vietnamese",
  "Japanese",
];

interface FormData {
  name: string;
  email: string;
  languages?: string[];
  lesson_info?: string;
  conditions?: string;
  description?: string;
}

interface Props {
  user: User;
  onClose: () => void;
  onUpdate: (u: User) => void;
  onDelete: () => void;
}

type Tab = "edit" | "ad" | "danger";

export default function ProfileModal({
  user,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const isBusiness = user.role === "business";
  const [tab, setTab] = useState<Tab>("edit");
  const [langs, setLangs] = useState<string[]>(user.languages || []);
  const [serverError, setServerError] = useState("");

  const [myAd, setMyAd] = useState<TeacherAd | null>(null);
  const [adLoading, setAdLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      name: user.name,
      email: user.email,
      lesson_info: user.lesson_info || "",
      conditions: user.conditions || "",
      description: user.description || "",
    },
  });

  useEffect(() => {
    if (tab === "ad" && isBusiness && myAd === null && !adLoading) {
      setAdLoading(true);
      api
        .get("/teacher-ads/my/ad")
        .then(({ data }) => setMyAd(data.ad))
        .catch(() => setMyAd(null))
        .finally(() => setAdLoading(false));
    }
  }, [tab, isBusiness]); // eslint-disable-line

  const toggleLang = (lang: string) => {
    setLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const onSave = async (data: FormData) => {
    try {
      setServerError("");
      const { data: res } = await api.put("/users/me", {
        ...data,
        languages: langs,
      });
      onUpdate(res.user);
      onClose();
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete("/users/me");
      onDelete();
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <UserAvatar user={user} size={60} />
        <div className={styles.headerInfo}>
          <h2 className={styles.headerName}>{user.name}</h2>
          <p className={styles.headerMeta}>
            {user.email} ·{" "}
            <span
              className={`${styles.headerRole} ${
                user.role === "business"
                  ? styles.roleBusiness
                  : styles.roleClient
              }`}
            >
              {user.role === "business" ? "Teacher" : "Student"}
            </span>
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "edit" ? styles.tabActive : ""}`}
          onClick={() => setTab("edit")}
        >
          Edit Profile
        </button>
        {isBusiness && (
          <button
            className={`${styles.tab} ${tab === "ad" ? styles.tabActive : ""}`}
            onClick={() => setTab("ad")}
          >
            My Teacher Ad
          </button>
        )}
        <button
          className={`${styles.tab} ${styles.tabDanger} ${tab === "danger" ? styles.tabDangerActive : ""}`}
          onClick={() => setTab("danger")}
        >
          Danger Zone
        </button>
      </div>

      {serverError && (
        <p style={{ color: "var(--red)", fontSize: 12, marginBottom: 12 }}>
          {serverError}
        </p>
      )}

      {tab === "edit" && (
        <form onSubmit={handleSubmit(onSave)} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              {...register("name")}
              className={styles.input}
              placeholder="Your name"
            />
            {errors.name && (
              <p style={{ color: "var(--red)", fontSize: 11, marginTop: 4 }}>
                {errors.name.message}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              {...register("email")}
              type="email"
              className={styles.input}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p style={{ color: "var(--red)", fontSize: 11, marginTop: 4 }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {isBusiness && (
            <div className={styles.field}>
              <label className={styles.label}>Languages You Teach</label>
              <div className={styles.langPicker}>
                {ALL_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`${styles.langBtn} ${langs.includes(lang) ? styles.langBtnActive : ""}`}
                    onClick={() => toggleLang(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isBusiness && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Lesson Info</label>
                <input
                  {...register("lesson_info")}
                  className={styles.input}
                  placeholder="What lessons are you looking for?"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Conditions</label>
                <input
                  {...register("conditions")}
                  className={styles.input}
                  placeholder="Any specific requirements?"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>About You</label>
                <textarea
                  {...register("description")}
                  className={styles.textarea}
                  placeholder="Tell teachers about yourself…"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className={styles.saveBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </button>
        </form>
      )}

      {tab === "ad" && isBusiness && (
        <div>
          {adLoading ? (
            <div className={styles.adLoading}>Loading your ad…</div>
          ) : (
            <TeacherAdForm
              existingAd={myAd}
              onSaved={(ad) => setMyAd(ad)}
              onDeleted={() => setMyAd(null)}
            />
          )}
        </div>
      )}

      {tab === "danger" && (
        <div className={styles.dangerCenter}>
          <div className={styles.dangerIcon}>
            <svg className={styles.iconWarning} aria-hidden="true">
              <use href="/sprite.svg#icon-warning" />
            </svg>
          </div>
          <h3 className={styles.dangerTitle}>Delete Account</h3>
          <p className={styles.dangerText}>
            This will permanently delete your account and all associated data.
            This action cannot be undone.
          </p>
          <div className={styles.dangerWarning}>
            Deleting your account will remove all bookings, favorites, and
            profile data.
          </div>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            Yes, Delete My Account
          </button>
        </div>
      )}
    </div>
  );
}
