'use client';

import Link from 'next/link';
import PopupStatusToast from './components/PopupStatusToast';

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <PopupStatusToast
        variant="error"
        title="404 - Page not found"
        message="The page you’re looking for doesn’t exist."
        durationMs={5500}
      />

      <div className="max-w-3xl mx-auto px-4 pt-20 text-center">
        <div className="card-neon rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white">404</h1>
          <p className="text-white/60 mt-2">The page you’re looking for doesn’t exist.</p>
          <div className="mt-5 flex gap-3 justify-center">
            <Link href="/homepage" className="alarm-btn alarm-btn--primary text-white px-5 py-2 rounded-lg transition">
              Go to Home
            </Link>
            <Link href="/login" className="alarm-btn alarm-btn--ghost text-white px-5 py-2 rounded-lg transition">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

