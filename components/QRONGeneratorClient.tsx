'use client';

import { ModeSelector } from '@/components/ModeSelector';
import { QRGenerator } from '@/components/QRGenerator';
import { QRDisplay } from '@/components/QRDisplay';
import { FeaturedQRONs } from '@/components/FeaturedQRONs';
import { useState, useEffect } from 'react';
import { FalaiPreset, GeneratedQRON, QRONMode } from '@/lib/types';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client'; // Import createClient for fetching profile

interface QRONGeneratorClientProps {
  user: User; // User is guaranteed to be present as checked in app/page.tsx
}

export default function QRONGeneratorClient({ user }: QRONGeneratorClientProps) {
  const [mode, setMode] = useState<QRONMode>('static');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQRON, setGeneratedQRON] = useState<GeneratedQRON | null>(null);
  const [presets, setPresets] = useState<FalaiPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>('free'); // Default to free
  const [generationsUsed, setGenerationsUsed] = useState<number>(0);
  const [generationsLimit, setGenerationsLimit] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    // Fetch presets when component mounts
    const fetchPresets = async () => {
      const response = await fetch('/api/presets');
      const data = await response.json();
      setPresets(data);
      // Select the first non-premium preset by default
      const firstNonPremium = data.find((p: FalaiPreset) => !p.is_premium);
      if (firstNonPremium) {
        setSelectedPresetId(firstNonPremium.id);
      }
    };
    fetchPresets();
  }, []);

  useEffect(() => {
    // Fetch user profile for tier and generation limits
    const fetchProfile = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('tier, generations_used, generations_limit')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (profile) {
        setUserTier(profile.tier);
        setGenerationsUsed(profile.generations_used);
        setGenerationsLimit(profile.generations_limit);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user, supabase]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ModeSelector selectedMode={mode} onModeChange={setMode} userTier={userTier} />
          <QRGenerator
            mode={mode}
            onGenerate={setGeneratedQRON}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            presets={presets}
            selectedPresetId={selectedPresetId}
            setSelectedPresetId={setSelectedPresetId}
            userTier={userTier} // Pass userTier
            generationsUsed={generationsUsed} // Pass generationsUsed
            generationsLimit={generationsLimit} // Pass generationsLimit
          />
        </div>
        <div>
          <QRDisplay qron={generatedQRON} isGenerating={isGenerating} mode={mode} />
        </div>
      </div>

      <div className="mt-16">
        <FeaturedQRONs />
      </div>
    </div>
  );
}
