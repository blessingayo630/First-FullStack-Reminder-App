'use client';

import { useEffect, useMemo, useState } from 'react';

export type PopupStatusToastVariant = 'success' | 'error';

export default function PopupStatusToast({
  variant,
  title,
  message,
  durationMs = 3500,
  onClose,
}: {
  variant: PopupStatusToastVariant;
  title: string;
  message?: string;
  durationMs?: number;
  onClose?: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (durationMs <= 0) return;
    const t = window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs, onClose]);

  const styles = useMemo(() => {
    if (variant === 'success') {
      return {
        border: 'rgba(34, 197, 94, 0.35)',
        glow: 'rgba(34, 197, 94, 0.20)',
        badgeBg: 'rgba(34, 197, 94, 0.10)',
        badgeText: 'rgba(233, 238, 252, 0.98)',
        icon: '✓',
      };
    }

    return {
      border: 'rgba(255, 59, 92, 0.35)',
      glow: 'rgba(255, 59, 92, 0.20)',
      badgeBg: 'rgba(255, 59, 92, 0.10)',
      badgeText: 'rgba(233, 238, 252, 0.98)',
      icon: '!',
    };
  }, [variant]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-[2147483647]"
      role="status"
      aria-live="polite"
    >
      <div
        className="card-neon rounded-lg px-4 py-3"
        style={{
          // Make toast background fully opaque so underlying header UI can’t show through.
          background: '#070912',
          borderColor: styles.border,
          boxShadow: `0 0 24px ${styles.glow}`,
          width: 'min(320px, calc(100vw - 2rem))',
        }}

      >
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 alarm-status-badge"
            style={{
              borderColor: styles.border,
              background: styles.badgeBg,
              color: styles.badgeText,
            }}
          >
            <span className="font-bold">{styles.icon}</span>
          </div>

          <div className="min-w-0">
            <div className="font-semibold text-white/95 text-sm sm:text-base truncate">
              {title}
            </div>
            {message ? (
              <div className="text-white/70 text-sm mt-0.5 leading-snug">
                {message}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

