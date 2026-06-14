'use client';

import { useSearchParams } from 'next/navigation';
import PopupStatusToast from '../components/PopupStatusToast';

export default function SuccessToastClient() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') ?? 'Success';
  const message = searchParams.get('message') ?? undefined;

  return (
    <div className="min-h-screen">
      <PopupStatusToast
        variant="success"
        title={title}
        message={message}
        durationMs={3500}
      />
    </div>
  );
}

