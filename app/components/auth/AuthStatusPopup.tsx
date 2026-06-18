'use client';

import { useEffect } from 'react';



import PopupStatusToast, {
  PopupStatusToastVariant,
} from '../PopupStatusToast';

export default function AuthStatusPopup({
  variant,
  title,
  message,
  durationMs = 3500,
  redirectTo,
}: {
  variant: PopupStatusToastVariant;
  title: string;
  message?: string;
  durationMs?: number;
  redirectTo?: string;
}) {
  // Optional: if redirectTo is provided, redirect after durationMs.
  useEffect(() => {
    if (!redirectTo) return;

    if (durationMs <= 0) {
      window.location.href = redirectTo;
      return;
    }

    const t = window.setTimeout(() => {
      // Wait a tiny bit after the toast hides to ensure the user actually sees it
      // even on fast transitions / under heavy React updates.
      window.location.href = redirectTo;
    }, Math.max(0, durationMs + 250));


    return () => window.clearTimeout(t);
  }, [durationMs, redirectTo]);

  return (
    <PopupStatusToast
      variant={variant}
      title={title}
      message={message}
      durationMs={durationMs}
    />
  );
}


