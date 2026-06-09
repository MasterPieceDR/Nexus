/**
 * usuario.js - Lógica para Mi Perfil
 */
document.addEventListener("DOMContentLoaded", () => {
  if (!NexusSession.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const user = NexusSession.getUser();
  const profileContent = document.getElementById("profileContent");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const emptyState = document.getElementById("emptyState");
  const profileFeed = document.getElementById("profileFeed");
  const tabs = document.querySelectorAll(".profile-tab");

  let allPins = [];

  // Set Profile Header Info
  document.getElementById("profileName").textContent = user.DisplayName;
  document.getElementById("profileUsername").textContent = `@${user.Username || user.DisplayName.toLowerCase().replace(/\s+/g, '')}`;
  
  const avatar = document.getElementById("profileAvatar");
  avatar.textContent = user.DisplayName.charAt(0).toUpperCase();
  if (user.AvatarUrl) {
    avatar.innerHTML = `<img src="${user.AvatarUrl}" alt="${user.DisplayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
  }

  const createNodeCard = (node) => {
    const card = document.createElement("div");
    card.className = "node-card masonry-item";
    
    const isVideo = node.MediaKind === 'VIDEO';
    const mediaHtml = isVideo 
      ? `<video src="${node.MediaUrl}" class="node-image" controls></video>`
      : `<img src="${node.MediaUrl}" alt="${node.Title}" class="node-image" loading="lazy">`;

    // Status Badge
    let badgeHtml = "";
    if (node.State === "PENDING") {
      badgeHtml = `<span class="badge badge-pending" style="position:absolute;top:8px;left:8px;z-index:1;">Pendiente</span>`;
    } else if (node.State === "REJECTED") {
      badgeHtml = `<span class="badge badge-sensitive" style="position:absolute;top:8px;left:8px;z-index:1;">Rechazado</span>`;
    }

    card.innerHTML = `
      ${badgeHtml}
      ${mediaHtml}
      <div class="node-overlay">
        <div class="node-overlay-top">
          <!-- Ocultamos el botón guardar porque son mis propios pines -->
        </div>
      </div>
      <div class="node-info">
        <h3 class="node-title">${node.Title}</h3>
        <p class="text-sm text-muted mb-0">Publicado: ${node.PublishedAt ? new Date(node.PublishedAt).toLocaleDateString() : 'N/A'}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `detalle.html?id=${node.PinId}`;
    });

    return card;
  };

  const renderFeed = (statusFilter = "ALL") => {
    profileFeed.innerHTML = "";
    
    let filtered = allPins;
    if (statusFilter !== "ALL") {
      filtered = allPins.filter(p => p.State === statusFilter);
    }

    if (filtered.length === 0) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
      filtered.forEach(node => {
        profileFeed.appendChild(createNodeCard(node));
      });
    }
  };

  const updateMetrics = () => {
    document.getElementById("metricPins").textContent = allPins.filter(p => p.State === "APPROVED").length;
    document.getElementById("metricPending").textContent = allPins.filter(p => p.State === "PENDING").length;
    // Guardados se cargarían en /me/saved si lo implementamos
  };

  const loadProfileData = async () => {
    loadingIndicator.style.display = "block";
    try {
      allPins = await NexusAPI.get("/users/me/pins");
      
      updateMetrics();
      renderFeed("ALL");
      
      loadingIndicator.style.display = "none";
      profileContent.style.display = "block";
    } catch (error) {
      loadingIndicator.style.display = "none";
      NexusUI.showToast("No se pudo cargar la información del perfil", "error");
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderFeed(tab.dataset.tab);
    });
  });

  loadProfileData();
});
