"use client";
import { useState } from "react";
import { Teacher } from "@/types";
import styles from "./TeacherCard.module.css";

const REVIEW_COLORS = [
  "#9FB7CE",
  "#9FBAAE",
  "#E0A39A",
  "#F2C0BD",
  "#BFD6EA",
  "#CBDED3",
];

interface Props {
  teacher: Teacher;
  isFav: boolean;
  onToggleFav: () => void;
  onBook: () => void;
  isAuth: boolean;
  onAuthRequired: () => void;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.rating}>
      <svg className={styles.iconStar} aria-hidden="true">
        <use href="/sprite.svg#icon-star" />
      </svg>
      <span className={styles.ratingLabel}>Rating:</span>
      <span className={styles.ratingValue}>{rating ?? "—"}</span>
    </span>
  );
}

export default function TeacherCard({
  teacher,
  isFav,
  onToggleFav,
  onBook,
  isAuth,
  onAuthRequired,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const handleHeart = () => (isAuth ? onToggleFav() : onAuthRequired());
  const handleBook = () => (isAuth ? onBook() : onAuthRequired());

  const languages: string[] = teacher.languages ?? [];
  const conditions: string[] = teacher.conditions ?? [];
  const levels: string[] = teacher.levels ?? [];
  const reviews = teacher.reviews ?? [];
  const lessonInfo = teacher.lesson_info ?? "";
  const experience = teacher.experience ?? "";

  return (
    <div className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatarRing}>
            {teacher.avatar_url && !imgErr ? (
              <img
                src={teacher.avatar_url}
                alt={teacher.name}
                className={styles.avatarImg}
                onError={() => setImgErr(true)}
              />
            ) : (
              <span className={styles.avatarFallback}>
                {teacher.name?.[0] ?? "?"}
              </span>
            )}
          </div>
          <div className={styles.onlineDot} />
        </div>

        <div className={styles.content}>
          <div className={styles.topRow}>
            <div className={styles.titleGroup}>
              <div className={styles.categoryLabel}>Teacher</div>
              <h3 className={styles.name}>
                {teacher.name} {teacher.surname}
              </h3>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaGroup}>
                <span className={styles.metaItem}>
                  <svg className={styles.iconMeta} aria-hidden="true">
                    <use href="/sprite.svg#icon-book-open-01" />
                  </svg>
                  Lessons online
                </span>
                <span className={styles.metaItem}>
                  Lessons done: <strong>{teacher.lessons_done ?? 0}</strong>
                </span>
                <Stars rating={teacher.rating ?? 0} />
                <span className={styles.metaItem}>
                  Price / 1 hour:{" "}
                  <span className={styles.price}>
                    {teacher.price_per_hour}$
                  </span>
                </span>
              </div>

              <button
                className={`${styles.heartBtn} ${isFav ? styles.heartBtnActive : ""}`}
                onClick={handleHeart}
                aria-label="Toggle favorite"
              >
                <svg className={styles.iconHeart} aria-hidden="true">
                  <use
                    href={`/sprite.svg#${isFav ? "icon-hover" : "icon-normal"}`}
                  />
                </svg>
              </button>
            </div>
          </div>

          {languages.length > 0 && (
            <p className={styles.speaks}>
              Speaks:{" "}
              {languages.map((l, i) => (
                <span key={l}>
                  <span className={styles.speakLang}>{l}</span>
                  {i < languages.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}

          {lessonInfo && (
            <p className={styles.infoRow}>
              <span className={styles.infoLabel}>Lesson Info: </span>
              <span className={styles.infoValue}>{lessonInfo}</span>
            </p>
          )}

          {conditions.length > 0 && (
            <p className={styles.infoRow}>
              <span className={styles.infoLabel}>Conditions: </span>
              <span className={styles.infoValue}>{conditions.join(". ")}</span>
            </p>
          )}

          {!expanded && (
            <button
              type="button"
              className={styles.readMore}
              onClick={() => setExpanded((s) => !s)}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}

          {expanded && (
            <div className={styles.expandedSection}>

              {reviews.length > 0 ? (
                <div className={styles.reviews}>
                  {reviews.map((r, i) => (
                    <div key={i} className={styles.review}>
                      <div className={styles.reviewMeta}>
                        <div
                          className={styles.reviewAvatar}
                          style={{
                            background: REVIEW_COLORS[i % REVIEW_COLORS.length],
                          }}
                        >
                          {r.reviewer_name?.[0] ?? "?"}
                        </div>
                        <div>
                          <div className={styles.reviewerName}>
                            {r.reviewer_name}
                          </div>
                          <Stars rating={r.reviewer_rating} />
                        </div>
                      </div>
                      <p className={styles.reviewComment}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noReviews}>No reviews yet.</p>
              )}

              <button className={styles.bookBtn} onClick={handleBook}>
                Book trial lesson
              </button>
            </div>
          )}

          {levels.length > 0 && (
            <div className={styles.pills}>
              {levels.map((lv, i) => (
                <span
                  key={lv}
                  className={`${styles.pill} ${i === 0 ? styles.pillActive : ""}`}
                >
                  #{lv}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
