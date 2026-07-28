'use client';

import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';

interface KeyEntryProps {
  robotName: string;
  userId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function KeyEntry({
  robotName,
  userId,
  onSuccess,
  onBack,
}: KeyEntryProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!key.trim()) {
      setError('Paste your API key above');
      return;
    }

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

      onSuccess();
    } catch {
      setError('Network error — check your connection and try again');
      setVerifying(false);
    }
  };

  const isMac =
    typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);

  return (
    <div className="page-center">
      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-body-sm text-ink-500 hover:text-ink-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to instructions
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-100 mb-4">
            <ShieldCheck className="w-7 h-7 text-brand-500" />
          </div>
          <h2 className="text-title text-ink-900">Secure your access</h2>
          <p className="text-body-sm text-ink-500 mt-1">
            Paste the API key you copied from Google AI Studio.
          </p>
        </div>

        {/* Key input */}
        <div className="relative mb-4">
          <input
            type={showKey ? 'text' : 'password'}
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError(null);
            }}
            onPaste={() => setError(null)}
            placeholder={`${isMac ? '⌘' : 'Ctrl'}+V to paste your key`}
            className={`w-full px-4 py-3 pr-12 rounded-input border text-body font-mono text-ink-900 placeholder:text-ink-400 transition-colors min-h-[48px] ${
              error
                ? 'border-danger bg-danger-light'
                : 'border-ink-200 bg-surface-raised focus:border-brand-400'
            } focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1`}
            autoFocus
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 p-1"
          >
            {showKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <p className="text-body-sm text-danger mb-4">{error}</p>
        )}

        <Button
          size="lg"
          onClick={handleVerify}
          loading={verifying}
        >
          {verifying
            ? `${robotName} is checking...`
            : 'Verify and secure my key'}
        </Button>

        <p className="text-caption text-ink-400 mt-4 text-center">
          Your key is encrypted with AES-256-GCM and stored server-side.
          It&apos;s never visible in your browser again.
        </p>
      </div>
    </div>
  );
}
