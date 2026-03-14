"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Teacher, TeacherFilters, AnyTeacher } from "@/types";
import { useAuthContext } from "@/context/AuthContext";
import FilterBar from "@/components/FilterBar/FilterBar";
import TeacherCard from "@/components/TeacherCard/TeacherCard";
import Modal from "@/components/Modal/Modal";
import BookingForm from "@/components/BookingForm/BookingForm";
import api from "@/lib/api";
import styles from "./page.module.css";
import SkeletonCard from "@/components/SkeletonCard/SkeletonCard";

// Cards shown per page / per "Load more" click
const PAGE_SIZE = 3;
// How many items to fetch from each API at once (larger = fewer round trips)
const FETCH_SIZE = 12;

const DEFAULT_FILTERS: TeacherFilters = {
  language: "",
  level: "",
  price: "",
  sortBy: "",
};

export default function TeachersPage() {
  const { isAuth, favorites, toggleFavorite, openAuthWarn, showToast } =
    useAuthContext();

  // Items currently rendered on screen
  const [visible, setVisible] = useState<AnyTeacher[]>([]);
  // Items fetched but not yet shown — drained PAGE_SIZE at a time
  const bufferRef = useRef<AnyTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  // Track which API page we've fetched up to for each source
  const apiPageRef = useRef({ teachers: 1, ads: 1 });
  const apiDoneRef = useRef({ teachers: false, ads: false });

  const [filters, setFilters] = useState<TeacherFilters>(DEFAULT_FILTERS);
  const filtersRef = useRef(filters);

  const [bookingTeacher, setBookingTeacher] = useState<{
    teacher: AnyTeacher;
    isAd: boolean;
  } | null>(null);

  // Fetch one batch from each API (if not exhausted) and append to buffer
  const fetchBatch = useCallback(async (f: TeacherFilters) => {
    const makeParams = (page: number): Record<string, string> => {
      const p: Record<string, string> = {
        page: String(page),
        limit: String(FETCH_SIZE),
      };
      if (f.language) p.language = f.language;
      if (f.level) p.level = f.level;
      if (f.price) p.price = f.price;
      if (f.sortBy) p.sortBy = f.sortBy;
      return p;
    };

    const [teachersRes, adsRes] = await Promise.allSettled([
      apiDoneRef.current.teachers
        ? Promise.resolve(null)
        : api.get("/teachers", {
            params: makeParams(apiPageRef.current.teachers),
          }),
      apiDoneRef.current.ads
        ? Promise.resolve(null)
        : api.get("/teacher-ads", {
            params: makeParams(apiPageRef.current.ads),
          }),
    ]);

    const newSeeded: AnyTeacher[] =
      teachersRes.status === "fulfilled" && teachersRes.value
        ? (teachersRes.value.data.teachers ?? []).map((t: AnyTeacher) => ({
            ...t,
            _kind: "Teacher",
          }))
        : [];

    const newAds: AnyTeacher[] =
      adsRes.status === "fulfilled" && adsRes.value
        ? (adsRes.value.data.teachers ?? []).map((a: AnyTeacher) => ({
            ...a,
            _kind: "TeacherAd",
            _isAd: true,
          }))
        : [];

    // Advance API cursors
    if (teachersRes.status === "fulfilled" && teachersRes.value) {
      if (teachersRes.value.data.hasMore) apiPageRef.current.teachers++;
      else apiDoneRef.current.teachers = true;
    } else if (!apiDoneRef.current.teachers) {
      apiDoneRef.current.teachers = true;
    }

    if (adsRes.status === "fulfilled" && adsRes.value) {
      if (adsRes.value.data.hasMore) apiPageRef.current.ads++;
      else apiDoneRef.current.ads = true;
    } else if (!apiDoneRef.current.ads) {
      apiDoneRef.current.ads = true;
    }

    const fetched = [...newSeeded, ...newAds];

    // Sort the fetched batch
    if (f.sortBy === "name_asc") {
      fetched.sort((a, b) =>
        `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`),
      );
    } else if (f.sortBy === "name_desc") {
      fetched.sort((a, b) =>
        `${b.name} ${b.surname}`.localeCompare(`${a.name} ${a.surname}`),
      );
    } else if (f.sortBy === "newest") {
      fetched.sort((a, b) => {
        const aD = (a as any).createdAt
          ? new Date((a as any).createdAt).getTime()
          : 0;
        const bD = (b as any).createdAt
          ? new Date((b as any).createdAt).getTime()
          : 0;
        return bD - aD;
      });
    } else if (f.sortBy === "oldest") {
      fetched.sort((a, b) => {
        const aD = (a as any).createdAt
          ? new Date((a as any).createdAt).getTime()
          : Infinity;
        const bD = (b as any).createdAt
          ? new Date((b as any).createdAt).getTime()
          : Infinity;
        return aD - bD;
      });
    }

    bufferRef.current = [...bufferRef.current, ...fetched];
  }, []);

  // Drain PAGE_SIZE items from buffer (fetching more if needed), then display
  const showNextPage = useCallback(
    async (f: TeacherFilters, replace: boolean) => {
      setLoading(true);
      try {
        // Fill buffer until we have at least PAGE_SIZE items or APIs are done
        while (
          bufferRef.current.length < PAGE_SIZE &&
          !(apiDoneRef.current.teachers && apiDoneRef.current.ads)
        ) {
          await fetchBatch(f);
        }

        const slice = bufferRef.current.splice(0, PAGE_SIZE);
        if (slice.length === 0) {
          setHasMore(false);
          return;
        }

        setVisible((prev) => (replace ? slice : [...prev, ...slice]));

        const moreInBuffer = bufferRef.current.length > 0;
        const apisNotDone = !(
          apiDoneRef.current.teachers && apiDoneRef.current.ads
        );
        setHasMore(moreInBuffer || apisNotDone);
      } catch (err: any) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    },
    [fetchBatch, showToast],
  );

  // Reset and reload from page 1 whenever filters change
  useEffect(() => {
    filtersRef.current = filters;
    bufferRef.current = [];
    apiPageRef.current = { teachers: 1, ads: 1 };
    apiDoneRef.current = { teachers: false, ads: false };
    setVisible([]);
    setHasMore(false);
    showNextPage(filters, true);
  }, [filters]); // eslint-disable-line

  const handleBook = (teacher: AnyTeacher) => {
    if (!isAuth) {
      openAuthWarn();
      return;
    }
    setBookingTeacher({ teacher, isAd: !!(teacher as any)._isAd });
  };

  return (
    <div className={styles.page}>
      <FilterBar filters={filters} onChange={setFilters} />

      {loading && visible.length === 0 ? (
        <div className={styles.list}>
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <svg
            className={styles.emptyIcon}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use
              href="/sprite.svg#icon-glass"
              xlinkHref="/sprite.svg#icon-glass"
            />
          </svg>
          <p className={styles.emptyTitle}>
            No teachers found for these filters
          </p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {visible.map((t) => (
              <TeacherCard
                key={t._id}
                teacher={t as Teacher}
                isFav={favorites.includes(t._id)}
                onToggleFav={() => {
                  if (!isAuth) {
                    openAuthWarn();
                    return;
                  }
                  const kind =
                    (t as any)._kind === "TeacherAd" ? "TeacherAd" : "Teacher";
                  toggleFavorite(t._id, kind);
                }}
                onBook={() => handleBook(t)}
                isAuth={isAuth}
                onAuthRequired={openAuthWarn}
              />
            ))}
          </div>

          {/* Button visible while more items exist or are loading */}
          {(hasMore || loading) && (
            <div className={styles.loadMore}>
              <button
                className={styles.loadMoreBtn}
                onClick={() => showNextPage(filtersRef.current, false)}
                disabled={loading}
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!bookingTeacher}
        onClose={() => setBookingTeacher(null)}
        wide
      >
        {bookingTeacher && (
          <BookingForm
            teacher={bookingTeacher.teacher}
            isAd={bookingTeacher.isAd}
            onClose={() => setBookingTeacher(null)}
            onBooked={() => showToast("Trial lesson booked!")}
          />
        )}
      </Modal>
    </div>
  );
}
