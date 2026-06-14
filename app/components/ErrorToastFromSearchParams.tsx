'use client';

import { useSearchParams } from 'next/navigation';
import PopupStatusToast from './PopupStatusToast';

export default function ErrorToastFromSearchParams() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') ?? 'Something went wrong';
  const message = searchParams.get('message') ?? undefined;

  return (
    <div className="min-h-screen">
      <PopupStatusToast variant="error" title={title} message={message} durationMs={4500} />
    </div>
  );
}

