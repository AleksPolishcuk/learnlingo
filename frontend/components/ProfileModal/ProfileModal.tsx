"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { profileSchema } from "@/lib/validation";
import api from "@/lib/api";
import { User, TeacherAd } from "@/types";
import AvatarUpload from "@/components/AvatarUpload/AvatarUpload";
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
  surname: string;
  email: string;
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

type Tab = "edit" | "ads" | "danger";

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

  const [ads, setAds] = useState<TeacherAd[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [editingAd, setEditingAd] = useState<TeacherAd | "new" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      name: user.name,
      surname: user.surname,
      email: user.email,
      lesson_info: user.lesson_info || "",
      conditions: user.conditions || "",
      description: user.description || "",
    },
  });

  const fetchAds = useCallback(async () => {
    setAdsLoading(true);
    try {
      const { data } = await api.get("/teacher-ads/my/ads");
      setAds(data.ads ?? []);
    } catch {
      /* ignore */
    } finally {
      setAdsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "ads" && isBusiness) fetchAds();
  }, [tab]); // eslint-disable-line

  const toggleLang = (lang: string) =>
    setLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );

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

  const handleAvatarUploaded = (url: string) =>
    onUpdate({ ...user, avatar_url: url });

  const handleToggleActive = async (ad: TeacherAd) => {
    try {
      const { data } = await api.patch(`/teacher-ads/${ad._id}/toggle`);
      setAds((prev) => prev.map((a) => (a._id === ad._id ? data.ad : a)));
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleAdSaved = (saved: TeacherAd) => {
    setAds((prev) => {
      const idx = prev.findIndex((a) => a._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setEditingAd(null);
  };

  const handleAdDeleted = (id: string) => {
    setAds((prev) => prev.filter((a) => a._id !== id));
    setEditingAd(null);
  };

  if (tab === "ads" && editingAd !== null) {
    const existing = editingAd === "new" ? null : editingAd;
    return (
      <div>
        <TeacherAdForm
          existingAd={existing}
          prefillName={user.name}
          prefillSurname={user.surname}
          prefillAvatar={user.avatar_url}
          onSaved={handleAdSaved}
          onDeleted={existing ? () => handleAdDeleted(existing._id) : undefined}
          onCancel={() => setEditingAd(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <AvatarUpload
          currentUrl={user.avatar_url}
          name={user.name}
          endpoint="/upload/avatar"
          onUploaded={handleAvatarUploaded}
          size={64}
        />
        <div className={styles.headerInfo}>
          <h2 className={styles.headerName}>
            {user.name} {user.surname}
          </h2>
          <p className={styles.headerMeta}>
            {user.email} ·{" "}
            <span
              className={`${styles.headerRole} ${isBusiness ? styles.roleBusiness : styles.roleClient}`}
            >
              {isBusiness ? "Teacher" : "Student"}
            </span>
          </p>
          <p className={styles.avatarHint}>Click photo to change</p>
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
            className={`${styles.tab} ${tab === "ads" ? styles.tabActive : ""}`}
            onClick={() => setTab("ads")}
          >
            My Ads
          </button>
        )}

        <button
          className={`${styles.tab} ${styles.tabDanger} ${tab === "danger" ? styles.tabDangerActive : ""}`}
          onClick={() => setTab("danger")}
        >
          Danger Zone
        </button>
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      {tab === "edit" && (
        <form onSubmit={handleSubmit(onSave)} noValidate>
          <div className={styles.nameRow}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input
                {...register("name")}
                className={styles.input}
                placeholder="Jane"
              />
              {errors.name && (
                <p className={styles.fieldError}>{errors.name.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input
                {...register("surname")}
                className={styles.input}
                placeholder="Smith"
              />
              {errors.surname && (
                <p className={styles.fieldError}>{errors.surname.message}</p>
              )}
            </div>
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
              <p className={styles.fieldError}>{errors.email.message}</p>
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
                  placeholder="Tell students about yourself…"
                />
              </div>
            </div>
          )}

          {!isBusiness && (
            <>
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

      {tab === "ads" && isBusiness && (
        <div className={styles.adsSection}>
          <div className={styles.adsHeader}>
            <span className={styles.adsCount}>
              {ads.length} ad{ads.length !== 1 ? "s" : ""}
            </span>
            <button
              className={styles.newAdBtn}
              onClick={() => setEditingAd("new")}
            >
              + New Ad
            </button>
          </div>

          {adsLoading ? (
            <div className={styles.adLoading}>Loading your ads…</div>
          ) : ads.length === 0 ? (
            <div className={styles.adsEmpty}>
              <p>You have no ads yet.</p>
              <button
                className={styles.newAdBtn}
                onClick={() => setEditingAd("new")}
              >
                Create your first ad
              </button>
            </div>
          ) : (
            <div className={styles.adsList}>
              {ads.map((ad) => (
                <div
                  key={ad._id}
                  className={`${styles.adCard} ${!ad.isActive ? styles.adCardInactive : ""}`}
                >
                  <div className={styles.adAvatar}>
                    {ad.avatar_url ? (
                      <img
                        src={ad.avatar_url}
                        alt={ad.name}
                        className={styles.adAvatarImg}
                      />
                    ) : (
                      <span className={styles.adAvatarFallback}>
                        {ad.name?.[0] ?? "?"}
                      </span>
                    )}
                  </div>
                  <div className={styles.adInfo}>
                    <div className={styles.adName}>
                      {ad.name} {ad.surname}
                      {!ad.isActive && (
                        <span className={styles.inactiveBadge}>Inactive</span>
                      )}
                    </div>
                    <div className={styles.adMeta}>
                      {ad.languages.join(", ")} · ${ad.price_per_hour}/hr · ⭐{" "}
                      {ad.rating.toFixed(1)}
                    </div>
                    <div className={styles.adStats}>
                      {ad.lessons_done} lessons · ${ad.total_earned} earned
                    </div>
                  </div>
                  <div className={styles.adActions}>
                    <button
                      className={styles.adEditBtn}
                      onClick={() => setEditingAd(ad)}
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.adToggleBtn} ${ad.isActive ? styles.adToggleDeactivate : styles.adToggleActivate}`}
                      onClick={() => handleToggleActive(ad)}
                    >
                      {ad.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
