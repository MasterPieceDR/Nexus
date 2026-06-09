const tokenKey = "nexus_token";
const userKey = "nexus_user";

const form = document.querySelector("#constellationForm");
const myGrid = document.querySelector("#myConstellationsGrid");
const publicGrid = document.querySelector("#publicConstellationsGrid");
const myState = document.querySelector("#myConstellationsState");
const publicState = document.querySelector("#publicConstellationsState");
const searchInput = document.querySelector("#searchConstellations");
const logoutBtn = document.querySelector("#logoutBtn");

const getToken = () => localStorage.getItem(tokenKey);

const getUser = () => {
    const raw = localStorage.getItem(userKey);
    return raw ? JSON.parse(raw) : null;
};

const request = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    const token = getToken();

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${window.NEXUS_CONFIG.API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.detail || "No se pudo completar la solicitud");
    }

    return data;
};

const galaxyAccents = [
    "#00ff38",
    "#22c55e",
    "#84cc16",
    "#10b981",
    "#4ade80",
    "#65a30d"
];

const createCard = item => {
    const card = document.createElement("a");
    card.className = "constellation-card galaxy-card";
    card.href = `constelacion.html?id=${item.BoardId}&v=galaxy`;

    const accent = galaxyAccents[Math.floor(Math.random() * galaxyAccents.length)];
    card.style.setProperty("--galaxy-accent", accent);

    const totalNodes = Number(item.TotalNodes || 0);

    card.innerHTML = `
        <div class="galaxy-background">
            <span class="star star-1"></span>
            <span class="star star-2"></span>
            <span class="star star-3"></span>
            <span class="star star-4"></span>
            <span class="star star-5"></span>

            <svg class="galaxy-lines" viewBox="0 0 260 180" aria-hidden="true">
                <path d="M42 118 C78 42, 142 34, 208 78" />
                <path d="M58 142 C96 92, 150 102, 218 38" />
                <path d="M76 56 L132 94 L198 70 L226 128" />
            </svg>

            <span class="planet planet-1"></span>
            <span class="planet planet-2"></span>
            <span class="planet planet-3"></span>
            <span class="planet planet-4"></span>
        </div>

        <div class="galaxy-content">
            <span class="galaxy-label">Constelación Nexus</span>
            <h3>${item.Name}</h3>
            <p>${item.Description || "Mapa visual de ideas, recursos y nodos conectados."}</p>

            <div class="galaxy-meta">
                <span>${totalNodes} nodos</span>
                <span>${item.Visibility || "PUBLIC"}</span>
            </div>
        </div>
    `;

    return card;
};

const renderGrid = (container, state, items, emptyMessage) => {
    container.innerHTML = "";

    if (!items.length) {
        state.textContent = emptyMessage;
        return;
    }

    state.textContent = "";

    items.forEach(item => {
        container.appendChild(createCard(item));
    });
};

const loadPublicConstellations = async (search = "") => {
    publicState.textContent = "Cargando constelaciones públicas...";

    try {
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const items = await request(`/constellations${query}`);
        renderGrid(publicGrid, publicState, items, "No hay constelaciones públicas todavía.");
    } catch (error) {
        publicState.textContent = error.message;
    }
};

const loadMyConstellations = async () => {
    const token = getToken();

    if (!token) {
        myState.textContent = "Inicia sesión para crear y ver tus constelaciones.";
        myGrid.innerHTML = "";
        form.style.display = "none";
        return;
    }

    form.style.display = "grid";
    myState.textContent = "Cargando tus constelaciones...";

    try {
        const items = await request("/constellations/me");
        renderGrid(myGrid, myState, items, "Todavía no has creado constelaciones.");
    } catch (error) {
        myState.textContent = error.message;
    }
};

form.addEventListener("submit", async event => {
    event.preventDefault();

    const payload = {
        name: form.name.value.trim(),
        description: form.description.value.trim(),
        visibility: form.visibility.value
    };

    if (!payload.name || payload.name.length < 3) {
        alert("El nombre debe tener al menos 3 caracteres.");
        return;
    }

    try {
        await request("/constellations", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        form.reset();
        await loadMyConstellations();
        await loadPublicConstellations();
    } catch (error) {
        alert(error.message);
    }
});

searchInput.addEventListener("input", event => {
    const value = event.target.value.trim();

    clearTimeout(window.constellationSearchTimer);
    window.constellationSearchTimer = setTimeout(() => {
        loadPublicConstellations(value);
    }, 400);
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    window.location.href = "login.html";
});

loadMyConstellations();
loadPublicConstellations();
