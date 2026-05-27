const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const formMessage = document.getElementById("formMessage");

const setMessage = (message, type = "") => {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`.trim();
};

if (registerForm) {
  registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    setMessage("Creando cuenta...");

    const payload = {
      full_name: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim().toLowerCase(),
      password: document.getElementById("password").value
    };

    try {
      const data = await PinCloudAPI.post("/auth/register", payload);
      PinCloudSession.setSession(data);
      setMessage("Cuenta creada correctamente", "success");
      setTimeout(() => window.location.href = "usuario.html", 700);
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    setMessage("Validando credenciales...");

    const payload = {
      email: document.getElementById("email").value.trim().toLowerCase(),
      password: document.getElementById("password").value
    };

    try {
      const data = await PinCloudAPI.post("/auth/login", payload);
      PinCloudSession.setSession(data);
      setMessage("Inicio de sesión correcto", "success");
      setTimeout(() => window.location.href = "index.html", 700);
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
}
