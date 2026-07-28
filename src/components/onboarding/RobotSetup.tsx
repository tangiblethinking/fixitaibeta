'use client';

import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface RobotSetupProps {
  onContinue: (name: string) => void;
}

const PLACEHOLDER_NAMES = [
  'Sparky',
  'Wrenchbot',
  'Fixie',
  'Bolt',
  'Hammer',
  'Gizmo',
];

export default function RobotSetup({ onContinue }: RobotSetupProps) {
  const [name, setName] = useState('');
  const placeholder =
    PLACEHOLDER_NAMES[Math.floor(Math.random() * PLACEHOLDER_NAMES.length)];

  return (
    <div className="page-center">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-100 mb-6">
          <Bot className="w-10 h-10 text-brand-500" />
        </div>

        <h1 className="text-display font-display text-ink-900 mb-2">
          Name your repair assistant
        </h1>
        <p className="text-body text-ink-500 mb-8">
          Give your AI helper a name. It&apos;ll stick around for every repair.
        </p>

        <div className="mb-6">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`e.g. ${placeholder}`}
            maxLength={20}
            className="text-center text-lg"
            autoFocus
          />
        </div>

        <Button
          size="lg"
          onClick={() => onContinue(name.trim() || placeholder)}
          disabled={false}
        >
          {name.trim() ? "Let's start" : `Call it ${placeholder}`}
        </Button>
      </div>
    </div>
  );
}
