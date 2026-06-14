import { Suspense } from 'react';
import SuccessToastClient from './SuccessToastClient';

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessToastClient />
    </Suspense>
  );
}


