import { gasRequest } from './gasApi';

const AUTH_STORAGE_KEY = 'asset-manager-auth-user';

export type AuthUser = {
  email: string;
  name: string;
  picture: string;
  idToken: string;
};

type VerifiedUser = {
  email: string;
  name: string;
  picture: string;
};

function decodeJwtPayload(idToken: string) {
  try {
    const payload = idToken.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');

    const json = decodeURIComponent(
      atob(normalizedPayload)
        .split('')
        .map((char) => {
          return `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`;
        })
        .join('')
    );

    return JSON.parse(json) as { exp?: number };
  } catch {
    return {};
  }
}

function isTokenExpired(idToken: string) {
  const payload = decodeJwtPayload(idToken);

  if (!payload.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

export function saveAuthUser(user: AuthUser) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem('asset-manager-auth-user');

    if (!raw) {
      return null;
    }

    const user = JSON.parse(raw) as AuthUser;

    if (!user.idToken || isTokenExpired(user.idToken)) {
      clearAuthUser();
      return null;
    }

    return user;
  } catch {
    clearAuthUser();
    return null;
  }
}

export function clearAuthUser() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function verifyGoogleLogin(idToken: string) {
  const verifiedUser = await gasRequest<VerifiedUser>('verifyLogin', {
    idToken,
  });

  const authUser: AuthUser = {
    ...verifiedUser,
    idToken,
  };

  saveAuthUser(authUser);

  return authUser;
}