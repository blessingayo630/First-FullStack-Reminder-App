'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthFormShell from '../components/auth/AuthFormShell';
import { AuthField, validateEmail, validatePassword } from '../components/auth/inputs';
import { supabase } from '@/lib/supabase';


type FormState = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string | null>>>({});
  const [submitting, setSubmitting] = useState(false);

  const computed = useMemo(() => {
    return {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
  }, [form]);

  const canSubmit = Object.values(computed).every((v) => !v);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(computed);
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        const message =
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message?: unknown }).message ?? 'Login failed')
            : 'Login failed';

        setErrors((prev) => ({ ...prev, email: message }));
        return;
      }


      router.push('/homepage');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Login failed';

      setErrors((prev) => ({ ...prev, email: message }));
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <AuthFormShell
      title="Login"
      subtitle="Welcome back."
      footer={
        <div className="text-white/70 text-sm flex items-center justify-between">
          <button type="button" className="text-[#ffb020] hover:text-[#ff7a18] underline" onClick={() => router.push('/forgot-password')}>
            Forgot password?
          </button>
          <button type="button" className="text-[#ffb020] hover:text-[#ff7a18] underline" onClick={() => router.push('/signup')}>
            Sign up
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthField
          	label="Email"
          	type="email"
          	required
          	placeholder="you@example.com"
          	value={form.email}
          	onChange={(next) => setForm((p) => ({ ...p, email: next }))}
          	error={errors.email}
          	autoComplete="email"
          	inputMode="email"
        />

        <AuthField
          label="Password"
          type="password"
          required
          placeholder="Your password"
          value={form.password}
          onChange={(next) => setForm((p) => ({ ...p, password: next }))}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition"
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </form>
    </AuthFormShell>
  );
}
