'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Hydrate key on client mount and when storage event fires
  useEffect(() => {
    const fetchStoredKey = () => {
      const storedKey =
        localStorage.getItem('gemini_api_key') ||
        localStorage.getItem('fixit_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      }
    };

    fetchStoredKey();
    window.addEventListener('storage', fetchStoredKey);
    return () => window.removeEventListener('storage', fetchStoredKey);
  }, []);

  const handleDiagnose = async () => {
    // Check state first, or fallback directly to localStorage lookup
    const activeKey =
      apiKey ||
      localStorage.getItem('gemini_api_key') ||
      localStorage.getItem('fixit_api_key');

    if (!activeKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: 'No API key found. Please set up your key in Settings.',
        },
      ]);
      return;
    }

    setIsDiagnosing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey,
        },
        body: JSON.stringify({
          apiKey: activeKey,
          message: 'Diagnose this issue.',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            role: 'assistant',
            content: data.error || 'Failed to complete diagnosis.',
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: data.result || 'Diagnosis complete.',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: 'Network error processing diagnosis. Please try again.',
        },
      ]);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDF9] text-slate-900 flex flex-col justify-between p-6">
      {/* Header */}
      <header className="flex justify-between items-center w-full max-w-7xl mx-auto">
        <h1 className="text-xl font-bold tracking-tight">FixIt AI</h1>
        <Link
          href="/onboarding"
          className="p-2 text-slate-500 hover:text-slate-800 transition-colors"
          title="Settings / Key Entry"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto my-8">
        {/* Messages Log */}
        <div className="space-y-4 mb-6">
          {messages.map((msg) => (
            <p key={msg.id} className="text-slate-700 text-sm leading-relaxed">
              {msg.content}
            </p>
          ))}
        </div>

        {/* Action Card */}
        <div className="flex justify-end">
          <div className="bg-orange-500 rounded-2xl p-2 w-full max-w-xs shadow-md">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-200">
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"
                alt="Drywall Damage"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleDiagnose}
              disabled={isDiagnosing}
              className="w-full text-left text-white font-medium text-sm py-2 px-1 mt-1 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isDiagnosing ? 'Diagnosing issue...' : 'Diagnose this issue'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
