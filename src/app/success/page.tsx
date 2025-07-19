'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';

function SessionLogger() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      console.log('Payment successful for session:', sessionId);
    }
  }, [sessionId]);

  return null;
}

export default function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Thank you for your order. We&apos;ll start printing your model soon.</p>
        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Return to Home</Link>
      </div>
      <Suspense fallback={null}>
        <SessionLogger />
      </Suspense>
    </div>
  );
} 