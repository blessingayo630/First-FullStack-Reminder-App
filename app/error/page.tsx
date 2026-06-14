import { Suspense } from 'react';
import ErrorToastFromSearchParams from '../components/ErrorToastFromSearchParams';

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <div className="flex items-center justify-center min-h-screen">Loading...</div>
        </div>
      }
    >
      <ErrorToastFromSearchParams />
    </Suspense>
  );
}


