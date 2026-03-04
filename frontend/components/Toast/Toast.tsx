"use client";
import { useEffect } from "react";
import styles from "./Toast.module.css";

interface Props {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`${styles.toast} ${type === "success" ? styles.success : styles.error}`}
    >
      <svg className={styles.icon} aria-hidden="true">
        <use
          xlinkHref={`/sprite.svg#${type === "success" ? "icon-success" : "icon-fail-error"}`}
        />
      </svg>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
