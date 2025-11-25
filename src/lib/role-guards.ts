/**
 * Role-Based Access Control Guards
 * Utility functions untuk memastikan hanya role yang sesuai yang bisa mengakses fitur tertentu
 * Berdasarkan dokumentasi API SimNikah
 */

import { useAuth } from '@/context/AuthContext';

// Role types dari API
export type UserRole = 'user_biasa' | 'staff' | 'penghulu' | 'kepala_kua' | 'administrator';

/**
 * Check if user has required role
 */
export function hasRole(userRole: string | null | undefined, requiredRole: UserRole | UserRole[]): boolean {
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole as UserRole);
  }
  
  return userRole === requiredRole;
}

/**
 * Check if user is Kepala KUA
 */
export function isKepalaKUA(userRole: string | null | undefined): boolean {
  return hasRole(userRole, 'kepala_kua');
}

/**
 * Check if user is Staff
 */
export function isStaff(userRole: string | null | undefined): boolean {
  return hasRole(userRole, 'staff');
}

/**
 * Check if user is Penghulu
 */
export function isPenghulu(userRole: string | null | undefined): boolean {
  return hasRole(userRole, 'penghulu');
}

/**
 * Check if user is Staff or Kepala KUA
 */
export function isStaffOrKepalaKUA(userRole: string | null | undefined): boolean {
  return hasRole(userRole, ['staff', 'kepala_kua']);
}

/**
 * Check if user is Admin level (Staff, Kepala KUA, or Administrator)
 */
export function isAdmin(userRole: string | null | undefined): boolean {
  return hasRole(userRole, ['staff', 'kepala_kua', 'administrator']);
}

/**
 * Get user role from localStorage
 */
export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    const userData = JSON.parse(user);
    return userData.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Role-based feature access map
 * Berdasarkan dokumentasi API
 */
export const FEATURE_ROLES = {
  // Staff Management - hanya Kepala KUA
  CREATE_STAFF: ['kepala_kua'],
  VIEW_STAFF: ['kepala_kua'],
  MANAGE_STAFF: ['kepala_kua'],
  
  // Penghulu Management - hanya Kepala KUA
  CREATE_PENGHULU: ['kepala_kua'],
  VIEW_PENGHULU: ['kepala_kua'],
  MANAGE_PENGHULU: ['kepala_kua'],
  
  // Verification - Staff only
  VERIFY_FORMULIR: ['staff'],
  VERIFY_BERKAS: ['staff'],
  
  // Penghulu Verification - Penghulu only
  VERIFY_DOCUMENTS: ['penghulu'],
  GET_ASSIGNED_REGISTRATIONS: ['penghulu'],
  
  // Assignment - hanya Kepala KUA
  ASSIGN_PENGHULU: ['kepala_kua'],
  
  // Bimbingan - Staff atau Kepala KUA
  CREATE_BIMBINGAN: ['staff', 'kepala_kua'],
  VIEW_BIMBINGAN: ['staff', 'kepala_kua'],
  
  // Registrations - Staff atau Kepala KUA
  GET_ALL_REGISTRATIONS: ['staff', 'kepala_kua'],
  VIEW_REGISTRATIONS: ['staff', 'kepala_kua'],
  
  // User biasa
  CREATE_REGISTRATION: ['user_biasa'],
  VIEW_OWN_REGISTRATION: ['user_biasa'],
} as const;

/**
 * Check if user can access a feature
 */
export function canAccessFeature(feature: keyof typeof FEATURE_ROLES, userRole?: string | null): boolean {
  const role = userRole || getUserRole();
  if (!role) return false;
  
  const allowedRoles = FEATURE_ROLES[feature];
  return allowedRoles.includes(role as any);
}

/**
 * Get error message for unauthorized access
 */
export function getUnauthorizedMessage(feature: keyof typeof FEATURE_ROLES): string {
  const allowedRoles = FEATURE_ROLES[feature];
  const roleNames = allowedRoles.map(r => {
    switch (r) {
      case 'kepala_kua': return 'Kepala KUA';
      case 'staff': return 'Staff KUA';
      case 'penghulu': return 'Penghulu';
      case 'user_biasa': return 'User Biasa';
      default: return r;
    }
  }).join(' atau ');
  
  return `Fitur ini hanya dapat diakses oleh ${roleNames}`;
}

