"use client";
import { useState, lazy, Suspense } from "react";
import { User } from "@/types";
import styles from "./ProfileModal.module.css";

const AdManager = lazy(() => import("@/components/AdManeger/AdManeger"));
const EarningsPanel = lazy(
  () => import("@/components/EarningsPanel/EarningsPanel"),
);

interface Props {
  user: User;
  onClose: () => void;
}

type Tab = "profile" | "ads" | "earnings";

export default function ProfileModal({ user, onClose }: Props) {
  const isBusiness = user.role === "business";
  const [tab, setTab] = useState<Tab>("profile");

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    ...(isBusiness
      ? [
          { id: "ads" as Tab, label: "My Ads" },
          { id: "earnings" as Tab, label: "Earnings" },
        ]
      : []),
  ];

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Account</h2>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className={styles.profileSection}>
          <div className={styles.avatarRow}>
            <div className={styles.avatarCircle}>
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userEmail}>{user.email}</div>
              <div className={styles.userRole}>
                {isBusiness ? "🏫 Teacher account" : "🎓 Student account"}
              </div>
            </div>
          </div>
          <div className={styles.memberSince}>
            Member since{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </div>
        </div>
      )}

      {tab === "ads" && isBusiness && (
        <Suspense
          fallback={<div className={styles.adLoading}>Loading ads…</div>}
        >
          <AdManager />
        </Suspense>
      )}

      {tab === "earnings" && isBusiness && (
        <Suspense
          fallback={<div className={styles.adLoading}>Loading earnings…</div>}
        >
          <EarningsPanel />
        </Suspense>
      )}
    </div>
  );
}
