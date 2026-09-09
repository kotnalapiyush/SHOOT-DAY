import { AuthSession, PhotographerProfile } from '../types';

const AUTH_KEY = 'shoot_socialbae_auth_session_v1';

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'kotnalapiyush@gmail.com',
  secondaryEmail: 'admin@shootsocialbae.com',
  password: 'admin123',
  name: 'Kotnala Piyush (Studio Admin)',
};

export function getStoredAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse auth session', err);
  }
  return null;
}

export function saveAuthSession(session: AuthSession | null) {
  try {
    if (session) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
    // Notify app tabs
    window.dispatchEvent(new CustomEvent('shoot_auth_changed', { detail: session }));
  } catch (err) {
    console.error('Failed to save auth session', err);
  }
}

export function verifyAdminLogin(email: string, pass: string): { success: boolean; session?: AuthSession; error?: string } {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPass = pass.trim();

  const isAdminEmail =
    trimmedEmail === DEFAULT_ADMIN_CREDENTIALS.email.toLowerCase() ||
    trimmedEmail === DEFAULT_ADMIN_CREDENTIALS.secondaryEmail.toLowerCase() ||
    trimmedEmail === 'admin';

  if (isAdminEmail && (trimmedPass === DEFAULT_ADMIN_CREDENTIALS.password || trimmedPass === 'admin')) {
    const session: AuthSession = {
      role: 'admin',
      id: 'admin',
      name: DEFAULT_ADMIN_CREDENTIALS.name,
      email: trimmedEmail,
    };
    saveAuthSession(session);
    return { success: true, session };
  }

  return { success: false, error: 'Invalid admin email or password. (Hint: kotnalapiyush@gmail.com / admin123)' };
}

export function verifyPhotographerLogin(
  identifier: string,
  pass: string,
  photographers: PhotographerProfile[]
): { success: boolean; session?: AuthSession; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();

  // Match photographer by email, loginEmail, phone or name slug
  const matched = photographers.find((p) => {
    const emailMatch = p.email?.toLowerCase() === cleanId || p.loginEmail?.toLowerCase() === cleanId;
    const phoneMatch = p.phone?.replace(/[\s+-]/g, '') === cleanId.replace(/[\s+-]/g, '');
    const nameMatch = p.name?.toLowerCase() === cleanId || p.id?.toLowerCase() === cleanId;
    return emailMatch || phoneMatch || nameMatch;
  });

  if (!matched) {
    return { success: false, error: 'No photographer account found with this email, phone, or name.' };
  }

  // Check password: custom password, or default fallback pattern (e.g. firstname123, or 123456)
  const expectedPassword = matched.loginPassword || `${matched.name.split(' ')[0].toLowerCase()}123`;
  const isPassValid = cleanPass === expectedPassword || cleanPass === '123456' || cleanPass === `${matched.name.split(' ')[0].toLowerCase()}123`;

  if (!isPassValid) {
    return {
      success: false,
      error: `Incorrect password for ${matched.name}. (Default: ${matched.name.split(' ')[0].toLowerCase()}123)`,
    };
  }

  const session: AuthSession = {
    role: 'photographer',
    id: matched.id,
    photographerId: matched.id,
    name: matched.name,
    email: matched.email || matched.loginEmail || '',
    avatarUrl: matched.avatarUrl,
  };

  saveAuthSession(session);
  return { success: true, session };
}
