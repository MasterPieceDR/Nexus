/**
 * ui.js - Manejo de componentes visuales compartidos
 */
const NexusUI = (() => {
  
  // Toasts
  const showToast = (message, type = "success") => {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 10);
    
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Header Rendering based on Role
  const renderHeader = () => {
    const user = typeof NexusSession !== 'undefined' ? NexusSession.getUser() : null;
    const authActions = document.getElementById("authActions");
    const userMenu = document.getElementById("userMenu");
    const modLink = document.getElementById("navModeracion");
    const createLink = document.getElementById("navCrear");
    
    if (user) {
      if (authActions) authActions.style.display = "none";
      if (userMenu) {
        userMenu.style.display = "block";
        const avatar = userMenu.querySelector(".user-avatar");
        if(avatar) {
          avatar.textContent = user.DisplayName.charAt(0).toUpperCase();
          if(user.AvatarUrl) {
            avatar.innerHTML = `<img src="${user.AvatarUrl}" alt="${user.DisplayName}">`;
          }
        }
      }
      if (createLink) createLink.style.display = "block";
      
      // Mostrar moderación solo si es MODERATOR (2) o ADMIN (1)
      if (modLink && (user.RoleId === 1 || user.RoleId === 2)) {
        modLink.style.display = "block";
      }
    } else {
      if (authActions) authActions.style.display = "block";
      if (userMenu) userMenu.style.display = "none";
      if (modLink) modLink.style.display = "none";
      if (createLink) createLink.style.display = "none";
    }
  };

  const setupDropdowns = () => {
    document.addEventListener("click", e => {
      const isDropdownBtn = e.target.closest(".user-menu");
      if (!isDropdownBtn && e.target.closest(".dropdown-menu") != null) return;
      
      let currentDropdown;
      if (isDropdownBtn) {
        currentDropdown = isDropdownBtn.querySelector(".dropdown-menu");
        currentDropdown.classList.toggle("show");
      }
      
      document.querySelectorAll(".dropdown-menu.show").forEach(dropdown => {
        if (dropdown === currentDropdown) return;
        dropdown.classList.remove("show");
      });
    });
  };

  const init = () => {
    renderHeader();
    setupDropdowns();
    
    const logoutBtn = document.getElementById("logoutBtn");
    if(logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if(typeof NexusSession !== 'undefined') {
          NexusSession.clearSession();
          window.location.href = "index.html";
        }
      });
    }
  };

  return {
    showToast,
    init,
    renderHeader
  };
})();

document.addEventListener("DOMContentLoaded", NexusUI.init);
