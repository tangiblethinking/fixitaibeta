export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  robot_name: string | null;
  role: 'homeowner' | 'contractor' | 'store' | 'creator' | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyRecord {
  id: string;
  user_id: string;
  encrypted_key: string;
  iv: string;
  created_at: string;
}

export interface DiagnosticOutput {
  diagnosis: {
    summary: string;
    rootCause: string;
    recommendedTrade: string;
  };
  parts: Array<{
    name: string;
    specs: string;
    estimatedCost: string;
  }>;
  difficulty: {
    level: 'Easy' | 'Moderate' | 'Hard' | 'Expert';
    score: number;
    explanation: string;
  };
  estimatedTotalCost: string;
  assumptions: string[];
  // Future fields (captured but not rendered in Phase 1)
  videoSearchTerm?: string;
  estimatedProCost?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    name: string;
  };
  diagnosticOutput?: DiagnosticOutput;
  timestamp: Date;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: 'tos' | 'privacy' | 'camera' | 'microphone' | 'location';
  version: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  role: 'contractor' | 'store' | 'creator';
  created_at: string;
}
