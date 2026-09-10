const baseURL = import.meta.env.VITE_API_BASE_URL || '';

async function request(method, url, data = null, options = {}) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  };

  let fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
  if (options.params) {
    const query = new URLSearchParams(options.params).toString();
    if (query) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + query;
    }
  }

  if (data !== null && data !== undefined && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = typeof data === 'string' ? data : JSON.stringify(data);
  }

  const res = await fetch(fullUrl, config);
  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch (_) {}
    const err = new Error(errorData.detail || errorData.message || `HTTP ${res.status}`);
    err.response = { data: errorData, status: res.status };
    throw err;
  }

  try {
    const json = await res.json();
    return { data: json, status: res.status };
  } catch (_) {
    return { data: null, status: res.status };
  }
}

export const api = {
  get: (url, options) => request('GET', url, null, options),
  post: (url, data, options) => request('POST', url, data, options),
  put: (url, data, options) => request('PUT', url, data, options),
  delete: (url, options) => request('DELETE', url, null, options),
};

export default api;
