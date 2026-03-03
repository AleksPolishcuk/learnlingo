"use client";
import { useState, useRef, useEffect } from "react";
import { TeacherFilters } from "@/types";
import styles from "./FilterBar.module.css";

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
const PRICES = ["10", "20", "30", "40"];

interface Props {
  filters: TeacherFilters;
  onChange: (f: TeacherFilters) => void;
}

function Select({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className={styles.filterGroup}>
      <span className={styles.label}>{label}</span>
      <div ref={ref} className={styles.wrapper}>
        <button className={styles.trigger} onClick={() => setOpen((p) => !p)}>
          <span className={value ? "" : styles.triggerPlaceholder}>
            {value || placeholder}
          </span>
        </button>
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          <use href="/sprite.svg#icon-chevron-down" />
        </svg>
        {open && (
          <div className={styles.dropdown}>
            <div
              className={styles.optionAll}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              All
            </div>
            {options.map((o) => (
              <div
                key={o}
                className={`${styles.option} ${value === o ? styles.optionActive : ""}`}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                {o}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FilterBar({ filters, onChange }: Props) {
  const set = (key: keyof TeacherFilters) => (v: string) =>
    onChange({ ...filters, [key]: v });
  return (
    <div className={styles.filterBar}>
      <Select
        label="Languages"
        value={filters.language}
        options={ALL_LANGUAGES}
        placeholder="All Languages"
        onChange={set("language")}
      />
      <Select
        label="Level of knowledge"
        value={filters.level}
        options={ALL_LEVELS}
        placeholder="All Levels"
        onChange={set("level")}
      />
      <Select
        label="Price"
        value={filters.price}
        options={PRICES}
        placeholder="All Prices"
        onChange={set("price")}
      />
    </div>
  );
}
