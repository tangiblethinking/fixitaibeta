'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button, Card } from '@/components/ui';
import BYOKSetup from '@/components/onboarding/BYOKSetup';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-ink-100 bg-surface-raised">
        <button
          onClick={() => router.push('/workspace')}
          className="p-2 text-ink-500 hover:text-ink-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title text-ink-900">Settings</h1>
      </header>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6">
        {/* Account */}
        <Card>
          <h3 className="text-body font-medium text-ink-800 mb-3">Account</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-body-sm">
              <span className="text-ink-500">Email</span>
              <span className="text-ink-700">{user.email}</span>
            </div>
            <div className="flex justify-between text-body-sm">
              <span className="text-ink-500">User ID</span>
              <span className="text-ink-400 font-mono text-caption">
                {user.id.substring(0, 8)}...
              </span>
            </div>
          </div>
        </Card>

        {/* API Key Management */}
        <Card>
          <BYOKSetup userId={user.id} />
        </Card>

        {/* Sign Out */}
        <Button
          variant="ghost"
          size="lg"
          onClick={handleSignOut}
          className="text-danger hover:bg-danger-light gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
