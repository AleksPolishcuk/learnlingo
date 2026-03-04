"use client";
import { useState, forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isPassword, type, className, ...rest }, ref) => {
    const [showPass, setShowPass] = useState(false);
    const resolvedType = isPassword ? (showPass ? "text" : "password") : type;

    return (
      <div className={styles.field}>
        {label && <label className={styles.label}>{label}</label>}

        <div className={styles.wrap}>
          <input
            ref={ref}
            type={resolvedType}
            className={[
              styles.input,
              isPassword ? styles.inputWithSuffix : "",
              error ? styles.inputError : "",
              className ?? "",
            ]
              .join(" ")
              .trim()}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPass((p) => !p)}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              <svg className={styles.icon} aria-hidden="true">
                <use
                  href={`/sprite.svg#${showPass ? "icon-eye" : "icon-eye-off"}`}
                />
              </svg>
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
