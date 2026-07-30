'use client';

import { useRouter } from 'next/navigation';
import { Wrench, Camera, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui';
import DiagnosticCard from '@/components/diagnostic/DiagnosticCard';
import { DEMO_DIAGNOSIS } from '@/lib/demo-data';

export default function LandingPage() {
  const router = useRouter();

  const handleStartDiagnosis = () => {
    // Check if key exists in client localStorage or cookies before routing
    const hasLocalStorageKey = typeof window !== 'undefined' && (
      localStorage.getItem('gemini_api_key') ||
      localStorage.getItem('fixit_api_key')
    );

    const hasCookieKey = typeof document !== 'undefined' && (
      document.cookie.includes('gemini_api_key=') ||
      document.cookie.includes('fixit_api_key=')
    );

    if (!hasLocalStorageKey && !hasCookieKey) {
      router.push('/onboarding');
      return;
    }

    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-title text-ink-900">FixIt AI</span>
        </div>
        <button
          onClick={() => router.push('/auth/login')}
          className="text-body-sm text-brand-600 font-medium hover:text-brand-700 min-h-[44px] flex items-center"
        >
          Sign in
        </button>
      </header>

      {/* Hero */}
      <main className="px-5 max-w-lg mx-auto pb-12">
        <div className="text-center mt-8 mb-8">
          <h1 className="text-display font-display text-ink-900 mb-3">
            Snap a photo.
            <br />
            Get a repair plan.
          </h1>
          <p className="text-body text-ink-500 max-w-sm mx-auto">
            AI-powered home repair diagnostics. Know what&apos;s wrong, what you
            need, and whether to DIY or call a pro.
          </p>
        </div>

        {/* Demo Diagnosis */}
        <div className="mb-8">
          <p className="text-caption text-ink-400 uppercase tracking-wider mb-3 text-center">
            Example diagnosis
          </p>
          <DiagnosticCard diagnosis={DEMO_DIAGNOSIS} />
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Camera, label: 'Photo or video' },
            { icon: Zap, label: 'Instant diagnosis' },
            { icon: Shield, label: 'Free to use' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 py-3"
            >
              <Icon className="w-5 h-5 text-brand-500" />
              <span className="text-caption text-ink-600">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            size="lg"
            onClick={handleStartDiagnosis}
          >
            Get started
          </Button>
          <p className="text-center text-caption text-ink-400">
            *Google/Gmail account required. Set up in a few quick steps.
          </p>
        </div>
      </main>
    </div>
  );
}
