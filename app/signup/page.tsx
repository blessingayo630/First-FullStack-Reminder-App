'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthFormShell from '../components/auth/AuthFormShell';
import AuthStatusPopup from '../components/auth/AuthStatusPopup';
import {
  AuthField,
  normalizePhone,
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from '../components/auth/inputs';

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

type PopupState =
  | null
  | {
      variant: 'success' | 'error';
      title: string;
      message?: string;
      durationMs?: number;
    };

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string | null>>>({});
  const [submitting, setSubmitting] = useState(false);

  const [authPopup, setAuthPopup] = useState<PopupState>(null);

  const computed = useMemo(() => {
    return {
      fullName: validateFullName(form.fullName),
      email: validateEmail(form.email),
      phoneNumber: form.phoneNumber.trim() ? validatePhoneNonOptional(form.phoneNumber) : null,
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
  }, [form.fullName, form.email, form.phoneNumber, form.password, form.confirmPassword]);

  const canSubmit = Object.values(computed).every((v) => !v);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(computed);
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim() ? normalizePhone(form.phoneNumber) : null,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error ? String(data.error) : 'Signup failed';
        setAuthPopup({
          variant: 'error',
          title: 'Sign up failed',
          message: msg,
        });
        return;
      }

      setAuthPopup({
        variant: 'success',
        title: 'Account created',
        message: 'Please login to continue.',
        durationMs: 3500,
      });

      // Navigate to login after successful signup popup
      setTimeout(() => {
        router.push('/login');
      }, 3500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setAuthPopup({
        variant: 'error',
        title: 'Sign up failed',
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {authPopup ? (
        <AuthStatusPopup
          variant={authPopup.variant}
          title={authPopup.title}
          message={authPopup.message}
          durationMs={authPopup.durationMs ?? 3500}
        />
      ) : null}

      <AuthFormShell
        title="Sign Up"
        subtitle="Create your account."
        footer={
<div className="text-white/70 text-sm flex items-center justify-between">
            <button
              type="button"
              className="text-[#ffb020] hover:text-[#ff7a18] underline cursor-pointer"
              onClick={() => router.push('/login')}
            >
              Already have an account? Login
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <AuthField
            label="Full-name"
            type="text"
            required
            placeholder="Your full name"
            value={form.fullName}
            onChange={(next) => setForm((p) => ({ ...p, fullName: next }))}
            error={errors.fullName}
            autoComplete="name"
          />

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
            label="Phone-number"
            type="tel"
            placeholder="e.g., +1234567890"
            value={form.phoneNumber}
            onChange={(next) => setForm((p) => ({ ...p, phoneNumber: next }))}
            error={errors.phoneNumber}
            autoComplete="tel"
            inputMode="tel"
            required={false}
          />


          <AuthField
            label="Password"
            type="password"
            required
            placeholder="Your password"
            value={form.password}
            onChange={(next) => setForm((p) => ({ ...p, password: next }))}
            error={errors.password}
            autoComplete="new-password"
          />

          <AuthField
            label="Confirm Password"
            type="password"
            required
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={(next) => setForm((p) => ({ ...p, confirmPassword: next }))}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition"
            >
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </AuthFormShell>
    </>
  );
}

function validatePhoneNonOptional(phone: string): string | null {
  const digits = normalizePhone(phone).replace(/\D/g, '');

  if (!digits.trim()) return 'Phone number is required.';
  if (digits.length < 10 || digits.length > 15) return 'Phone number must be 10 to 15 digits.';
  return null;
}

