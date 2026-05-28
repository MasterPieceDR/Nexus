document.addEventListener("DOMContentLoaded", async () => {
  const feedGrid = document.getElementById("feedGrid");
  const statusMessage = document.getElementById("statusMessage");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const categoryList = document.getElementById("categoryList");
  const feedSummary = document.getElementById("feedSummary");
  const clearFilters = document.getElementById("clearFilters");
  
  let activeCategory = null;
  
  const landingShell = document.getElementById("landingShell");
  const feedShell = document.getElementById("feedShell");
  const publicNav = document.getElementById("publicNav");
  const privateNav = document.getElementById("privateNav");

  const isAuth = PinCloudSession.isAuthenticated();
  
  if (isAuth) {
    if (landingShell) landingShell.style.display = "none";
    if (feedShell) feedShell.style.display = "block";
    if (publicNav) publicNav.style.display = "none";
    if (privateNav) privateNav.style.display = "flex";
    if (searchForm) searchForm.style.display = "flex";
  } else {
    if (landingShell) landingShell.style.display = "block";
    if (feedShell) feedShell.style.display = "none";
    if (publicNav) publicNav.style.display = "flex";
    if (privateNav) privateNav.style.display = "none";
    if (searchForm) searchForm.style.display = "none";
  }

  const mockExploreBtn = document.getElementById("mockExploreBtn");
  if (mockExploreBtn) {
    mockExploreBtn.addEventListener("click", () => {
      if (landingShell) landingShell.style.display = "none";
      if (feedShell) feedShell.style.display = "block";
      if (publicNav) publicNav.style.display = "none";
      if (privateNav) privateNav.style.display = "flex";
      if (searchForm) searchForm.style.display = "flex";
      loadPosts();
    });
  }

  const loadScript = src => new Promise(resolve => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    document.body.appendChild(script);
  });

  await loadScript("../javascript/cards.js");

  const renderCategories = categories => {
    if (!categoryList) return;
    categoryList.replaceChildren();
    categories.forEach(category => {
      const button = document.createElement("button");
      button.className = "category-chip";
      button.type = "button";
      button.textContent = category.name;
      button.addEventListener("click", () => {
        activeCategory = category.id;
        document.querySelectorAll(".category-chip").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        loadPosts({ category_id: category.id });
      });
      categoryList.appendChild(button);
    });
  };

  const renderPosts = posts => {
    if (!feedGrid) return;
    feedGrid.replaceChildren();

    if (!posts.length) {
      statusMessage.textContent = "No existen publicaciones para mostrar.";
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.textContent = "No hay publicaciones.";
      feedGrid.appendChild(emptyState);
      return;
    }

    statusMessage.textContent = "";
    posts.forEach(post => feedGrid.appendChild(createPinCard(post)));
  };

  const loadPosts = async (params = {}) => {
    if (!feedGrid) return;
    statusMessage.textContent = "Cargando publicaciones...";
    const query = new URLSearchParams(params).toString();

    try {
      const posts = await PinCloudAPI.get(`/posts${query ? `?${query}` : ""}`);
      if (feedSummary) {
        feedSummary.textContent = params.search ? `Resultados para: ${params.search}` : "Contenido aprobado para la comunidad.";
      }
      renderPosts(posts);
    } catch (error) {
      statusMessage.textContent = error.message;
      statusMessage.classList.add("error");
    }
  };

  try {
    const categories = await PinCloudAPI.get("/categories");
    renderCategories(categories);
  } catch (error) {
    if (categoryList) {
      const errorBadge = document.createElement("span");
      errorBadge.className = "badge";
      errorBadge.textContent = "No se pudieron cargar categorías";
      categoryList.replaceChildren(errorBadge);
    }
  }

  if (searchForm) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      activeCategory = null;
      const search = searchInput.value.trim();
      loadPosts(search ? { search } : {});
    });
  }
  
  if (clearFilters) {
    clearFilters.addEventListener("click", () => {
      activeCategory = null;
      if (searchInput) searchInput.value = "";
      document.querySelectorAll(".category-chip").forEach(item => item.classList.remove("active"));
      loadPosts();
    });
  }

  if (isAuth) {
    loadPosts();
  }
});
