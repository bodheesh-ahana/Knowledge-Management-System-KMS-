import type { UserRole } from '@/types';

/**
 * Roles with full control of the workspace: the team lead (Bodheesh V C) and
 * any Admin. Only these roles may delete knowledge base articles, add or
 * remove applications, and manage login credentials on the Team Access page.
 */
export const LEAD_ROLES: readonly UserRole[] = ['TeamLead', 'Admin'];

/**
 * Roles with elevated (but not full) control: the lead roles plus the practice
 * head (Manager, i.e. Sudheendra Gururaj M P). These roles may download
 * official documents and add team members to the hierarchy.
 */
export const ELEVATED_ROLES: readonly UserRole[] = ['TeamLead', 'Admin', 'Manager'];

export function isLeadRole(role?: string | null): boolean {
  return !!role && LEAD_ROLES.includes(role as UserRole);
}

export function isElevatedRole(role?: string | null): boolean {
  return !!role && ELEVATED_ROLES.includes(role as UserRole);
}

/**
 * Single source of truth for feature-level permissions. Use these helpers in
 * both client components (via `usePermissions`) and API routes so the UI and
 * the server never drift apart.
 */
export const can = {
  /** Delete a knowledge base article. Lead only. */
  deleteKnowledgeArticle: isLeadRole,
  /** Create, edit or delete an application in the catalogue. Lead only. */
  manageApplications: isLeadRole,
  /** View the Team Access page and create/revoke logins. Lead only. */
  manageTeamAccess: isLeadRole,
  /** Download official documents. Lead + practice head. */
  downloadDocuments: isElevatedRole,
  /** Add a member to the team hierarchy. Lead + practice head. */
  manageTeamMembers: isElevatedRole,
};
