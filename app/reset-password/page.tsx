   // 'use client';

// import React, { useMemo, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import AuthFormShell from '../components/auth/AuthFormShell';
// import { AuthField, validateConfirmPassword, validatePassword } from '../components/auth/inputs';

// type FormState = {
//   password: string;
//   confirmPassword: string;
// };

// export default function ResetPasswordPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // const token = searchParams.get('token') || '';

//   const [form, setForm] = useState<FormState>({ password: '', confirmPassword: '' });
//   const [errors, setErrors] = useState<Partial<Record<keyof FormState, string | null>>>({});
//   const [submitting, setSubmitting] = useState(false);
//   const [done, setDone] = useState(false);

//   const computed = useMemo(() => {
//     return {
//       password: validatePassword(form.password),
//       confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
//     };
//   }, [form.password, form.confirmPassword]);

//   // const canSubmit = Object.values(computed).every((v) => !v) && !!token;

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();

//     setErrors(computed);
//     // if (!canSubmit) {
//     //   if (!token) setErrors((prev) => ({ ...prev, password: 'Missing reset token.' }));
//     //   return;
//     // }

//     try {
//       setSubmitting(true);

//       const res = await fetch('/api/auth/reset-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token, password: form.password, confirmPassword: form.confirmPassword }),
//       });

//       const data = await res.json().catch(() => null);

//       if (!res.ok) {
//         setErrors((prev) => ({
//           ...prev,
//           password: data?.error ? String(data.error) : prev.password,
//         }));
//         return;
//       }

//       setDone(true);
//     } catch {
//       // no-op
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <AuthFormShell
//       title="Reset Password"
//       subtitle="Choose a new password."
//       footer={
//         <div className="text-white/70 text-sm flex items-center justify-between">
//           <button type="button" className="text-[#ffb020] hover:text-[#ff7a18] underline" onClick={() => router.push('/login')}>
//             Back to login
//           </button>
//         </div>
//       }
//     >
//       {done ? (
//         <div className="text-white/70 text-sm">
//           Your password has been updated.
//           <div className="mt-5">
//             <button
//               type="button"
//               className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition"
//               onClick={() => router.push('/login')}
//             >
//               Go to Login
//             </button>
//           </div>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit}>
//           {!token ? (
//             <div className="mb-4 text-sm text-[rgba(255,59,92,0.95)]">
//               Missing reset token in URL.
//             </div>
//           ) : null}

//           <AuthField
//             label="New Password"
//             type="password"
//             required
//             placeholder="New password"
//             value={form.password}
//             onChange={(next) => setForm((p) => ({ ...p, password: next }))}
//             error={errors.password}
//             autoComplete="new-password"
//           />

//           <AuthField
//             label="Confirm New Password"
//             type="password"
//             required
//             placeholder="Confirm new password"
//             value={form.confirmPassword}
//             onChange={(next) => setForm((p) => ({ ...p, confirmPassword: next }))}
//             error={errors.confirmPassword}
//             autoComplete="new-password"
//           />

//           <div className="mt-6 flex flex-col gap-3">
//             <button
//               type="submit"
//               disabled={submitting}
//               className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition"
//             >
//               {submitting ? 'Updating...' : 'Update Password'}
//             </button>
//           </div>
//         </form>
//       )}
//     </AuthFormShell>
//   );
// }


// 'use client';

// import React, { useMemo, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import AuthFormShell from '../components/auth/AuthFormShell';
// import { AuthField, validateConfirmPassword, validatePassword } from '../components/auth/inputs';
// import { supabase } from '@/lib/supabase';

// type FormState = {
//   password: string;
//   confirmPassword: string;
// };

// export default function ResetPasswordPage() {
//   const router = useRouter();

//   const [form, setForm] = useState<FormState>({
//     password: '',
//     confirmPassword: '',
//   });

//   // const [errors, setErrors] = useState<any>({});
//   const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
//   const [submitting, setSubmitting] = useState(false);
//   const [done, setDone] = useState(false);

//   useEffect(() => {
//     // THIS is what processes the reset token from URL (#access_token)
//     supabase.auth.getSession();
//   }, []);

//   const computed = useMemo(() => {
//     return {
//       password: validatePassword(form.password),
//       confirmPassword: validateConfirmPassword(
//         form.password,
//         form.confirmPassword
//       ),
//     };
//   }, [form.password, form.confirmPassword]);

//   const canSubmit = Object.values(computed).every((v) => !v);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();

//     setErrors(computed);
//     if (!canSubmit) return;

//     try {
//       setSubmitting(true);

//       const { error } = await supabase.auth.updateUser({
//         password: form.password,
//       });

//       if (error) {
//         setErrors({ password: error.message });
//         return;
//       }

//       setDone(true);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <AuthFormShell title="Reset Password" subtitle="Choose a new password.">
//       {done ? (
//         <div>
//           Password updated successfully
//           <button onClick={() => router.push('/login')}>
//             Go to Login
//           </button>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit}>
//           <AuthField
//             label="New Password"
//             type="password"
//             value={form.password}
//             onChange={(v) => setForm((p) => ({ ...p, password: v }))}
//             error={errors.password}
//           />


//           <AuthField
//             label="Confirm Password"
//             type="password"
//             value={form.confirmPassword}
//             onChange={(v) =>
//               setForm((p) => ({ ...p, confirmPassword: v }))
//             }
//             error={errors.confirmPassword}
//           />

//           <button type="submit" disabled={submitting}>
//             {submitting ? 'Updating...' : 'Update Password'}
//           </button>
//         </form>
//       )}
//     </AuthFormShell>
//   );
// }

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthFormShell from '../components/auth/AuthFormShell';
import {
  AuthField,
  validateConfirmPassword,
  validatePassword,
} from '../components/auth/inputs';
import { supabase } from '@/lib/supabase';

type FormState = {
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function ResetPasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Processes reset token from URL (#access_token)
    supabase.auth.getSession();
  }, []);

  const computed = useMemo<FormErrors>(() => {
    return {
      password: validatePassword(form.password) ?? undefined,
      confirmPassword:
        validateConfirmPassword(
          form.password,
          form.confirmPassword
        ) ?? undefined,
    };
  }, [form.password, form.confirmPassword]);

  const canSubmit = Object.values(computed).every((v) => !v);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrors({
      password: computed.password ?? undefined,
      confirmPassword: computed.confirmPassword ?? undefined,
    });

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const { error } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (error) {
        setErrors({ password: error.message });
        return;
      }

      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title="Reset Password"
      subtitle="Choose a new password."
    >
      {done ? (
        <div>
          Password updated successfully
          <div className="mt-5">
            <button
              type="button"
              className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition"
              onClick={() => router.push('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <AuthField
            label="New Password"
            type="password"
            value={form.password}
            onChange={(v) =>
              setForm((p) => ({ ...p, password: v }))
            }
            error={errors.password}
          />

          <AuthField
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                confirmPassword: v,
              }))
            }
            error={errors.confirmPassword}
          />

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="alarm-btn alarm-btn--primary cursor-pointer text-white px-4 py-2 rounded-lg transition"
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </AuthFormShell>
  );
}