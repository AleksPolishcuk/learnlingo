"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./TimePicker.module.css";

function buildSlots(): { hour: number; minute: number }[] {
  const slots: { hour: number; minute: number }[] = [];
  for (let h = 7; h <= 21; h++) {
    slots.push({ hour: h, minute: 0 });
    if (h < 21) slots.push({ hour: h, minute: 30 });
  }
  return slots;
}

const SLOTS = buildSlots();
const pad = (n: number) => String(n).padStart(2, "0");

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function TimePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector(
      '[data-active="true"]',
    ) as HTMLElement | null;
    if (active) {
      const listH = listRef.current.clientHeight;
      listRef.current.scrollTop =
        active.offsetTop - listH / 2 + active.clientHeight / 2;
    }
  }, [open]);

  const [selH, selM] = value ? value.split(":").map(Number) : [-1, -1];

  const selectSlot = (hour: number, minute: number) => {
    onChange(`${pad(hour)}:${pad(minute)}`);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div
        role="button"
        tabIndex={0}
        className={`${styles.triggerInput} ${!value ? styles.triggerPlaceholder : ""} ${open ? styles.triggerInputOpen : ""}`}
        onClick={() => setOpen((p) => !p)}
        onKeyDown={(e) => e.key === "Enter" && setOpen((p) => !p)}
      >
        {value || "00:00"}
      </div>

      <span className={styles.clockIcon}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Meeting time</div>
          <div className={styles.slotList} ref={listRef}>
            {SLOTS.map(({ hour, minute }) => {
              const active = hour === selH && minute === selM;
              return (
                <div
                  key={`${hour}-${minute}`}
                  data-active={active}
                  className={`${styles.slot} ${active ? styles.slotActive : ""}`}
                  onClick={() => selectSlot(hour, minute)}
                >
                  <span className={styles.slotHour}>{pad(hour)}</span>
                  <span className={styles.slotColon}>:</span>
                  <span className={styles.slotMinute}>{pad(minute)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
