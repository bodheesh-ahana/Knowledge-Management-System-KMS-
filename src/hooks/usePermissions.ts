'use client';

import { useSession } from 'next-auth/react';
import { can } from '@/lib/permissions';

/**
 * Resolves the signed-in user's role from the NextAuth session and exposes the
 * feature-level permission flags defined in `@/lib/permissions`.
 */
export function usePermissions() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  return {
    role,
    status,
    isLoading: status === 'loading',
    canDeleteKnowledgeArticle: can.deleteKnowledgeArticle(role),
    canManageApplications: can.manageApplications(role),
    canManageTeamAccess: can.manageTeamAccess(role),
    canDownloadDocuments: can.downloadDocuments(role),
    canManageTeamMembers: can.manageTeamMembers(role),
  };
}
