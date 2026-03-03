'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '@/lib/validation';
import api from '@/lib/api';
import { User } from '@/types';
import styles from './AuthForms.module.css';

const ALL_LANGUAGES = ['English','French','German','Spanish','Italian','Mandarin Chinese','Korean','Vietnamese','Japanese'];

interface FormData {
  name: string; email: string; password: string;
  role: 'client' | 'business'; languages?: string[];
}

interface Props { onSuccess: (token: string, user: User) => void; onSwitch: () => void; }

export default function RegisterForm({ onSuccess, onSwitch }: Props) {
  const [showPass, setShowPass] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(registerSchema) as any,
    defaultValues: { role: 'client', languages: [] },
  });

  const role = watch('role');

  const toggleLang = (lang: string) => {
    const next = selectedLangs.includes(lang)
      ? selectedLangs.filter((l) => l !== lang)
      : [...selectedLangs, lang];
    setSelectedLangs(next);
    setValue('languages', next);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('');
      const { data: res } = await api.post('/auth/register', { ...data, languages: selectedLangs });
      onSuccess(res.token, res.user);
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <div>
      <h2 className={styles.title}>Registration</h2>
      <p className={styles.subtitle}>Thank you for your interest! Please provide the following information.</p>

      {serverError && <p className={styles.error} style={{ marginBottom: 14 }}>{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input {...register('name')} className={`${styles.input} ${errors.name ? styles.inputError : ''}`} placeholder="Your name" />
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input {...register('email')} type="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="your@email.com" />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <input {...register('password')} type={showPass ? 'text' : 'password'}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`} placeholder="Min 6 characters" />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((p) => !p)}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          {errors.password && <p className={styles.error}>{errors.password.message}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Role</label>
          <div className={styles.roleToggle}>
            {(['client', 'business'] as const).map((r) => (
              <button key={r} type="button"
                className={`${styles.roleBtn} ${role === r ? styles.roleBtnActive : ''}`}
                onClick={() => { setValue('role', r); setSelectedLangs([]); setValue('languages', []); }}>
                {r === 'client' ? '👤 Client' : '🎓 Business'}
              </button>
            ))}
          </div>
        </div>

        {role === 'business' && (
          <div className={styles.field}>
            <label className={styles.label}>Languages You Teach</label>
            <div className={styles.langPicker}>
              {ALL_LANGUAGES.map((lang) => (
                <button key={lang} type="button"
                  className={`${styles.langBtn} ${selectedLangs.includes(lang) ? styles.langBtnActive : ''}`}
                  onClick={() => toggleLang(lang)}>
                  {lang}
                </button>
              ))}
            </div>
            {errors.languages && <p className={styles.error}>{(errors.languages as any).message}</p>}
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>

      <p className={styles.switchText}>
        Already have an account?{' '}
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>Log in</button>
      </p>
    </div>
  );
}
