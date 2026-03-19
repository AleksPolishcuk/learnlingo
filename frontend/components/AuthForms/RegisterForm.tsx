"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "@/lib/validation";
import api from "@/lib/api";
import { User } from "@/types";
import styles from "./AuthForms.module.css";
import Input from "../Input/Input";

interface FormData {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: "client" | "business";
}

interface Props {
  onSuccess: (token: string, user: User) => void;
  onSwitch: () => void;
}

export default function RegisterForm({ onSuccess, onSwitch }: Props) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema) as any,
    defaultValues: { role: "client" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError("");
      const { data: res } = await api.post("/auth/register", data);
      onSuccess(res.token, res.user);
    } catch (err: any) {
      setServerError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Registration</h2>
      <p className={styles.subtitle}>
        Thank you for your interest in our platform! Please provide the
        following information to create your account.
      </p>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.nameRow}>
          <div className={styles.field}>
            <label className={styles.label}>First Name</label>
            <input
              {...register("name")}
              className={styles.input}
              placeholder="Jane"
              autoComplete="given-name"
            />
            {errors.name && (
              <p className={styles.fieldError}>{errors.name.message}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Last Name</label>
            <input
              {...register("surname")}
              className={styles.input}
              placeholder="Smith"
              autoComplete="family-name"
            />
            {errors.surname && (
              <p className={styles.fieldError}>{errors.surname.message}</p>
            )}
          </div>
        </div>

        <Input
          {...register("email")}
          label="Email"
          type="email"
          placeholder="your@email.com"
          error={errors.email?.message}
        />

        <Input
          {...register("password")}
          label="Password"
          isPassword
          placeholder="Password"
          error={errors.password?.message}
        />

        <div className={styles.field}>
          <label className={styles.label}>I am a</label>
          <div className={styles.roleRow}>
            <label className={styles.roleOption}>
              <input
                {...register("role")}
                type="radio"
                value="client"
                className={styles.roleRadio}
              />
              <span className={styles.roleLabel}>Student</span>
            </label>
            <label className={styles.roleOption}>
              <input
                {...register("role")}
                type="radio"
                value="business"
                className={styles.roleRadio}
              />
              <span className={styles.roleLabel}>Teacher</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <p className={styles.switchText}>
        Already have an account?{" "}
        <button className={styles.switchBtn} onClick={onSwitch}>
          Log in
        </button>
      </p>
    </div>
  );
}
