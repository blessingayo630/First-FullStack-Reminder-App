'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthFormShell from '../components/auth/AuthFormShell';
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
        // Prefer showing it under email if it looks like a user-related error.
        setErrors((prev) => ({
          ...prev,
          email: data?.error ? String(data.error) : prev.email,
        }));
        return;
      }

      router.push('/login');
    } catch {
      // no-op
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title="Sign Up"
      subtitle="Create your account."
      footer={
        <div className="text-white/70 text-sm flex items-center justify-between">
          <button type="button" className="text-[#ffb020] hover:text-[#ff7a18] underline" onClick={() => router.push('/login')}>
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
  );
}

function validatePhoneNonOptional(phone: string): string | null {
  // Reuse existing phone rules, but allow empty to be optional.
  // For non-empty: validatePhone requires 10-15 digits.
  const digits = normalizePhone(phone).replace(/\D/g, '');
  if (!digits.trim()) return 'Phone number is required.';
  if (digits.length < 10 || digits.length > 15) return 'Phone number must be 10 to 15 digits.';
  return null;
}

