"use client";
import { useState, useEffect } from "react";
import { TeacherAd, Booking } from "@/types";
import api from "@/lib/api";
import styles from "./EarningsPanel.module.css";

interface AdEarning {
  ad: TeacherAd;
  earned: number;
  lessonsDone: number;
  pending: number;
  confirmed: number;
}

export default function EarningsPanel() {
  const [adStats, setAdStats] = useState<AdEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [adsRes, bookingsRes] = await Promise.all([
          api.get("/teacher-ads/my/ads"),
          api.get("/bookings"),
        ]);

        const ads: TeacherAd[] = adsRes.data.ads;
        const bookings: Booking[] = bookingsRes.data.bookings;

        const stats: AdEarning[] = ads.map((ad) => {
          const adBookings = bookings.filter((b) => {
            const adRef =
              typeof b.teacherAd === "object" ? b.teacherAd?._id : b.teacherAd;
            return adRef === ad._id;
          });
          return {
            ad,
            earned: ad.total_earned ?? 0,
            lessonsDone: ad.lessons_done ?? 0,
            pending: adBookings.filter((b) => b.teacherStatus === "pending")
              .length,
            confirmed: adBookings.filter((b) => b.teacherStatus === "confirmed")
              .length,
          };
        });

        setAdStats(stats);
        setTotalEarned(stats.reduce((s, x) => s + x.earned, 0));
        setTotalLessons(stats.reduce((s, x) => s + x.lessonsDone, 0));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className={styles.loading}>Loading earnings…</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>💰</span>
          <div>
            <div className={styles.summaryValue}>${totalEarned.toFixed(2)}</div>
            <div className={styles.summaryLabel}>Total Earned</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>🎓</span>
          <div>
            <div className={styles.summaryValue}>{totalLessons}</div>
            <div className={styles.summaryLabel}>Lessons Done</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}>📋</span>
          <div>
            <div className={styles.summaryValue}>{adStats.length}</div>
            <div className={styles.summaryLabel}>Active Ads</div>
          </div>
        </div>
      </div>

      {adStats.length === 0 ? (
        <div className={styles.empty}>
          No ads yet — create one to start earning.
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Ad</span>
            <span>Lessons</span>
            <span>Earned</span>
            <span>Pending</span>
            <span>Confirmed</span>
            <span>Rating</span>
          </div>
          {adStats.map(({ ad, earned, lessonsDone, pending, confirmed }) => (
            <div
              key={ad._id}
              className={`${styles.tableRow} ${!ad.isActive ? styles.tableRowInactive : ""}`}
            >
              <div className={styles.adCell}>
                <div className={styles.adCellName}>
                  {ad.name} {ad.surname}
                  {!ad.isActive && (
                    <span className={styles.inactiveMark}>·&nbsp;inactive</span>
                  )}
                </div>
                <div className={styles.adCellSub}>
                  {ad.languages.join(", ")} · ${ad.price_per_hour}/hr
                </div>
              </div>
              <span className={styles.cell}>{lessonsDone}</span>
              <span className={`${styles.cell} ${styles.cellGreen}`}>
                ${earned.toFixed(2)}
              </span>
              <span className={`${styles.cell} ${styles.cellAmber}`}>
                {pending}
              </span>
              <span className={`${styles.cell} ${styles.cellBlue}`}>
                {confirmed}
              </span>
              <span className={styles.cell}>
                {ad.rating > 0 ? `⭐ ${ad.rating.toFixed(1)}` : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
