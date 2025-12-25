// Define QRONMode enum or type
export type QRONMode = 'static' | 'stereographic' | 'kinetic' | 'holographic' | 'memory' | 'echo' | 'temporal' | 'reactive' | 'layered' | 'dimensional' | 'living';

// Define GeneratedQRON interface
export interface GeneratedQRON {
  id: string;
  imageUrl: string;
  destinationUrl: string;
  // Add other properties as needed based on usage
}

// Define QRONEntry type
export type QRONEntry = {
  id: string;
  user_id: string;
  mode: QRONMode;
  qr_content: string;
  ai_prompt: string;
  storage_path: string; // e.g., /demo-qrons/image.png
  is_demo: boolean;
  scan_count: number;
  download_count?: number; // Added from database
  folder_id?: string | null; // Added from database
  qron_tags?: { tag_id: string }[]; // Added for join
  created_at: string;
  updated_at?: string; // Added from database
};

// Define FalaiPreset type (moved from app/page.tsx for better organization)
export type FalaiPreset = {
  id: string;
  name: string;
  description: string;
  is_premium: boolean;
  tier: 'free' | 'pro' | 'enterprise';
};

// Define QRONModeConfig interface
export interface QRONModeConfig {
  id: QRONMode; // Changed from 'mode' to 'id' for consistency with MODES array in ModeSelector
  name: string;
  description: string;
  icon: string; // Assuming icon is a string representing icon name
  tier: 'free' | 'pro' | 'enterprise'; // Added tier
  features: string[]; // Added features
}

export const MODES: QRONModeConfig[] = [
  {
    id: 'static',
    name: 'Static',
    description: 'AI-styled QR code',
    icon: 'sparkles',
    tier: 'free',
    features: ['AI styling', 'High resolution', 'Instant generation'],
  },
  {
    id: 'stereographic',
    name: 'Stereographic',
    description: '3D depth effect',
    icon: 'layers3',
    tier: 'free',
    features: ['3D depth', 'Parallax effect', 'Cross-eye viewable'],
  },
  {
    id: 'kinetic',
    name: 'Kinetic',
    description: 'Animated motion QR',
    icon: 'play',
    tier: 'pro',
    features: ['Video output', 'Smooth animation', 'Loop-ready'],
  },
  {
    id: 'holographic',
    name: 'Holographic',
    description: 'Shimmer & shift',
    icon: 'star',
    tier: 'pro',
    features: ['Color shift', 'Holographic foil', 'Premium look'],
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Mint as NFT',
    icon: 'wallet',
    tier: 'pro',
    features: ['On-chain', 'Own forever', 'Tradeable'],
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Ultrasonic enabled',
    icon: 'radio',
    tier: 'pro',
    features: ['Sound trigger', 'Proximity detect', 'Chirp.io'],
  },
  {
    id: 'temporal',
    name: 'Temporal',
    description: 'Time-based evolution',
    icon: 'clock',
    tier: 'enterprise',
    features: ['Scheduled changes', 'Day/night modes', 'Event triggers'],
  },
  {
    id: 'reactive',
    name: 'Reactive',
    description: 'Environment-aware',
    icon: 'zap',
    tier: 'enterprise',
    features: ['Weather sync', 'Location aware', 'Context adaptive'],
  },
  {
    id: 'layered',
    name: 'Layered',
    description: 'Multi-composition',
    icon: 'layers',
    tier: 'enterprise',
    features: ['Multiple layers', 'Blend modes', 'Complex designs'],
  },
  {
    id: 'dimensional',
    name: 'Dimensional',
    description: 'AR-ready spatial',
    icon: 'box',
    tier: 'enterprise',
    features: ['AR compatible', 'Spatial anchor', '3D placement'],
  },
  {
    id: 'living',
    name: 'Living',
    description: 'Self-evolving AI',
    icon: 'heart',
    tier: 'enterprise',
    features: ['AI evolution', 'Learns & adapts', 'Truly alive'],
  },
];
