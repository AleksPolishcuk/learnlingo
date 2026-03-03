'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/lib/validation';
import api from '@/lib/api';
import { User } from '@/types';
import styles from './AuthForms.module.css';

interface FormData { email: string; password: string; }
interface Props { onSuccess: (token: string, user: User) => void; onSwitch: () => void; }

export default function LoginForm({ onSuccess, onSwitch }: Props) {
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('');
      const { data: res } = await api.post('/auth/login', data);
      onSuccess(res.token, res.user);
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <div>
      <h2 className={styles.title}>Log In</h2>
      <p className={styles.subtitle}>Welcome back! Enter your credentials to continue.</p>

      {serverError && <p className={styles.error} style={{ marginBottom: 14 }}>{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input {...register('email')} type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="your@email.com" />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <input {...register('password')} type={showPass ? 'text' : 'password'}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`} placeholder="Password" />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((p) => !p)}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          {errors.password && <p className={styles.error}>{errors.password.message}</p>}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p className={styles.switchText}>
        Don&apos;t have an account?{' '}
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>Register</button>
      </p>
    </div>
  );
}
