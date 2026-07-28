'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import RoleSelection from '@/components/onboarding/RoleSelection';
import RobotSetup from '@/components/onboarding/RobotSetup';
import RobotGreeting from '@/components/onboarding/RobotGreeting';
import KeyCarousel from '@/components/onboarding/KeyCarousel';
import KeyEntry from '@/components/onboarding/KeyEntry';
import SetupSuccess from '@/components/onboarding/SetupSuccess';

type OnboardingStep =
  | 'role'
  | 'robot-name'
  | 'robot-greeting'
  | 'carousel'
  | 'key-entry'
  | 'success';

export default function OnboardingPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('role');
  const [robotName, setRobotName] = useState('');

  if (!user) {
    return (
      <div className="page-center">
        <p className="text-body text-ink-500">Loading...</p>
      </div>
    );
  }

  switch (step) {
    case 'role':
      return (
        <RoleSelection
          userEmail={user.email || ''}
          onContinue={() => setStep('robot-name')}
        />
      );

    case 'robot-name':
      return (
        <RobotSetup
          onContinue={(name) => {
            setRobotName(name);
            setStep('robot-greeting');
          }}
        />
      );

    case 'robot-greeting':
      return (
        <RobotGreeting
          robotName={robotName}
          onContinue={() => setStep('carousel')}
        />
      );

    case 'carousel':
      return (
        <KeyCarousel
          onEnterKey={() => setStep('key-entry')}
        />
      );

    case 'key-entry':
      return (
        <KeyEntry
          robotName={robotName}
          userId={user.id}
          onSuccess={() => setStep('success')}
          onBack={() => setStep('carousel')}
        />
      );

    case 'success':
      return <SetupSuccess robotName={robotName} userId={user.id} />;

    default:
      return null;
  }
}
