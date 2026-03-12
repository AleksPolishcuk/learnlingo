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

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name A → Z" },
  { value: "name_desc", label: "Name Z → A" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const DEFAULT_FILTERS: TeacherFilters = {
  language: "",
  level: "",
  price: "",
  sortBy: "",
};

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
  options: { value: string; label: string }[];
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

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div className={styles.filterGroup}>
      <span className={styles.label}>{label}</span>
      <div ref={ref} className={styles.wrapper}>
        <button className={styles.trigger} onClick={() => setOpen((p) => !p)}>
          <span className={value ? "" : styles.triggerPlaceholder}>
            {selectedLabel || placeholder}
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
                key={o.value}
                className={`${styles.option} ${value === o.value ? styles.optionActive : ""}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
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

  const isFiltered =
    filters.language || filters.level || filters.price || filters.sortBy;

  const handleReset = () => onChange(DEFAULT_FILTERS);

  return (
    <div className={styles.filterBar}>
      <Select
        label="Languages"
        value={filters.language}
        options={ALL_LANGUAGES.map((l) => ({ value: l, label: l }))}
        placeholder="All Languages"
        onChange={set("language")}
      />
      <Select
        label="Level of knowledge"
        value={filters.level}
        options={ALL_LEVELS.map((l) => ({ value: l, label: l }))}
        placeholder="All Levels"
        onChange={set("level")}
      />
      <Select
        label="Price"
        value={filters.price}
        options={PRICES.map((p) => ({ value: p, label: `${p} $` }))}
        placeholder="All Prices"
        onChange={set("price")}
      />
      <Select
        label="Sort by"
        value={filters.sortBy}
        options={SORT_OPTIONS}
        placeholder="All"
        onChange={set("sortBy")}
      />

      {isFiltered && (
        <div className={styles.filterGroup}>
          <span className={styles.label}>&nbsp;</span>
          <button className={styles.resetBtn} onClick={handleReset}>
            <svg className={styles.resetIcon} aria-hidden="true">
              <use href="/sprite.svg#icon-x" />
            </svg>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
