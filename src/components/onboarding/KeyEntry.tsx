'use client';

import React, { useState } from 'react';

interface KeyEntryProps {
  robotName?: string;
  userId?: string;
  onSuccess?: (key?: string) => void;
  onBack?: () => void;
}

export default function KeyEntry({ robotName, userId, onSuccess, onBack }: KeyEntryProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setError('Please enter a valid API key.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const cleanKey = apiKey.trim();

    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey, userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify API key. Please try again.');
        setIsLoading(false);
        return;
      }

      // Persist key locally across sessions
      localStorage.setItem('gemini_api_key', cleanKey);
      localStorage.setItem('fixit_api_key', cleanKey);
      document.cookie = `gemini_api_key=${cleanKey}; path=/; max-age=31536000; SameSite=Lax`;

      // Notify window listeners so app state updates immediately
      window.dispatchEvent(new Event('storage'));

      if (onSuccess) {
        onSuccess(cleanKey);
      }
    } catch (err: any) {
      setError('Network error verifying API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm text-slate-800">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          ← Back to instructions
        </button>
      )}

      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
        Secure your access
      </h2>
      <p className="text-sm text-center text-slate-500 mb-6">
        Paste the API key you copied from Google AI Studio.
      </p>

      <form onSubmit={handleVerifyAndSave} className="space-y-4">
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (error) setError(null);
            }}
            placeholder="AIzaSy..."
            className={`w-full px-4 py-3 pr-12 rounded-xl border text-slate-900 bg-slate-50 focus:bg-white focus:outline-none transition-colors ${
              error ? 'border-red-500 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-orange-500'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            {showKey ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || !apiKey.trim()}
          className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          {isLoading ? 'Verifying...' : 'Verify and secure my key'}
        </button>
      </form>

      <p className="text-xs text-center text-slate-400 mt-6">
        Your key is stored locally in your browser to power diagnostic tools.
      </p>
    </div>
  );
}
