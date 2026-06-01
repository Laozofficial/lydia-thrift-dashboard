import { API_URL } from '../config';

const TOKEN_KEY = 'lydia_admin_token';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function parseError(response: Response): Promise<ApiError> {
  let body: { message?: string; errors?: Record<string, string[]> } | null = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return new ApiError(body?.message ?? `Request failed (${response.status})`, response.status, body?.errors);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean; formData?: boolean } = {},
): Promise<T> {
  const { auth = true, formData = false, headers = {}, ...init } = options;

  const requestHeaders: Record<string, string> = { Accept: 'application/json', ...(headers as Record<string, string>) };

  if (!formData && init.body && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError('Not signed in.', 401);
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers: requestHeaders });

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
}

export function formatFieldErrors(errors?: Record<string, string[]>): string {
  if (!errors) return '';
  return Object.values(errors).flat().join('\n');
}
