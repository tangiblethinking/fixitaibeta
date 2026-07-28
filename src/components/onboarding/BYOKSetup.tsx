'use client';

import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface BYOKSetupProps {
  userId: string;
  onSuccess?: () => void;
}

export default function BYOKSetup({ userId, onSuccess }: BYOKSetupProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!key.trim()) return;
    setVerifying(true);
    setError(null);

    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key.trim(), userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        setVerifying(false);
        return;
      }

      setSuccess(true);
      setKey('');
      onSuccess?.();
    } catch {
      setError('Network error');
      setVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-success-light">
        <CheckCircle className="w-5 h-5 text-success" />
        <div>
          <p className="text-body-sm font-medium text-ink-800">
            API key updated
          </p>
          <p className="text-caption text-ink-500">
            Your new key is encrypted and ready to use.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-500" />
        <h3 className="text-body font-medium text-ink-800">
          Replace API Key
        </h3>
      </div>
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError(null);
          }}
          placeholder="Paste new API key"
          className="w-full px-4 py-3 pr-12 rounded-input border border-ink-200 bg-surface-raised text-body font-mono min-h-[48px] focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
        >
          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-body-sm text-danger">{error}</p>}
      <Button onClick={handleVerify} loading={verifying} disabled={!key.trim()}>
        Verify and replace
      </Button>
    </div>
  );
}
