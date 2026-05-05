import { authStorage } from "./auth-storage";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const buildUrl = (path) => {
  if (path.startsWith("http")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
};

const parseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType) {
    return response.text();
  }

  return null;
};

const request = async (path, options = {}) => {
  const { method = "GET", body, headers, ...rest } = options;
  const token = authStorage.getToken();
  const requestHeaders = new Headers(headers || {});

  if (!(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
    ...rest,
  });

  const payload = await parseBody(response);

  if (!response.ok) {
    const message =
      payload?.message || payload?.error || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return payload;
};

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
