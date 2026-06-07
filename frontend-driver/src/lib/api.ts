const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Błąd HTTP: ${res.status}`);
  }

  return res.json();
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, body);
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const options: RequestInit = {
    method: "POST",
    credentials: "include",
    body: formData,
    // Do not set Content-Type header. The browser will automatically set it to multipart/form-data with the correct boundary.
  };

  const res = await fetch(`${API_BASE}${path}`, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Błąd HTTP: ${res.status}`);
  }

  return res.json();
}
