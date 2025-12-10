/**
 * Validasi Role-Based Access
 * Sesuai dokumentasi backend - Section Validasi Tampilan Frontend
 */

export interface AccessCheckResult {
  hasAccess: boolean;
  message: string;
}

/**
 * Check Role Access
 */
export const checkRoleAccess = (
  userRole: string | null | undefined,
  requiredRoles: string | string[]
): AccessCheckResult => {
  if (!userRole) {
    return {
      hasAccess: false,
      message: 'User tidak terautentikasi'
    };
  }

  if (Array.isArray(requiredRoles)) {
    if (!requiredRoles.includes(userRole)) {
      return {
        hasAccess: false,
        message: `Akses ditolak. Role yang diizinkan: ${requiredRoles.join(', ')}`
      };
    }
  } else {
    if (userRole !== requiredRoles) {
      return {
        hasAccess: false,
        message: `Akses ditolak. Role yang diizinkan: ${requiredRoles}`
      };
    }
  }

  return {
    hasAccess: true,
    message: 'Akses diizinkan'
  };
};

/**
 * Hook untuk Role Guard (untuk digunakan di component)
 */
export const useRoleGuard = (requiredRoles: string | string[]): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;
  
  try {
    const user = JSON.parse(userStr);
    const access = checkRoleAccess(user.role, requiredRoles);
    return access.hasAccess;
  } catch {
    return false;
  }
};

