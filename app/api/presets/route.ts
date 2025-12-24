import { NextResponse } from 'next/server';
import { FalaiPreset } from '@/lib/types';

export const runtime = 'edge';

export async function GET() {
  const presets: FalaiPreset[] = [
    { id: 'preset_1', name: 'Vibrant Flow', description: 'Dynamic and colorful patterns.', is_premium: false, tier: 'free' },
    { id: 'preset_2', name: 'Cybernetic Bloom', description: 'Futuristic, glowing, and organic.', is_premium: true, tier: 'pro' },
    { id: 'preset_3', name: 'Subtle Hues', description: 'Minimalist, soft, and elegant.', is_premium: false, tier: 'free' },
    { id: 'preset_4', name: 'Geometric Grid', description: 'Sharp lines and intricate geometric forms.', is_premium: true, tier: 'pro' },
    { id: 'preset_5', name: 'Organic Swirl', description: 'Smooth, natural curves and flowing shapes.', is_premium: true, tier: 'pro' },
  ];

  return NextResponse.json(presets);
}