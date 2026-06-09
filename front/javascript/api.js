const NexusAPI = (() => {
  const baseUrl = window.NEXUS_CONFIG.API_BASE_URL;

  const getToken = () => localStorage.getItem("nexus_token");

  const request = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    const token = getToken();

    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");
        window.location.href = "login.html";
        return;
      }
      const message = data.detail || data.message || "No se pudo completar la solicitud";
      throw new Error(message);
    }

    return data;
  };

  return {
    baseUrl,
    get: path => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
    putFile: (url, file, contentType) => fetch(url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file
    })
  };
})();
