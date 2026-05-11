const DEFAULT_API_BASE_URL = "http://localhost:3000";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const AUTH_TOKEN_STORAGE_KEY = "sbms.auth.token";

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.details = options.details ?? null;
    this.url = options.url ?? null;
    this.method = options.method ?? null;
  }
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function parseMaybeJson(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (response.status === 204) {
    return null;
  }

  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return parseMaybeJson(rawBody);
  }

  return rawBody;
}

export async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    headers,
    auth = true,
    token,
    ...fetchOptions
  } = options;

  const url = buildUrl(path);
  const requestHeaders = new Headers(headers ?? {});
  const resolvedToken = token ?? readStoredToken();

  if (auth && resolvedToken) {
    requestHeaders.set("Authorization", `Bearer ${resolvedToken}`);
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const hasJsonBody = body !== undefined && body !== null && !isFormData;

  if (hasJsonBody && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    method,
    headers: requestHeaders,
    body: isFormData ? body : hasJsonBody ? JSON.stringify(body) : undefined,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload && payload.message) ||
      (payload && typeof payload === "object" && "error" in payload && payload.error) ||
      response.statusText ||
      "Request failed";

    throw new ApiError(Array.isArray(message) ? message.join(", ") : String(message), {
      status: response.status,
      details: payload,
      url,
      method,
    });
  }

  return payload;
}

export const authApi = {
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      auth: false,
      body: credentials,
    }),
  me: (token) =>
    request("/auth/me", {
      token,
    }),
};

export const employeesApi = {
  list: () => request("/employees"),
  get: (id) => request(`/employees/${id}`),
  create: (payload) =>
    request("/employees", {
      method: "POST",
      body: payload,
    }),
  update: (id, payload) =>
    request(`/employees/${id}`, {
      method: "PATCH",
      body: payload,
    }),
  remove: (id) =>
    request(`/employees/${id}`, {
      method: "DELETE",
    }),
};

export const tasksApi = {
  list: () => request("/tasks"),
  get: (id) => request(`/tasks/${id}`),
  myTasks: (employeeId) => request(`/tasks/my-tasks/${employeeId}`),
  create: (payload) =>
    request("/tasks", {
      method: "POST",
      body: payload,
    }),
  update: (id, payload) =>
    request(`/tasks/${id}`, {
      method: "PATCH",
      body: payload,
    }),
  updateStatus: (id, payload) =>
    request(`/tasks/${id}/status`, {
      method: "PATCH",
      body: payload,
    }),
  remove: (id) =>
    request(`/tasks/${id}`, {
      method: "DELETE",
    }),
};

export const attendanceApi = {
  today: () => request("/attendance/today"),
  checkIn: () =>
    request("/attendance/check-in", {
      method: "POST",
    }),
  checkOut: () =>
    request("/attendance/check-out", {
      method: "POST",
    }),
  list: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.startDate) {
      searchParams.set("startDate", params.startDate);
    }

    if (params.endDate) {
      searchParams.set("endDate", params.endDate);
    }

    const query = searchParams.toString();
    return request(query ? `/attendance?${query}` : "/attendance");
  },
  byEmployee: (employeeId, params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.startDate) {
      searchParams.set("startDate", params.startDate);
    }

    if (params.endDate) {
      searchParams.set("endDate", params.endDate);
    }

    const query = searchParams.toString();
    return request(
      query ? `/attendance/employee/${employeeId}?${query}` : `/attendance/employee/${employeeId}`,
    );
  },
};

export const financialsApi = {
  summary: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.startDate) {
      searchParams.set("startDate", params.startDate);
    }

    if (params.endDate) {
      searchParams.set("endDate", params.endDate);
    }

    const query = searchParams.toString();
    return request(query ? `/financials/summary?${query}` : "/financials/summary");
  },
  sales: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.startDate) {
      searchParams.set("startDate", params.startDate);
    }

    if (params.endDate) {
      searchParams.set("endDate", params.endDate);
    }

    const query = searchParams.toString();
    return request(query ? `/financials/sales?${query}` : "/financials/sales");
  },
  expenses: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.startDate) {
      searchParams.set("startDate", params.startDate);
    }

    if (params.endDate) {
      searchParams.set("endDate", params.endDate);
    }

    const query = searchParams.toString();
    return request(query ? `/financials/expenses?${query}` : "/financials/expenses");
  },
  recordSale: (payload) =>
    request("/financials/sales", {
      method: "POST",
      body: payload,
    }),
  recordExpense: (payload) =>
    request("/financials/expenses", {
      method: "POST",
      body: payload,
    }),
  deleteSale: (id) =>
    request(`/financials/sales/${id}`, {
      method: "DELETE",
    }),
  deleteExpense: (id) =>
    request(`/financials/expenses/${id}`, {
      method: "DELETE",
    }),
};