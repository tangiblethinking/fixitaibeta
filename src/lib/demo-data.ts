import type { DiagnosticOutput } from './types';

export const DEMO_DIAGNOSIS: DiagnosticOutput = {
  diagnosis: {
    summary:
      'The P-trap under your bathroom sink is leaking at the slip-joint connection. Water is seeping from the compression nut where the curved trap meets the tailpiece coming down from the drain.',
    rootCause:
      'The nylon slip-joint washer inside the compression nut has hardened and cracked with age, breaking the seal. This is the most common cause of under-sink leaks in homes over 10 years old.',
    recommendedTrade: 'Plumber',
  },
  parts: [
    {
      name: '1-1/4" P-Trap Kit (PVC)',
      specs: 'PVC, 1-1/4" outlet diameter, includes trap arm and all washers',
      estimatedCost: '$6 – $12',
    },
    {
      name: 'Slip-Joint Washers (backup pack)',
      specs: '1-1/4" nylon beveled washers, 3-pack',
      estimatedCost: '$2 – $4',
    },
    {
      name: 'Plumber\'s Tape (PTFE)',
      specs: '1/2" x 260" standard thread seal tape',
      estimatedCost: '$1 – $3',
    },
  ],
  difficulty: {
    level: 'Easy',
    score: 2,
    explanation:
      'No special tools required. Hand-tighten only — over-tightening cracks PVC fittings. A bucket and towel are all you need beyond the replacement parts. Most first-timers finish in 15–20 minutes.',
  },
  estimatedTotalCost: '$9 – $19',
  assumptions: [
    'Standard 1-1/4" bathroom sink drain (most common residential size)',
    'PVC or ABS drain piping (not chromed brass or cast iron)',
    'No corrosion or damage to the wall drain fitting',
    'Standard cabinet access — no unusually tight spaces',
  ],
};

export const DEMO_IMAGE_URL = '/onboarding/demo-ptrap.jpg';
