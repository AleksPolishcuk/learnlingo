"use client";
import { useState, useEffect, useCallback } from "react";
import { TeacherAd } from "@/types";
import api from "@/lib/api";
import TeacherAdForm from "@/components/TeacherAdForm/TeacherAdForm";
import styles from "./AdManeger.module.css";

export default function AdManager() {
  const [ads, setAds] = useState<TeacherAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [error, setError] = useState("");

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/teacher-ads/my/ads");
      setAds(data.ads);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleToggle = async (ad: TeacherAd) => {
    try {
      const { data } = await api.patch(`/teacher-ads/${ad._id}/toggle`);
      setAds((prev) => prev.map((a) => (a._id === ad._id ? data.ad : a)));
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleDelete = async (ad: TeacherAd) => {
    if (
      !confirm(
        `Delete the ad "${ad.name} ${ad.surname}"? This cannot be undone.`,
      )
    )
      return;
    try {
      await api.delete(`/teacher-ads/${ad._id}`);
      setAds((prev) => prev.filter((a) => a._id !== ad._id));
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleSaved = (saved: TeacherAd) => {
    setAds((prev) => {
      const idx = prev.findIndex((a) => a._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setEditingId(null);
  };

  if (editingId !== null) {
    const existing =
      editingId === "new"
        ? null
        : (ads.find((a) => a._id === editingId) ?? null);
    return (
      <div>
        <button className={styles.backBtn} onClick={() => setEditingId(null)}>
          ← Back to my ads
        </button>
        <TeacherAdForm
          existingAd={existing}
          onSaved={handleSaved}
          onDeleted={() => {
            setAds((prev) => prev.filter((a) => a._id !== editingId));
            setEditingId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <h3 className={styles.heading}>My Teacher Ads</h3>
        <button className={styles.addBtn} onClick={() => setEditingId("new")}>
          + New Ad
        </button>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading your ads…</div>
      ) : ads.length === 0 ? (
        <div className={styles.empty}>
          <p>You have no teacher ads yet.</p>
          <button className={styles.addBtn} onClick={() => setEditingId("new")}>
            Create your first ad
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {ads.map((ad) => (
            <div
              key={ad._id}
              className={`${styles.card} ${!ad.isActive ? styles.cardInactive : ""}`}
            >
              <span
                className={`${styles.statusDot} ${ad.isActive ? styles.dotActive : styles.dotInactive}`}
              />

              <div className={styles.avatar}>
                {ad.avatar_url ? (
                  <img
                    src={ad.avatar_url}
                    alt={ad.name}
                    className={styles.avatarImg}
                  />
                ) : (
                  <span className={styles.avatarFallback}>{ad.name[0]}</span>
                )}
              </div>

              <div className={styles.info}>
                <div className={styles.adName}>
                  {ad.name} {ad.surname}
                  {!ad.isActive && (
                    <span className={styles.inactiveBadge}>Inactive</span>
                  )}
                </div>
                <div className={styles.adMeta}>
                  {ad.languages.join(", ")} · {ad.price_per_hour}$/hr · ⭐{" "}
                  {ad.rating.toFixed(1)}
                </div>
                <div className={styles.adLevels}>{ad.levels.join(" · ")}</div>
                <div className={styles.adStats}>
                  {ad.lessons_done} lessons · ${ad.total_earned} earned
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => setEditingId(ad._id)}
                >
                  Edit
                </button>
                <button
                  className={`${styles.toggleBtn} ${ad.isActive ? styles.toggleBtnActive : styles.toggleBtnInactive}`}
                  onClick={() => handleToggle(ad)}
                  title={
                    ad.isActive ? "Deactivate (hide from students)" : "Activate"
                  }
                >
                  {ad.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(ad)}
                  title="Delete ad"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
