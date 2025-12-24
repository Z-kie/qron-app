'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Wand2 } from 'lucide-react';
import { QRONMode, GeneratedQRON, FalaiPreset, MODES } from '@/lib/types'; // Import MODES
import Link from 'next/link';

declare global {
  interface Window {
    plausible: (eventName: string, options?: { props: Record<string, string | number> }) => void;
  }
}

interface QRGeneratorProps {
  mode: QRONMode;
  onGenerate: (qron: GeneratedQRON) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  presets: FalaiPreset[]; // New prop for dynamic presets
  selectedPresetId: string | null; // New prop for selected preset
  setSelectedPresetId: (id: string | null) => void; // New prop for setting selected preset
  userTier: string; // User's current tier
  generationsUsed: number;
  generationsLimit: number;
}

export function QRGenerator({
  mode,
  onGenerate,
  isGenerating,
  setIsGenerating,
  presets,
  selectedPresetId,
  setSelectedPresetId,
  userTier,
  generationsUsed,
  generationsLimit,
}: QRGeneratorProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Helper to check if user's tier is sufficient for a given feature tier
  const isTierSufficient = (requiredTier: string) => {
    if (requiredTier === 'free') return true;
    if (requiredTier === 'pro' && (userTier === 'pro' || userTier === 'enterprise')) return true;
    if (requiredTier === 'enterprise' && userTier === 'enterprise') return true;
    return false;
  };

  const handleGenerate = async () => {
    if (!targetUrl) {
      toast.error('Please enter a URL');
      return;
    }
    if (!selectedPresetId) {
      toast.error('Please select a style preset');
      return;
    }

    // --- Frontend Tier and Limit Checks ---
    // Check generation limit
    if (userTier !== 'enterprise' && generationsUsed >= generationsLimit) {
      toast.error(`Generation limit reached (${generationsUsed}/${generationsLimit}). Upgrade to increase your limit.`);
      return;
    }

    // Check mode tier
    const selectedModeConfig = MODES.find(m => m.id === mode);
    if (selectedModeConfig && !isTierSufficient(selectedModeConfig.tier)) {
      toast.error(`Upgrade to ${selectedModeConfig.tier.toUpperCase()} to use the ${mode} QRON mode.`);
      return;
    }

    // Check preset tier
    const selectedPreset = presets.find(p => p.id === selectedPresetId);
    if (selectedPreset && selectedPreset.is_premium && !isTierSufficient('pro')) { // Assuming premium presets are 'pro' tier or higher
      toast.error('Upgrade to PRO to use premium style presets.');
      return;
    }
    // --- End Frontend Tier and Limit Checks ---


    // Basic URL validation
    try {
      new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`,
          mode,
          presetId: selectedPresetId, // Use selectedPresetId from props
          prompt: customPrompt || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Generation failed');
      }

      const data = await response.json();
      onGenerate(data.qron);
      toast.success('QRON generated successfully!');
      
      // Track analytics event
      if (typeof window !== 'undefined' && (window as Window & typeof globalThis).plausible) {
        (window as Window & typeof globalThis).plausible('qr_generated', { props: { mode } });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate QRON');
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine if the generate button should be disabled due to limits or tier
  const isGenerateButtonDisabled = isGenerating || !targetUrl ||
                                (userTier !== 'enterprise' && generationsUsed >= generationsLimit) || // Limit reached
                                (MODES.find(m => m.id === mode)?.tier !== 'free' && !isTierSufficient(MODES.find(m => m.id === mode)?.tier || 'free')) || // Mode locked
                                (presets.find(p => p.id === selectedPresetId)?.is_premium && !isTierSufficient('pro')); // Preset locked

  return (
    <div className="qron-card space-y-4">
      <h2 className="text-lg font-semibold">Create Your QRON</h2>

      {/* URL Input */}
      <div>
        <label className="block text-sm text-slate-400 mb-1.5">
          Destination URL
        </label>
        <input
          type="text"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://your-website.com"
          className="qron-input w-full"
          disabled={isGenerating}
        />
      </div>

      {/* Generation Limit Info */}
      {userTier !== 'enterprise' && (
        <p className="text-xs text-slate-500 text-center">
          Generations: {generationsUsed} / {generationsLimit} (
          <Link href="/pricing" className="text-qron-primary hover:underline">
            Upgrade
          </Link>
          )
        </p>
      )}

      {/* Style Presets */}
      <div>
        <label className="block text-sm text-slate-400 mb-1.5">
          Style Preset
        </label>
        {presets.length === 0 ? (
          <p className="text-sm text-slate-500">Loading presets...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const isPresetLocked = preset.is_premium && !isTierSufficient('pro');
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)} // Use setSelectedPresetId from props
                  disabled={isGenerating || isPresetLocked}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all relative ${
                    selectedPresetId === preset.id
                      ? 'bg-qron-primary text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {preset.name}
                  {preset.is_premium && (
                      <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-amber-500 text-black">
                        PRO
                      </span>
                    )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-qron-primary hover:text-qron-secondary transition-colors"
      >
        {showAdvanced ? '− Hide' : '+ Show'} Advanced Options
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-3 pt-2 border-t border-slate-700">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              Custom Prompt (optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the style you want... e.g., 'underwater coral reef with bioluminescent elements'"
              className="qron-input w-full h-20 resize-none"
              disabled={isGenerating}
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerateButtonDisabled}
        className="qron-button w-full flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Generate QRON
          </>
        )}
      </button>

      {/* Generation Info */}
      <p className="text-xs text-slate-500 text-center">
        Generation typically takes 10-30 seconds depending on mode
      </p>
    </div>
  );
}
