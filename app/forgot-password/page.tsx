'use client';

import React, { useMemo, useState } from 'react';
import AuthFormShell from '../components/auth/AuthFormShell';
import { AuthField, validateEmail } from '../components/auth/inputs';
import AuthStatusPopup from '../components/auth/AuthStatusPopup';
import { useRouter } from 'next/navigation';

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
        const msg = data?.error ? String(data.error) : 'Request failed';
        // Stay on the same page so the popup/message can be shown here.
        setErrors({ email: msg });
        setSent(false);
        return;
      }

      // Show success on this same /forgot-password page.
      setSent(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      // Stay on the same page and surface message inline.
      setErrors({ email: msg });
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
            <button type="button" className="text-[#ffb020] hover:text-[#ff7a18] underline cursor-pointer" onClick={() => router.push('/login')}>
              Back to login
            </button>
          </div>
      }
    >
      {sent ? (
        <AuthStatusPopup
          variant="success"
          title="Reset link sent"
          message="If an account exists for this email, you will receive a reset link."
          durationMs={4200}
          redirectTo="/login"

        />
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

