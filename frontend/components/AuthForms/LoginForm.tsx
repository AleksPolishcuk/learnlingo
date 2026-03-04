'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/lib/validation';
import api from '@/lib/api';
import { User } from '@/types';
import Input from '@/components/Input/Input';
import styles from './AuthForms.module.css';

interface FormData { email: string; password: string; }
interface Props    { onSuccess: (token: string, user: User) => void; onSwitch: () => void; }

export default function LoginForm({ onSuccess, onSwitch }: Props) {
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
      <p className={styles.subtitle}>
        Welcome back! Please enter your credentials to access your account and
        continue your search for a teacher.
      </p>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          {...register('email')}
          label="Email"
          type="email"
          placeholder="your@email.com"
          error={errors.email?.message}
        />

        <Input
          {...register('password')}
          label="Password"
          isPassword
          placeholder="Password"
          error={errors.password?.message}
        />

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p className={styles.switchText}>
        Don&apos;t have an account?{' '}
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>
          Register
        </button>
      </p>
    </div>
  );
}
