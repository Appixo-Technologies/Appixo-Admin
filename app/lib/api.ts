import { API_BASE_URL } from "./config";

export interface Enquiry {
  enquiryId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  location?: string | null;
  inquiryType?: string | null;
  projectContext?: string | null;
  submittedAt: string;
  status: string;
}

export interface AdminUser {
  adminId: number;
  username: string;
  fullName: string;
  role: string;
  email?: string;
  status?: string;
}

export interface AuthSession {
  adminId: number;
  username: string;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
}

const STORAGE_KEY = "appixo-admin-session";

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("appixo-admin");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && parsed.token) {
      // Check expiration if present
      if (parsed.expiresAt) {
        const expiry = new Date(parsed.expiresAt).getTime();
        if (Date.now() > expiry) {
          clearStoredSession();
          return null;
        }
      }
      return parsed as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  // Keep legacy key in sync for backwards compatibility
  localStorage.setItem("appixo-admin", JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("appixo-admin");
}

export function isSessionValid(): boolean {
  return getStoredSession() !== null;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = getStoredSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    throw new Error(`Unable to connect to backend server: ${message}`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearStoredSession();
    }
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<AuthSession> {
  // Map email to username if standard admin email is passed
  const cleanUsername = username.trim() === "admin@appixo.com" ? "admin" : username.trim();

  const res = await apiRequest<{
    message: string;
    data: {
      adminId: number;
      username: string;
      fullName: string;
      role: string;
      token: string;
      expiresAt: string;
    };
  }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username: cleanUsername, password }),
  });

  const session: AuthSession = {
    adminId: res.data.adminId,
    username: res.data.username,
    fullName: res.data.fullName,
    role: res.data.role,
    token: res.data.token,
    expiresAt: res.data.expiresAt,
  };

  setStoredSession(session);
  return session;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiRequest<{ message: string }>("/api/admin/logout", {
      method: "POST",
    });
  } catch {
    // Continue with local clear even if backend session call fails
  } finally {
    clearStoredSession();
  }
}

export async function getEnquiriesList(): Promise<Enquiry[]> {
  const res = await apiRequest<{
    message: string;
    count: number;
    data: Enquiry[];
  }>("/api/admin/enquiries", {
    method: "GET",
    cache: "no-store",
  });

  return res.data || [];
}

export async function getEnquiryDetails(
  enquiryId: string | number
): Promise<Enquiry> {
  const res = await apiRequest<{
    message: string;
    data: Enquiry;
  }>(`/api/admin/enquiries/${enquiryId}`, {
    method: "GET",
    cache: "no-store",
  });

  return res.data;
}

export async function updateEnquiryStatus(
  enquiryId: string | number,
  status: "pending" | "in-progress" | "resolved" | "closed" | string
): Promise<void> {
  await apiRequest<{
    message: string;
    data: unknown;
  }>(`/api/admin/enquiries/${enquiryId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function getAdminProfile(): Promise<AdminUser> {
  const res = await apiRequest<{
    message: string;
    data: AdminUser;
  }>("/api/admin/profile", {
    method: "GET",
  });

  return res.data;
}
