'use client';

import React, { useMemo, useState } from 'react';
import {Visibility, VisibilityOff} from '@mui/icons-material';

export type FieldErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>;


export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Enter a valid email address.';
  return null;
}

export function normalizePhone(input: string): string {
  // Keep digits and leading +
  const trimmed = input.trim();
  if (trimmed.startsWith('+')) {
    return '+' + trimmed.slice(1).replace(/[^0-9]/g, '');
  }
  return trimmed.replace(/[^0-9]/g, '');
}

export function validatePhone(phone: string): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized.trim()) return 'Phone number is required.';
  const digits = normalized.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return 'Phone number must be 10 to 15 digits.';
  return null;
}

export function validateFullName(name: string): string | null {
  const v = name.trim();
  if (!v) return 'Full name is required.';
  if (v.length < 2) return 'Full name must be at least 2 characters.';
  if (v.length > 60) return 'Full name must be at most 60 characters.';
  return null;
}

export function validatePassword(pw: string): string | null {
  const v = pw;
  if (!v) return 'Password is required.';
  if (v.length < 8) return 'Password must be at least 8 characters.';
  const hasLetter = /[A-Za-z]/.test(v);
  const hasNumber = /\d/.test(v);
  if (!hasLetter || !hasNumber) return 'Password must include at least one letter and one number.';
  return null;
}

export function validateConfirmPassword(pw: string, confirm: string): string | null {
  const err = validatePassword(confirm);
  if (err) return err;
  if (pw !== confirm) return 'Passwords do not match.';
  return null;
}

export function AuthField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  autoComplete,
  inputMode,
  liveError,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
  error?: string | null;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  // liveError drives only the red border (not the visible helper text)
  liveError?: string | null;
}) {
  const describedById = useMemo(() => {
    const safe = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `err-${safe}`;
  }, [label]);

  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const hasLiveError = !!liveError;
  const borderClass = hasLiveError ? 'border-[rgba(255,59,92,0.55)]' : 'border-white/10';

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white/70 mb-1">
        {label}
        {required ? <span className="text-[#ffb020]"> *</span> : null}
      </label>

      {isPassword ? (
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required={required}
            className={`alarm-input ${borderClass} pr-12`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete={autoComplete}
            inputMode={inputMode}
            aria-invalid={!!error}
            aria-describedby={error ? describedById : undefined}
          />

          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </button>
        </div>
      ) : (
        <input
          type={type}
          required={required}
          className={`alarm-input ${borderClass}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={!!error}
          aria-describedby={error ? describedById : undefined}
        />
      )}

      {error ? (
        <p id={describedById} className="text-sm text-[rgba(255,59,92,0.95)] mt-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}


