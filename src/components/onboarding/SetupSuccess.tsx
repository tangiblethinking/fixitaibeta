'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface SetupSuccessProps {
  robotName: string;
  userId: string;
}

export default function SetupSuccess({ robotName, userId }: SetupSuccessProps) {
  const router = useRouter();

  const handleGetStarted = async () => {
    // Mark onboarding complete + save robot name
    const supabase = createClient();
    await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          robot_name: robotName,
          role: 'homeowner',
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    router.push('/workspace');
  };

  return (
    <div className="page-center">
      <div className="w-full max-w-sm text-center">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 rounded-2xl bg-success-light flex items-center justify-center">
            <Bot className="w-10 h-10 text-success" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-success flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>

        <h1 className="text-display font-display text-ink-900 mb-2">
          Noice work!
        </h1>
        <p className="text-body text-ink-600 mb-2">
          {robotName} is ready to go. Your API key is encrypted and secured.
        </p>
        <p className="text-body-sm text-ink-500 mb-8">
          Take a photo of something that needs fixing and {robotName} will
          diagnose it, list the parts, and tell you if you can handle it
          yourself.
        </p>

        <Button size="lg" onClick={handleGetStarted}>
          Get started
        </Button>
      </div>
    </div>
  );
}
