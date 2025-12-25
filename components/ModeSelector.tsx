'use client';

import { QRONMode, QRONModeConfig, MODES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Layers3, 
  Play, 
  Star, 
  Wallet, 
  Radio,
  Clock,
  Zap,
  Layers,
  Box,
  Heart
} from 'lucide-react';

const IconMap = {
  sparkles: Sparkles,
  layers3: Layers3,
  play: Play,
  star: Star,
  wallet: Wallet,
  radio: Radio,
  clock: Clock,
  zap: Zap,
  layers: Layers,
  box: Box,
  heart: Heart,
};

interface ModeSelectorProps {
  selectedMode: QRONMode;
  onModeChange: (mode: QRONMode) => void;
  userTier: string; // New prop for user's current tier
}

export function ModeSelector({ selectedMode, onModeChange, userTier }: ModeSelectorProps) {
  const isTierSufficient = (requiredTier: string) => {
    if (requiredTier === 'free') return true;
    if (requiredTier === 'pro' && (userTier === 'pro' || userTier === 'enterprise')) return true;
    if (requiredTier === 'enterprise' && userTier === 'enterprise') return true;
    return false;
  };

  const handleModeChange = (modeId: QRONMode, modeTier: string) => {
    if (!isTierSufficient(modeTier)) {
      toast.error(`Upgrade to ${modeTier.toUpperCase()} to unlock the ${modeId} QRON mode.`);
      return;
    }
    onModeChange(modeId);
  };

  return (
    <div className="qron-card">
      <h2 className="text-lg font-semibold mb-4">Select QRON Mode</h2>
      
      <div className="max-h-64 overflow-y-auto p-2 rounded-lg bg-slate-900/50">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {MODES.map((mode) => {
          const Icon = IconMap[mode.icon as keyof typeof IconMap];
          const isSelected = selectedMode === mode.id;
          const isLocked = !isTierSufficient(mode.tier); // Lock if user's tier is not sufficient
          
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id, mode.tier)}
              disabled={isLocked}
              className={cn(
                'relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200',
                'border hover:border-qron-primary/50',
                isSelected
                  ? 'bg-qron-gradient border-transparent text-white shadow-lg shadow-qron-primary/25'
                  : 'bg-slate-800/50 border-slate-700 text-slate-200',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Tier Badge */}
              {mode.tier !== 'free' && (
                <span className={cn(
                  'absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                  mode.tier === 'pro' ? 'bg-amber-500 text-black' : 'bg-purple-500 text-white'
                )}>
                  {mode.tier === 'pro' ? 'PRO' : 'ENT'}
                </span>
              )}
              
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{mode.name}</span>
            </button>
          );
                  })}
                </div>
              </div>      
      {/* Selected Mode Description */}
      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {(() => {
            const mode = MODES.find(m => m.id === selectedMode);
            const Icon = mode ? IconMap[mode.icon as keyof typeof IconMap] : Sparkles;
            return <Icon className="w-4 h-4 text-qron-primary" />;
          })()}
          <span className="font-medium">
            {MODES.find(m => m.id === selectedMode)?.name}
          </span>
        </div>
        <p className="text-sm text-slate-200">
          {MODES.find(m => m.id === selectedMode)?.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {MODES.find(m => m.id === selectedMode)?.features.map((feature) => (
            <span key={feature} className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-200">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
