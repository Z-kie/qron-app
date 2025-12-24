export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '10 Generations/Month',
      'Static Mode Only',
      'Basic Styles',
      'Supabase Auth',
    ],
    cta: 'Get Started Free',
    tier_level: 'free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    price_suffix: '/month',
    features: [
      'Unlimited Generations',
      'All Modes (except Enterprise)',
      'Premium Styles',
      'Plausible.io Analytics',
    ],
    cta: 'Go Pro',
    tier_level: 'pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    price_suffix: '/month',
    features: [
      'Unlimited Generations',
      'All Modes',
      'API Access & White-Label',
      'Priority Support',
      'Custom Integrations',
    ],
    cta: 'Contact Sales',
    tier_level: 'enterprise',
  },
];
