const PinCloudSession = (() => {
  const tokenKey = "pincloud_token";
  const userKey = "pincloud_user";

  const setSession = payload => {
    localStorage.setItem(tokenKey, payload.access_token);
    localStorage.setItem(userKey, JSON.stringify(payload.user));
  };

  const clearSession = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  };

  const getUser = () => {
    const raw = localStorage.getItem(userKey);
    return raw ? JSON.parse(raw) : null;
  };

  const isAuthenticated = () => Boolean(localStorage.getItem(tokenKey));

  const requireAuth = () => {
    if (!isAuthenticated()) {
      window.location.href = "login.html";
    }
  };

  const renderSessionActions = () => {
    const container = document.getElementById("sessionActions");
    if (!container) return;

    const user = getUser();
    container.replaceChildren();

    if (!user) {
      const loginLink = document.createElement("a");
      loginLink.className = "btn ghost";
      loginLink.href = "login.html";
      loginLink.textContent = "Iniciar sesión";

      const registerLink = document.createElement("a");
      registerLink.className = "btn primary";
      registerLink.href = "register.html";
      registerLink.textContent = "Registrarse";

      container.appendChild(loginLink);
      container.appendChild(registerLink);
      return;
    }

    const userLink = document.createElement("a");
    userLink.className = "btn ghost";
    userLink.href = "usuario.html";
    userLink.textContent = user.full_name.split(" ")[0];

    const logoutButton = document.createElement("button");
    logoutButton.className = "btn soft";
    logoutButton.id = "logoutButton";
    logoutButton.type = "button";
    logoutButton.textContent = "Salir";

    container.appendChild(userLink);
    container.appendChild(logoutButton);

    logoutButton.addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  };

  const protectLinks = () => {
    document.querySelectorAll(".protected-link").forEach(link => {
      link.addEventListener("click", event => {
        if (!isAuthenticated()) {
          event.preventDefault();
          window.location.href = "login.html";
        }
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderSessionActions();
    protectLinks();
  });

  return {
    setSession,
    clearSession,
    getUser,
    isAuthenticated,
    requireAuth,
    renderSessionActions
  };
})();
