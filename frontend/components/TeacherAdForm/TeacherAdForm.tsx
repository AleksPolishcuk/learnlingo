"use client";
import { useState, useEffect } from "react";
import { TeacherAd } from "@/types";
import api from "@/lib/api";
import AvatarUpload from "@/components/AvatarUpload/AvatarUpload";
import styles from "./TeacherAdForm.module.css";

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

const ALL_LEVELS = [
  "A1 Beginner",
  "A2 Elementary",
  "B1 Intermediate",
  "B2 Upper-Intermediate",
  "C1 Advanced",
  "C2 Proficient",
];

interface Props {
  existingAd: TeacherAd | null;
  onSaved: (ad: TeacherAd) => void;
  onDeleted?: () => void;
  onCancel?: () => void;
  prefillName?: string;
  prefillSurname?: string;
  prefillAvatar?: string;
}

export default function TeacherAdForm({
  existingAd,
  onSaved,
  onDeleted,
  onCancel,
  prefillName = "",
  prefillSurname = "",
  prefillAvatar = "",
}: Props) {
  const [name, setName] = useState(existingAd?.name ?? prefillName);
  const [surname, setSurname] = useState(existingAd?.surname ?? prefillSurname);
  const [languages, setLanguages] = useState<string[]>(
    existingAd?.languages ?? [],
  );
  const [levels, setLevels] = useState<string[]>(existingAd?.levels ?? []);
  const [price, setPrice] = useState(String(existingAd?.price_per_hour ?? ""));
  const [avatarUrl, setAvatarUrl] = useState(
    existingAd?.avatar_url ?? prefillAvatar,
  );
  const [lessonInfo, setLessonInfo] = useState(existingAd?.lesson_info ?? "");
  const [conditions, setConditions] = useState<string>(
    Array.isArray(existingAd?.conditions)
      ? existingAd.conditions.join("\n")
      : "",
  );
  const [experience, setExperience] = useState(existingAd?.experience ?? "");
  const [isActive, setIsActive] = useState(existingAd?.isActive ?? true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!existingAd) {
      setName(prefillName);
      setSurname(prefillSurname);
      setAvatarUrl(prefillAvatar);
      setLanguages([]);
      setLevels([]);
      setPrice("");
      setLessonInfo("");
      setConditions("");
      setExperience("");
      setIsActive(true);
      return;
    }
    setName(existingAd.name);
    setSurname(existingAd.surname);
    setLanguages(existingAd.languages);
    setLevels(existingAd.levels);
    setPrice(String(existingAd.price_per_hour));
    setAvatarUrl(existingAd.avatar_url);
    setLessonInfo(existingAd.lesson_info);
    setConditions(
      Array.isArray(existingAd.conditions)
        ? existingAd.conditions.join("\n")
        : "",
    );
    setExperience(existingAd.experience);
    setIsActive(existingAd.isActive);
  }, [existingAd, prefillName, prefillSurname, prefillAvatar]);

  const toggleLang = (l: string) =>
    setLanguages((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));
  const toggleLevel = (l: string) =>
    setLevels((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (!name.trim() || !surname.trim()) {
      setError("Name and surname are required.");
      return;
    }
    if (languages.length === 0) {
      setError("Select at least one language.");
      return;
    }
    if (levels.length === 0) {
      setError("Select at least one level.");
      return;
    }
    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum < 1) {
      setError("Enter a valid price per hour.");
      return;
    }

    const payload = {
      name: name.trim(),
      surname: surname.trim(),
      languages,
      levels,
      price_per_hour: priceNum,
      avatar_url: avatarUrl.trim(),
      lesson_info: lessonInfo.trim(),
      conditions: conditions
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean),
      experience: experience.trim(),
      isActive,
    };

    try {
      setSaving(true);
      const res = existingAd
        ? await api.put(`/teacher-ads/${existingAd._id}`, payload)
        : await api.post("/teacher-ads", payload);
      setSuccess("Ad saved successfully!");
      onSaved(res.data.ad);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingAd) return;
    if (!window.confirm("Delete this ad? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await api.delete(`/teacher-ads/${existingAd._id}`);
      onDeleted?.();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleAdAvatarUploaded = async (url: string) => {
    setAvatarUrl(url);
    if (existingAd) {
      try {
        const res = await api.put(`/teacher-ads/${existingAd._id}`, {
          avatar_url: url,
        });
        onSaved(res.data.ad);
      } catch {}
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.sectionTitle}>
        {existingAd ? "Edit Ad" : "Create New Ad"}
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}
      {success && <div className={styles.successBox}>{success}</div>}

      <div className={styles.avatarRow}>
        <AvatarUpload
          currentUrl={avatarUrl}
          name={name || "?"}
          endpoint={existingAd ? `/upload/ad-avatar/${existingAd._id}` : ""}
          onUploaded={handleAdAvatarUploaded}
          size={80}
          disabled={!existingAd}
          disabledHint={
            !existingAd ? "Save the ad first to upload a photo" : undefined
          }
        />
        <p className={styles.avatarNote}>
          {existingAd ? "Click photo to change" : "Add a photo after saving"}
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>First Name *</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Last Name *</label>
          <input
            className={styles.input}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Smith"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Price / Hour ($) *</label>
          <input
            className={styles.input}
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="30"
          />
        </div>
      </div>

      <div className={styles.fieldFull}>
        <label className={styles.label}>Languages You Teach *</label>
        <div className={styles.pills}>
          {ALL_LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              className={`${styles.pill} ${languages.includes(l) ? styles.pillActive : ""}`}
              onClick={() => toggleLang(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.fieldFull}>
        <label className={styles.label}>Levels *</label>
        <div className={styles.pills}>
          {ALL_LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              className={`${styles.pill} ${levels.includes(l) ? styles.pillActive : ""}`}
              onClick={() => toggleLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.fieldFull}>
        <label className={styles.label}>Lesson Info</label>
        <textarea
          className={styles.textarea}
          value={lessonInfo}
          rows={3}
          onChange={(e) => setLessonInfo(e.target.value)}
          placeholder="Describe what your lessons cover…"
        />
      </div>

      <div className={styles.fieldFull}>
        <label className={styles.label}>
          Conditions <span className={styles.hint}>(one per line)</span>
        </label>
        <textarea
          className={styles.textarea}
          value={conditions}
          rows={3}
          onChange={(e) => setConditions(e.target.value)}
          placeholder={"Teaches adults only.\nFlexible scheduling."}
        />
      </div>

      <div className={styles.fieldFull}>
        <label className={styles.label}>Experience</label>
        <textarea
          className={styles.textarea}
          value={experience}
          rows={4}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Tell students about your background…"
        />
      </div>

      <div className={styles.fieldFull}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            className={styles.toggleCheck}
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Ad is publicly visible
        </label>
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            ← Back
          </button>
        )}
        {existingAd && (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete Ad"}
          </button>
        )}
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : existingAd ? "Save Changes" : "Publish Ad"}
        </button>
      </div>
    </div>
  );
}
