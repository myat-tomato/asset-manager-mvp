const GAS_API_URL = import.meta.env.VITE_GAS_API_URL;

type GasResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

function getStoredIdToken() {
  try {
    const raw = sessionStorage.getItem('asset-manager-auth-user');

    if (!raw) {
      return '';
    }

    const user = JSON.parse(raw) as { idToken?: string };

    return user.idToken || '';
  } catch {
    return '';
  }
}

export async function gasRequest<T>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  if (!GAS_API_URL) {
    throw new Error('VITE_GAS_API_URL is not set');
  }

  const response = await fetch(GAS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action,
      payload,
      idToken: getStoredIdToken(),
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const result = (await response.json()) as GasResponse<T>;

  if (!result.success) {
    throw new Error(result.error || 'GAS request failed');
  }

  return result.data as T;
}