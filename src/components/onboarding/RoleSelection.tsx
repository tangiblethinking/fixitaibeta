'use client';

import { useState } from 'react';
import { Home, Hammer, Store, Video } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface RoleSelectionProps {
  userEmail: string;
  onContinue: () => void;
}

const ROLES = [
  {
    id: 'homeowner' as const,
    label: 'Homeowner',
    description: 'Diagnose and fix things around my home',
    icon: Home,
    active: true,
  },
  {
    id: 'contractor' as const,
    label: 'Contractor',
    description: 'Manage clients and grow my business',
    icon: Hammer,
    active: false,
  },
  {
    id: 'store' as const,
    label: 'Hardware Store',
    description: 'Help customers find the right parts',
    icon: Store,
    active: false,
  },
  {
    id: 'creator' as const,
    label: 'Creator / Influencer',
    description: 'Feature my repair videos to DIYers',
    icon: Video,
    active: false,
  },
];

export default function RoleSelection({
  userEmail,
  onContinue,
}: RoleSelectionProps) {
  const [waitlistRole, setWaitlistRole] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState(userEmail);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState<Set<string>>(
    new Set()
  );
  const [submitting, setSubmitting] = useState(false);

  const handleWaitlist = async (role: string) => {
    if (waitlistSubmitted.has(role)) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.from('waitlist').insert({
        email: waitlistEmail,
        role,
      });
      setWaitlistSubmitted((prev) => new Set(prev).add(role));
      setWaitlistRole(null);
    } catch {
      // Silently fail — non-critical
    }
    setSubmitting(false);
  };

  return (
    <div className="page-container">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-display font-display text-ink-900 mb-2">
          How will you use FixIt AI?
        </h1>
        <p className="text-body text-ink-500 mb-8">
          Select your role to get started.
        </p>

        <div className="space-y-3">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSubmitted = waitlistSubmitted.has(role.id);

            return (
              <div key={role.id}>
                <button
                  onClick={() => {
                    if (role.active) {
                      onContinue();
                    } else {
                      setWaitlistRole(
                        waitlistRole === role.id ? null : role.id
                      );
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-card border transition-all min-h-[72px] text-left ${
                    role.active
                      ? 'border-brand-300 bg-brand-50 hover:border-brand-400'
                      : 'border-ink-200 bg-surface-raised hover:border-ink-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      role.active ? 'bg-brand-500' : 'bg-ink-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        role.active ? 'text-white' : 'text-ink-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-body font-medium ${
                          role.active ? 'text-ink-900' : 'text-ink-600'
                        }`}
                      >
                        {role.label}
                      </span>
                      {!role.active && !isSubmitted && (
                        <span className="text-caption text-ink-400 bg-ink-100 px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="text-caption text-success bg-success-light px-2 py-0.5 rounded-full">
                          On the list
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-ink-400 mt-0.5">
                      {role.description}
                    </p>
                  </div>
                </button>

                {/* Waitlist expansion */}
                {waitlistRole === role.id && !isSubmitted && (
                  <div className="mt-2 ml-14 mr-4 space-y-3">
                    <Input
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="your@email.com"
                      type="email"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleWaitlist(role.id)}
                      loading={submitting}
                    >
                      Join waitlist
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-caption text-ink-400 mt-6 text-center">
          You can always change this later in Settings.
        </p>
      </div>
    </div>
  );
}
