/**
 * index.js - Controlador principal de Explorar (Feed)
 */
document.addEventListener("DOMContentLoaded", () => {
  const feedContainer = document.getElementById("feedContainer");
  const categoriesBar = document.getElementById("categoriesBar");
  const searchInput = document.getElementById("searchInput");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const emptyState = document.getElementById("emptyState");
  
  // Redirigir a landing page si no hay sesión iniciada
  if (!NexusSession.isAuthenticated()) {
    window.location.href = "landing.html";
    return;
  }
  
  let currentCategory = "";
  let currentSearch = "";
  
  const loadCategories = async () => {
    try {
      const categories = await NexusAPI.get("/categories");
      categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "category-chip";
        btn.textContent = cat.name;
        btn.dataset.id = cat.id;
        
        btn.addEventListener("click", () => {
          document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
          btn.classList.add("active");
          currentCategory = cat.id;
          loadFeed();
        });
        
        categoriesBar.appendChild(btn);
      });
      
      // Manejar el botón "Todas"
      categoriesBar.firstElementChild.addEventListener("click", (e) => {
        document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
        e.target.classList.add("active");
        currentCategory = "";
        loadFeed();
      });
      
    } catch (error) {
      console.error("Error al cargar áreas:", error);
    }
  };

  const createNodeCard = (node) => {
    const card = document.createElement("div");
    card.className = "node-card masonry-item";
    
    // Si es MP4, mostramos video, sino imagen
    const isVideo = node.MediaKind === 'VIDEO';
    const mediaHtml = isVideo 
      ? `<video src="${node.MediaUrl}" class="node-image" autoplay loop muted playsinline></video>`
      : `<img src="${node.MediaUrl}" alt="${node.Title}" class="node-image" loading="lazy">`;

    card.innerHTML = `
      ${mediaHtml}
      <div class="node-overlay">
        <div class="node-overlay-top">
          <button class="node-btn node-btn-save" data-id="${node.PinId}">Guardar</button>
        </div>
      </div>
      <div class="node-info">
        <h3 class="node-title">${node.Title}</h3>
        <div class="node-author">
          <div class="node-author-img"></div>
          <span>${node.DisplayName}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      // Evitar que el click en "Guardar" abra el detalle
      if(e.target.classList.contains("node-btn-save")) {
        handleSave(node.PinId, e.target);
        return;
      }
      window.location.href = `detalle.html?id=${node.PinId}`;
    });

    return card;
  };

  const loadFeed = async () => {
    feedContainer.innerHTML = "";
    loadingIndicator.style.display = "block";
    emptyState.style.display = "none";
    
    try {
      let data = [];
      if (currentSearch || currentCategory) {
        let url = `/pins/search?page=1&size=30`;
        if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
        if (currentCategory) url += `&category_id=${currentCategory}`;
        data = await NexusAPI.get(url);
      } else {
        data = await NexusAPI.get("/pins/feed?page=1&size=30");
      }
      
      loadingIndicator.style.display = "none";
      
      if (data.length === 0) {
        emptyState.style.display = "block";
        return;
      }
      
      data.forEach(node => {
        feedContainer.appendChild(createNodeCard(node));
      });
      
    } catch (error) {
      loadingIndicator.style.display = "none";
      NexusUI.showToast("Error al cargar los nodos visuales", "error");
    }
  };

  const handleSave = async (pinId, button) => {
    if (!NexusSession.isAuthenticated()) {
      window.location.href = "login.html";
      return;
    }
    
    try {
      await NexusAPI.post(`/pins/${pinId}/save`);
      button.textContent = "Guardado";
      button.style.backgroundColor = "var(--color-text)";
      NexusUI.showToast("Nodo guardado en tu biblioteca", "success");
    } catch (error) {
      NexusUI.showToast(error.message || "No se pudo guardar", "error");
    }
  };

  // Buscador
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      currentSearch = searchInput.value.trim();
      loadFeed();
    }
  });

  // Init
  loadCategories();
  loadFeed();
});
