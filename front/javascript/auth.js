const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const formMessage = document.getElementById("formMessage");

const setMessage = (message, type = "") => {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`.trim();
  formMessage.style.display = "block";
};

if (registerForm) {
  registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    setMessage("Creando cuenta...");

    const firstNameVal = document.getElementById("firstName").value.trim();
    const lastNameVal = document.getElementById("lastName").value.trim();
    const passwordVal = document.getElementById("password").value;
    const confirmPasswordVal = document.getElementById("confirmPassword").value;
    
    if (firstNameVal.split(/\s+/).length < 2) {
      setMessage("Debes ingresar tus dos nombres.", "error");
      return;
    }
    
    if (lastNameVal.split(/\s+/).length < 2) {
      setMessage("Debes ingresar tus dos apellidos.", "error");
      return;
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(passwordVal)) {
      setMessage("Tu contraseña es muy débil. Debe ser 'Fuerte' (mínimo 8 caracteres, letras, números y al menos un símbolo).", "error");
      return;
    }

    if (passwordVal !== confirmPasswordVal) {
      setMessage("Las contraseñas no coinciden.", "error");
      return;
    }

    const payload = {
      first_name: firstNameVal,
      last_name: lastNameVal,
      email: document.getElementById("email").value.trim().toLowerCase(),
      password: document.getElementById("password").value
    };

    try {
      const data = await NexusAPI.post("/auth/register", payload);
      NexusSession.setSession(data);
      setMessage("Cuenta creada correctamente", "success");
      setTimeout(() => window.location.href = "usuario.html", 700);
    } catch (error) {
      setMessage(error.message, "error");
    }
  });

  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("input", function() {
      const val = this.value;
      const bar = document.getElementById("passwordStrengthBar");
      const text = document.getElementById("passwordStrengthText");
      
      if (val.length === 0) {
        bar.style.width = "0%";
        text.textContent = "";
        return;
      }
      
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Za-z]/.test(val) && /\d/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;
      
      if (strength === 0 || val.length < 8) {
        bar.style.width = "33%";
        bar.style.backgroundColor = "#ff4d4d"; // Rojo
        text.textContent = "Débil (Usa al menos 8 caracteres, letras y números)";
        text.style.color = "#ff4d4d";
      } else if (strength === 1 || (strength === 2 && !/[^A-Za-z0-9]/.test(val))) {
        bar.style.width = "66%";
        bar.style.backgroundColor = "#ffc107"; // Amarillo
        text.textContent = "Media (Agrega símbolos para mayor seguridad)";
        text.style.color = "#ffc107";
      } else {
        bar.style.width = "100%";
        bar.style.backgroundColor = "#00ff66"; // Verde
        text.textContent = "Fuerte";
        text.style.color = "#00ff66";
      }
    });
  }
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
      const data = await NexusAPI.post("/auth/login", payload);
      NexusSession.setSession(data);
      setMessage("Inicio de sesión correcto", "success");
      setTimeout(() => window.location.href = "index.html", 700);
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
}

// Google Identity Services Integration
window.onload = function () {
  if (window.google && window.google.accounts) {
    google.accounts.id.initialize({
      client_id: window.NEXUS_CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
      context: registerForm ? "signup" : "signin"
    });
    
    const container = document.getElementById("googleButtonContainer");
    if (container) {
      google.accounts.id.renderButton(
        container,
        { theme: "outline", size: "large", type: "standard", shape: "pill", width: "100%" }
      );
    }
  }
};

async function handleGoogleCredentialResponse(response) {
  setMessage("Validando credenciales de Google...");
  try {
    const data = await NexusAPI.post("/auth/google", { id_token: response.credential });
    NexusSession.setSession(data);
    setMessage("Inicio de sesión correcto", "success");
    setTimeout(() => window.location.href = "index.html", 700);
  } catch (error) {
    setMessage(error.message, "error");
  }
}
