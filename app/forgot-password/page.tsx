'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthFormShell from '../components/auth/AuthFormShell';
import { AuthField, validateEmail } from '../components/auth/inputs';

type FormState = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string | null>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const computed = useMemo(() => {
    return {
      email: validateEmail(form.email),
    };
  }, [form.email]);

  const canSubmit = Object.values(computed).every((v) => !v);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(computed);
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          email: data?.error ? String(data.error) : prev.email,
        }));
        return;
      }

      setSent(true);
    } catch {
      // no-op
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title="Forgot Password"
      subtitle="Enter your email to receive a reset link."
      footer={
        <div className="text-white/70 text-sm flex items-center justify-between">
          <button type="button" className="text-[#ffb020] hover:text-[#ff7a18] underline" onClick={() => router.push('/login')}>
            Back to login
          </button>
        </div>
      }
    >
      {sent ? (
        <div className="text-white/70 text-sm">
          If an account exists for this email, you will receive a reset link.
          <div className="mt-5">
            <button type="button" className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition" onClick={() => router.push('/login')}>
              Return to Login
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <AuthField
            label="Email"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(next) => setForm({ email: next })}
            error={errors.email}
            autoComplete="email"
            inputMode="email"
          />

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition"
            >
              {submitting ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      )}
    </AuthFormShell>
  );
}

