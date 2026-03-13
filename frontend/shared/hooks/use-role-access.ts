/**
 * Hook pour gérer l'accès basé sur les rôles
 */

import { useAuth } from './use-auth';
import { ROLES } from '@/shared/constants';

/**
 * Vérifie si l'utilisateur a accès à une route spécifique
 */
export function useRoleAccess() {
  const { user, loading } = useAuth();

  /**
   * Vérifie si l'utilisateur a l'un des rôles requis
   */
  const hasRole = (allowedRoles: string[]): boolean => {
    if (loading || !user) return false;
    return allowedRoles.includes(user.role);
  };

  /**
   * Vérifie si l'utilisateur a accès à une page spécifique
   */
  const hasAccessToPage = (path: string): boolean => {
    if (loading || !user) return false;

    // ADMIN a accès à tout
    if (user.role === ROLES.ADMIN) return true;

    // Permissions par page
    const pagePermissions: Record<string, string[]> = {
      '/dashboard': [ROLES.ADMIN],
      '/': [ROLES.ADMIN, ROLES.GESTIONNAIRE_CLIENTELE],
      '/stock': [ROLES.ADMIN, ROLES.GESTIONNAIRE_STOCK],
      '/accounts': [ROLES.ADMIN, ROLES.COMPTABLE],
      '/fleet': [ROLES.ADMIN, ROLES.GESTIONNAIRE_TRUCKS],
      '/users': [ROLES.ADMIN],
    };

    const allowedRoles = pagePermissions[path] || [];
    return allowedRoles.includes(user.role);
  };

  return {
    user: user || null,
    loading,
    hasRole,
    hasAccessToPage,
  };
}
