'use client';

import { Bot, Key } from 'lucide-react';
import { Button } from '@/components/ui';

interface RobotGreetingProps {
  robotName: string;
  onContinue: () => void;
}

export default function RobotGreeting({
  robotName,
  onContinue,
}: RobotGreetingProps) {
  return (
    <div className="page-center">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-100 mb-6">
          <Bot className="w-10 h-10 text-brand-500" />
        </div>

        <h1 className="text-display font-display text-ink-900 mb-3">
          Hey! I&apos;m {robotName}.
        </h1>

        <div className="text-left bg-surface-raised rounded-card p-5 shadow-card mb-6 space-y-4">
          <p className="text-body text-ink-700">
            I run on Google&apos;s Gemini AI to diagnose your home repairs. To
            get me working, you&apos;ll need a free API key from Google.
          </p>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-50">
            <Key className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-body-sm font-medium text-ink-800">
                What&apos;s an API key?
              </p>
              <p className="text-body-sm text-ink-600 mt-1">
                It&apos;s like a password that lets me talk to Google&apos;s AI
                on your behalf. It&apos;s free, and I&apos;ll walk you through
                getting one — takes about 2 minutes.
              </p>
            </div>
          </div>
          <p className="text-body-sm text-ink-500">
            Your key is encrypted and stored securely. Only your account can use
            it.
          </p>
        </div>

        <Button size="lg" onClick={onContinue}>
          Show me how
        </Button>
      </div>
    </div>
  );
}
