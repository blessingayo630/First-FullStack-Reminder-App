"use client";

import { useEffect, useState } from 'react';

export default function LogoutPopup({
  onDone,
}: {
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('done'), 3500);
    const t2 = window.setTimeout(() => onDone(), 4400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-[2147483647]"
      role="status"
      aria-live="polite"
    >
      <div
        className="card-neon rounded-lg px-4 py-3"
        style={{
          background: '#070912',
          borderColor: 'rgba(255, 59, 92, 0.35)',
          boxShadow: '0 0 24px rgba(255, 59, 92, 0.20)',
          width: 'min(320px, calc(100vw - 2rem))',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 alarm-status-badge"
            style={{
              borderColor: 'rgba(255, 59, 92, 0.35)',
              background: 'rgba(255, 59, 92, 0.10)',
              color: 'rgba(233, 238, 252, 0.98)',
            }}
          >
            <span className="font-bold">!</span>
          </div>

          <div className="min-w-0">
            <div className="font-semibold text-white/95 text-sm sm:text-base truncate">
              {phase === 'loading' ? (
                <span className="inline-flex items-center gap-2">
                  <span className="loader loader--small" />
                  login-out....
                </span>
              ) : (
                'login-out....'
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loader {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 176, 32, 0.35);
          border-top-color: rgba(255, 176, 32, 0.95);
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .loader--small {
          width: 12px;
          height: 12px;
        }
      `}</style>
    </div>
  );
}

