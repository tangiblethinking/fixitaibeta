'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import WorkspaceScreen from '@/components/workspace/WorkspaceScreen';

export default function WorkspacePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-center">
        <p className="text-body text-ink-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return <WorkspaceScreen userId={user.id} />;
}
