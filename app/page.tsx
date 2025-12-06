'use client';

import { useState } from 'react';
import { Sparkles, Download, Share2, CreditCard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const MODES = [
  { id: 'classic', name: 'Classic', price: 5 },
  { id: 'stereographic', name: '3D', price: 10 },
  { id: 'kinetic', name: 'Motion', price: 10 },
  { id: 'holographic', name: 'Holo', price: 15 },
  { id: 'phantom', name: 'Phantom', price: 15 },
  { id: 'cascade', name: 'Cascade', price: 12 },
  { id: 'prism', name: 'Prism', price: 12 },
  { id: 'nebula', name: 'Nebula', price: 10 },
  { id: 'video', name: 'Video', price: 30 },
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('holographic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const selectedMode = MODES.find(m => m.id === mode);

  const handlePreview = async () => {
    if (!url || !prompt) {
      setError('Please enter both URL and prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, prompt, mode }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.imageUrl);
        setShowPayment(true);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!email) {
      setError('Please enter your email for delivery');
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, url, prompt, email }),
      });

      const { url: checkoutUrl } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError('Payment setup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            QRON Generator
          </h1>
          <p className="text-xl text-purple-200">
            AI-Powered Living QR Codes
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
          
          {/* Mode Selector */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">
              Select Mode (${selectedMode?.price}/generation)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    mode === m.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Destination URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Design Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="cyberpunk neon city, futuristic, glowing"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
            />
            <p className="text-sm text-slate-400 mt-2">
              Examples: "cosmic nebula", "digital rain matrix", "golden sunset"
            </p>
          </div>

          {/* Email Input (if payment shown) */}
          {showPayment && (
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                Email (for delivery)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {/* Generate Button */}
          {!showPayment && (
            <button
              onClick={handlePreview}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Preview...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Preview QR Code (Free)
                </>
              )}
            </button>
          )}

          {/* Payment Button */}
          {showPayment && result && (
            <button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Pay ${selectedMode?.price} & Get High-Res
            </button>
          )}

          {/* Result Display */}
          {result && (
            <div className="mt-8 space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={result} 
                  alt="Generated QR Code" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-xl"
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">
                  This is a preview. Pay to get high-resolution file delivered to your email.
                </p>
                <p className="text-lg font-semibold text-purple-400">
                  💎 ${selectedMode?.price} for full quality
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trust Signals */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-400 text-sm">
            ✓ Instant delivery  •  ✓ 100% scannable  •  ✓ High-resolution
          </p>
          <p className="text-slate-500 text-xs">
            Powered by Fal.ai • Secure payment by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
