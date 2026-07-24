import { cookies } from 'next/headers';
import { dbService } from './services';
import { UserProfile, UserRole } from '@/types';

/**
 * Retrieves the currently logged-in user profile from the session cookie.
 */
export async function getSessionUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('cortex_session_id')?.value;
  if (!sessionId) return null;
  
  const user = await dbService.getUser(sessionId);
  if (!user || user.status !== 'active') return null;
  
  return user;
}

/**
 * Validates that a user is authenticated, and optionally has one of the allowed roles.
 * Throws an error if validation fails.
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<UserProfile> {
  const user = await getSessionUser();
  if (!user) {
    const err = new Error('Unauthorized');
    (err as any).status = 401;
    throw err;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'Super Admin') {
    const err = new Error('Forbidden: Access Denied');
    (err as any).status = 403;
    throw err;
  }
  
  return user;
}
