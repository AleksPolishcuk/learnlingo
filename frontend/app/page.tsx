"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";

const STATS = [
  { num: "32,000+", label: "Experienced tutors" },
  { num: "300,000+", label: "5-star tutor reviews" },
  { num: "120+", label: "Subjects taught" },
  { num: "200+", label: "Tutor nationalities" },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>
            Unlock your potential with <br />
            the best <em className={styles.heroHighlight}>language</em> tutors
          </h1>
          <p className={styles.heroDesc}>
            Embark on an Exciting Language Journey with Expert Language <br />
            Tutors: Elevate your language proficiency to new heights by <br />
            connecting with highly qualified and experienced tutors.
          </p>
          <button
            className={styles.heroBtn}
            onClick={() => router.push("/teachers")}
          >
            Get started
          </button>
        </div>

        <div className={styles.heroRight}>
          <Image
            className={styles.imageRight}
            src="/images/block@2x.jpg"
            alt="image"
            width={568}
            height={530}
          />
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statsInner}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <div className={styles.statNum}>{s.num}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
