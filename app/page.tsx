'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Download, CreditCard, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { MODES, FalaiPreset, QRONMode } from '@/lib/types';
import { PLANS } from '@/lib/plans';

export default function Home() {
  const supabase = createClient();

  const [targetUrl, setTargetUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedMode, setSelectedMode] = useState<QRONMode>(MODES[0]);
  const [presetId, setPresetId] = useState<string>(''); // Placeholder for actual preset ID
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [userTier, setUserTier] = useState('free'); // Default to free
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [generationsLimit, setGenerationsLimit] = useState(10);
  const [presets, setPresets] = useState<FalaiPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<FalaiPreset | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tier, generations_used, generations_limit')
          .eq('id', user.id)
          .single();

        if (profile && !profileError) {
          setUserTier(profile.tier);
          setGenerationsUsed(profile.generations_used);
          setGenerationsLimit(profile.generations_limit);
        }
      }
    };

    const fetchPresets = async () => {
      // Assuming you have an API endpoint to list Fal.ai presets
      // For now, using a placeholder if API is not yet implemented
      const dummyPresets: FalaiPreset[] = [
        { id: 'preset_1', name: 'Vibrant Flow', is_premium: false, tier: 'free' },
        { id: 'preset_2', name: 'Cybernetic Bloom', is_premium: true, tier: 'pro' },
        { id: 'preset_3', name: 'Subtle Hues', is_premium: false, tier: 'free' },
      ];
      setPresets(dummyPresets);
      setSelectedPreset(dummyPresets[0]);
      setPresetId(dummyPresets[0].id);
    };

    fetchUserData();
    fetchPresets();
  }, []);

  const isTierSufficient = (requiredTier: string) => {
    if (requiredTier === 'free') return true;
    if (requiredTier === 'pro' && (userTier === 'pro' || userTier === 'enterprise')) return true;
    if (requiredTier === 'enterprise' && userTier === 'enterprise') return true;
    return false;
  };

  const handleGenerate = async () => {
    if (!targetUrl || !prompt || !selectedMode || !presetId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          prompt,
          presetId: selectedPreset?.id,
          mode: selectedMode.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.qron.imageUrl);
        setGenerationsUsed(prev => prev + 1); // Optimistically update count
      } else {
        setError(data.message || 'Generation failed.');
      }
    } catch (err) {
      setError('Network error or unexpected response.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (plan?.price === 0) {
        // Free plan, might trigger a signup flow or just update user tier
        console.log('User selected Free plan');
    } else if (planId === 'enterprise') {
        window.location.assign('mailto:sales@qron.space');
    } else {
        // Redirect to Stripe checkout for Pro plan
        // This is a placeholder for actual Stripe checkout logic
        console.log(`Redirecting to checkout for ${plan?.name}`);
    }
  };

  const userPlan = PLANS.find(p => p.id === userTier) || PLANS[0];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            QRON Generator
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 font-light mb-4">
            Artistic, on-brand QR experiences that increase scans and engagement.
          </p>
          <p className="text-lg text-purple-300">
            Custom QR codes can lift scan and conversion rates by roughly 20-30%.
          </p>
        </div>

        {/* Generator Section */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 shadow-2xl mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Your QRON</h2>

          {/* User Tier & Limits */}
          <div className="text-center text-sm text-purple-300 mb-6">
            <p>Current Plan: {userPlan?.name.toUpperCase()} (Generations: {generationsUsed}/{generationsLimit})</p>
            {userTier !== 'enterprise' && generationsUsed >= generationsLimit && (
                <p className="text-red-400 mt-2">Generation limit reached. Please upgrade your plan.</p>
            )}
          </div>

          {/* Target URL Input */}
          <div className="mb-4">
            <label htmlFor="targetUrl" className="block text-white font-semibold mb-2">
              Destination URL
            </label>
            <input
              type="url"
              id="targetUrl"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Prompt Input */}
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-white font-semibold mb-2">
              Creative Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cyberpunk city skyline at dusk with neon lights reflecting on wet streets"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Mode Selector */}
          <div className="mb-4">
            <label htmlFor="mode" className="block text-white font-semibold mb-2">
              QRON Mode
            </label>
            <select
              id="mode"
              value={selectedMode.id}
              onChange={(e) => {
                const mode = MODES.find(m => m.id === e.target.value);
                if (mode) setSelectedMode(mode);
              }}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            >
              {MODES.map((modeOption) => (
                <option key={modeOption.id} value={modeOption.id} disabled={!isTierSufficient(modeOption.tier)}>
                  {modeOption.name} ({modeOption.tier === 'free' ? 'Free' : `Requires ${modeOption.tier.toUpperCase()}`})
                </option>
              ))}
            </select>
            {!isTierSufficient(selectedMode.tier) && (
              <p className="text-red-400 text-sm mt-2">
                Your current plan ({userPlan?.name.toUpperCase()}) does not support the {selectedMode.name} mode. Please upgrade.
              </p>
            )}
          </div>

          {/* Preset Selector */}
          <div className="mb-6">
            <label htmlFor="preset" className="block text-white font-semibold mb-2">
              Style Preset
            </label>
            <select
              id="preset"
              value={selectedPreset?.id || ''}
              onChange={(e) => {
                const preset = presets.find(p => p.id === e.target.value);
                if (preset) {
                  setSelectedPreset(preset);
                  setPresetId(preset.id);
                }
              }}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            >
              {presets.map((presetOption) => (
                <option key={presetOption.id} value={presetOption.id} disabled={presetOption.is_premium && !isTierSufficient('pro')}>
                  {presetOption.name} {presetOption.is_premium ? '(Premium)' : ''}
                </option>
              ))}
            </select>
            {selectedPreset?.is_premium && !isTierSufficient('pro') && (
              <p className="text-red-400 text-sm mt-2">
                This is a premium preset. Please upgrade to a Pro plan to use it.
              </p>
            )}
          </div>


          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !isTierSufficient(selectedMode.tier) || (generationsUsed >= generationsLimit && userTier !== 'enterprise')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating QRON...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate QRON
              </>
            )}
          </button>

          {/* Result Display */}
          {result && (
            <div className="mt-8 space-y-4 text-center">
              <h3 className="text-xl font-bold text-white">Your QRON is Ready!</h3>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={result}
                  alt="Generated QRON Code"
                  className="w-full max-w-sm mx-auto rounded-lg shadow-xl"
                />
              </div>
              <p className="text-purple-300">Scan this code to test it out.</p>
              <a
                href={result}
                download={`${selectedMode.id}-qron-${Date.now()}.png`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                <Download className="w-5 h-5" />
                Download QRON
              </a>
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-8">Choose Your Plan</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border ${plan.id === userTier ? 'border-purple-500' : 'border-purple-500/20'} shadow-2xl flex flex-col`}>
              <h2 className="text-3xl font-bold text-white mb-4">{plan.name}</h2>
              {plan.price === 0 ? (
                <p className="text-5xl font-bold mb-6">Free</p>
              ) : (
                <p className="text-5xl font-bold mb-6">${plan.price}<span className="text-lg font-normal">{plan.price_suffix}</span></p>
              )}
              <ul className="space-y-4 mb-8 text-purple-200 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.id)}
                className={`w-full font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  plan.id === userTier
                    ? 'bg-purple-700 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                }`}
                disabled={plan.id === userTier}
              >
                <CreditCard className="w-5 h-5" />
                {plan.id === userTier ? 'Current Plan' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-400 text-sm">
            ✓ 100% scannable guarantee • ✓ Real-time AI generation • ✓ Secure user authentication
          </p>
          <p className="text-slate-500 text-xs">
            Powered by Fal.ai • Supabase • Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
