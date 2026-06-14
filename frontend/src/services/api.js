const isLocal = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.startsWith('192.168.') ||
                window.location.hostname.startsWith('10.') ||
                window.location.hostname.startsWith('172.') ||
                window.location.hostname.endsWith('.local') ||
                !window.location.hostname;

export const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (isLocal
      ? `http://${window.location.hostname || '127.0.0.1'}:8000`
      : window.location.origin);

const API_URL = `${BACKEND_URL}/api`;

const DEFAULT_TIMEOUT_MS = 15000;
const RETRYABLE_METHODS = new Set(['GET']);
const RETRYABLE_STATUS = new Set([502, 503, 504]);

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

const FRIENDLY_BY_STATUS = {
  400: 'La solicitud no es válida. Revisa los datos ingresados.',
  401: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe o fue eliminado.',
  409: 'Conflicto: el recurso ya existe o está en uso.',
  422: 'Algunos datos enviados no son válidos.',
  429: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.',
  500: 'Error interno del servidor. Intenta de nuevo más tarde.',
};

function friendlyMessage(status, detail) {
  if (typeof detail === 'string' && detail.trim() && !detail.startsWith('(')) {
    return detail;
  }
  return FRIENDLY_BY_STATUS[status] || 'Ocurrió un error inesperado. Intenta de nuevo.';
}

export function getToken() {
  return localStorage.getItem('nexus_token');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('nexus_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(data) {
  if (data?.access_token) localStorage.setItem('nexus_token', data.access_token);
  if (data?.user) localStorage.setItem('nexus_user', JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem('nexus_token');
  localStorage.removeItem('nexus_user');
}

export function resolveMediaUrl(url) {
  if (!url) return '';
  const full = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  return full.replace(/^http:\/\/127\.0\.0\.1(:\d+)?/, (_m, port) =>
    `http://localhost${port ?? ''}`
  );
}

export function resolveThumbUrl(url, w = 600) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return '';
  if (resolved.includes('/static/uploads/images/') || resolved.includes('/static/uploads/avatars/') || resolved.includes('/static/seed/images/')) {
    const path = resolved.replace(/^https?:\/\/[^/]+\/static\//, '');
    return `http://localhost:8000/api/media/thumb?path=${encodeURIComponent(path)}&w=${w}`;
  }
  if (resolved.includes('/api/media/thumb?')) {
    const u = new URL(resolved);
    u.searchParams.set('w', String(w));
    return u.toString();
  }
  return resolved;
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    timeout = DEFAULT_TIMEOUT_MS,
    retries = RETRYABLE_METHODS.has(method) ? 2 : 0,
    rawBody = false,
  } = options;

  const finalHeaders = { ...headers };
  if (!rawBody && body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (auth && token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: finalHeaders,
        body: rawBody ? body : (body !== undefined ? JSON.stringify(body) : undefined),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.status === 401 && auth) {
        clearSession();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        throw new ApiError(FRIENDLY_BY_STATUS[401], 401);
      }

      if (!response.ok) {
        const data = await parseBody(response);
        const detail = data && typeof data === 'object' ? data.detail : data;
        const error = new ApiError(friendlyMessage(response.status, detail), response.status, detail);
        if (RETRYABLE_STATUS.has(response.status) && attempt < retries) {
          lastError = error;
          attempt += 1;
          await new Promise(r => setTimeout(r, 400 * attempt));
          continue;
        }
        throw error;
      }

      return parseBody(response);
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof ApiError) throw err;

      const isAbort = err.name === 'AbortError';
      const message = isAbort
        ? 'El servidor tardó demasiado en responder. Verifica tu conexión.'
        : 'No se pudo conectar con el servidor. Verifica tu conexión.';
      lastError = new ApiError(message, 0, err.message);

      if (attempt < retries) {
        attempt += 1;
        await new Promise(r => setTimeout(r, 400 * attempt));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (response.status === 401) {
    clearSession();
    window.location.href = '/login';
  }
  return response;
};

export const login = async (email, password) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  setSession(data);
  return data;
};

export const register = async (userData) => {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: userData,
    auth: false,
  });
  setSession(data);
  return data;
};

export const googleLogin = async (idToken) => {
  const data = await apiFetch('/auth/google', {
    method: 'POST',
    body: { id_token: idToken },
    auth: false,
  });
  setSession(data);
  return data;
};

export const microsoftCallback = async (payload) => {
  const data = await apiFetch('/auth/microsoft/callback', {
    method: 'POST',
    body: payload,
    auth: false,
  });
  setSession(data);
  return data;
};

export const githubCallback = async (code) => {
  const data = await apiFetch('/auth/github/callback', {
    method: 'POST',
    body: { code },
    auth: false,
  });
  setSession(data);
  if (data?.user?.Username) {
    localStorage.setItem('nexus_prev_gh_user', data.user.Username);
  }
  return data;
};

export const checkUsername = async (username) => {
  return apiFetch(`/auth/check-username?username=${encodeURIComponent(username)}`, { auth: false });
};

export const ldapLogin = async ({ username, password, domain }) => {
  const data = await apiFetch('/auth/ldap', {
    method: 'POST',
    body: { username, password, domain },
    auth: false,
  });
  setSession(data);
  return data;
};

export const getFeed = (page = 1, size = 30) =>
  apiFetch(`/pins/feed?page=${page}&size=${size}`);

export const getForYouFeed = (page = 1, size = 30) =>
  apiFetch(`/pins/for-you?page=${page}&size=${size}`);

export const searchPins = (query, categoryId = null, page = 1, size = 30, options = {}) => {
  let url = `/pins/search?page=${page}&size=${size}`;
  if (query) url += `&search=${encodeURIComponent(query)}`;
  if (categoryId) url += `&category_id=${categoryId}`;
  if (options.author) url += `&author=${encodeURIComponent(options.author)}`;
  if (options.verifiedOnly) url += `&verified_only=true`;
  if (options.sort) url += `&sort=${options.sort}`;
  if (options.tagSlug) url += `&tag_slug=${encodeURIComponent(options.tagSlug)}`;
  return apiFetch(url);
};

export const getPinDetail = (pinId) => apiFetch(`/pins/${pinId}`);

export const createPin = (pinData) =>
  apiFetch('/pins', { method: 'POST', body: pinData, timeout: 65000 });

export const validateImagePreview = (key) =>
  apiFetch(`/pins/validate-preview?key=${encodeURIComponent(key)}`, { timeout: 65000 });

export const likePin = (pinId) =>
  apiFetch(`/pins/${pinId}/like`, { method: 'POST' });

export const savePin = (pinId) =>
  apiFetch(`/pins/${pinId}/save`, { method: 'POST' });

export const getPinComments = (pinId) => apiFetch(`/pins/${pinId}/comments`);

export const createPinComment = (pinId, content) =>
  apiFetch(`/pins/${pinId}/comments`, { method: 'POST', body: { content } });

export const getUploadUrl = (filename, contentType) =>
  apiFetch('/uploads/presigned-url', {
    method: 'POST',
    body: { filename, content_type: contentType },
  });

export const uploadLocal = (key, file) =>
  apiFetch(`/uploads/local-upload?key=${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: file,
    rawBody: true,
    auth: false,
    timeout: 60000,
  });

export const getCategories = () => apiFetch('/categories');

export const getUserPins = () => apiFetch('/users/me/pins');

export const getUserNotifications = () => apiFetch('/users/me/notifications');

export const getSavedPins = () => apiFetch('/users/me/saved');

export const getLikedPins = () => apiFetch('/users/me/liked');

export const submitFeedback = (rating, comment) =>
  apiFetch('/users/feedback', { method: 'POST', body: { rating, comment } });

export const getMyProfile = () => apiFetch('/users/me/profile');

export const updateMyProfile = (profileData) =>
  apiFetch('/users/me/profile', { method: 'PUT', body: profileData });

export const getPublicProfile = (userId) =>
  apiFetch(`/users/${userId}/public`, { auth: false });

export const getPublicUserPins = (userId, page = 1) =>
  apiFetch(`/users/${userId}/pins?page=${page}&size=30`, { auth: false });

export const searchUsers = (q) =>
  apiFetch(`/users/search?q=${encodeURIComponent(q)}`, { auth: false });

export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append('file', file);
  const token = getToken();
  const res = await fetch(`${API_URL}/users/me/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data?.detail || 'Error al subir el avatar.', res.status, data?.detail);
  }
  return res.json();
};

export const reportContent = (entityType, entityId, reason, details = '') =>
  apiFetch('/reports', {
    method: 'POST',
    body: { entity_type: entityType, entity_id: entityId, reason, details },
  });

export const verifyPin = (pinId, verifiedStatus) =>
  apiFetch(`/pins/${pinId}/verify`, {
    method: 'PATCH',
    body: { verified_status: verifiedStatus },
  });

export const updatePinStatus = (pinId, status) =>
  apiFetch(`/pins/${pinId}/status`, { method: 'PATCH', body: { status } });

export const adminGetMetrics = () => apiFetch('/admin/metrics');

export const adminGetUsers = (page = 1, size = 25) =>
  apiFetch(`/admin/users?page=${page}&size=${size}`);

export const adminGetPins = (status = null, page = 1, size = 25) => {
  let url = `/admin/pins?page=${page}&size=${size}`;
  if (status) url += `&status=${status}`;
  return apiFetch(url);
};

export const adminGetReports = (status = null, page = 1, size = 25) => {
  let url = `/admin/reports?page=${page}&size=${size}`;
  if (status) url += `&status=${status}`;
  return apiFetch(url);
};

export const adminGetReportStats = () => apiFetch('/admin/reports/stats');

export const adminGetValidations = (page = 1, size = 25) =>
  apiFetch(`/admin/validations?page=${page}&size=${size}`);

export const adminGetRatingsSummary = () => apiFetch('/admin/ratings/summary');

export const adminGetAudit = (page = 1, size = 50) =>
  apiFetch(`/admin/audit?page=${page}&size=${size}`);

export const adminResolveReport = (reportId, actionTaken, notes = '') =>
  apiFetch(`/moderation/reports/${reportId}/resolve`, {
    method: 'POST',
    body: { action_taken: actionTaken, notes },
  });

export const deletePin = (pinId) =>
  apiFetch(`/pins/${pinId}`, { method: 'DELETE' });

export function isModeratorRole() {
  const user = getStoredUser();
  return user && [1, 2, 3].includes(user.RoleId);
}
