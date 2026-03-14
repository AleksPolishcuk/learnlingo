"use client";
import { useState, useRef } from "react";
import styles from "./AvatarUpload.module.css";

interface Props {
  currentUrl?: string;
  name?: string;
  onUploaded: (url: string) => void;
  endpoint: string;
  size?: number;
  disabled?: boolean;
  disabledHint?: string;
}

export default function AvatarUpload({
  currentUrl,
  name,
  onUploaded,
  endpoint,
  size = 96,
  disabled = false,
  disabledHint,
}: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const initial = name?.[0]?.toUpperCase() ?? "?";

  const handleFile = async (file: File) => {
    if (disabled) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      setError("");
      setUploading(true);
      const form = new FormData();
      form.append("avatar", file);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("ll_token") : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}${endpoint}`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        },
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Upload failed");
      }
      const json = await res.json();
      onUploaded(json.avatar_url);
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) handleFile(e.dataTransfer.files?.[0]);
  };

  const handleClick = () => {
    if (disabled) {
      if (disabledHint) setError(disabledHint);
      return;
    }
    if (!uploading) inputRef.current?.click();
  };

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.circle} ${uploading ? styles.circleUploading : ""} ${disabled ? styles.circleDisabled : ""}`}
        style={{ width: size, height: size }}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        title={
          disabled
            ? (disabledHint ?? "Unavailable")
            : "Click or drag an image to upload"
        }
      >
        {preview ? (
          <img src={preview} alt="avatar" className={styles.img} />
        ) : (
          <span className={styles.initial} style={{ fontSize: size * 0.38 }}>
            {initial}
          </span>
        )}

        {!disabled && (
          <div className={styles.overlay}>
            {uploading ? (
              <span className={styles.spinner} />
            ) : (
              <svg
                className={styles.cameraIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleChange}
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
