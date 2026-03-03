'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main login page (home page)
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-gray-600">กำลังเปลี่ยนเส้นทาง...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <LoginRedirect />
    </Suspense>
  );
}

