'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Success() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (sessionId) {
      // Payment successful!
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Payment Error
            </h1>
            <p className="text-slate-300 mb-6">
              Something went wrong with your payment.
            </p>
            <a
              href="/"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Try Again
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-green-500/20 max-w-md">
        <div className="text-center">
          {/* Success Animation */}
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-slate-300 mb-6">
            Your QR code is being generated and will be delivered to your email within the next 30 seconds.
          </p>

          <div className="bg-purple-900/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-200 mb-2">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-sm text-slate-300 text-left space-y-2">
              <li>✅ Payment confirmed</li>
              <li>⏳ AI generating your QR code</li>
              <li>📧 High-res file sent to your email</li>
              <li>💾 Download and use immediately</li>
            </ul>
          </div>

          <div className="space-y-3">
            <a
              href="/"
              className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Generate Another QR
            </a>
            
            <p className="text-xs text-slate-400">
              Session ID: {sessionId?.substring(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
