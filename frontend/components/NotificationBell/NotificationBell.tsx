"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { AppNotification } from "@/types";
import api from "@/lib/api";
import styles from "./NotificationBell.module.css";

const TYPE_ICON: Record<string, string> = {
  booking_confirmed: "✅",
  booking_cancelled: "❌",
  lesson_completed: "🎓",
  review_received: "⭐",
  booking_new: "📅",
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen((p) => !p);
    if (!open && unread > 0) {
      try {
        await api.patch("/notifications/read-all");
        setUnread(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch {}
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffM = Math.floor((now.getTime() - d.getTime()) / 60_000);
    if (diffM < 1) return "just now";
    if (diffM < 60) return `${diffM}m ago`;
    const diffH = Math.floor(diffM / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div ref={ref} className={styles.wrap}>
      <button
        className={styles.bellBtn}
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <svg
          className={styles.bellIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className={styles.badge}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.title}>Notifications</span>
            {notifications.length > 0 && (
              <button
                className={styles.clearBtn}
                onClick={async () => {
                  await api.patch("/notifications/read-all");
                  setNotifications((p) => p.map((n) => ({ ...n, read: true })));
                  setUnread(0);
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`${styles.item} ${!n.read ? styles.itemUnread : ""}`}
                >
                  <span className={styles.itemIcon}>
                    {TYPE_ICON[n.type] ?? "🔔"}
                  </span>
                  <div className={styles.itemBody}>
                    <p className={styles.itemMsg}>{n.message}</p>
                    <span className={styles.itemTime}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
