const params = new URLSearchParams(window.location.search);
const boardId = params.get("id");

const title = document.querySelector("#galaxyTitle");
const description = document.querySelector("#galaxyDescription");
const starsLayer = document.querySelector("#starsLayer");
const previewImage = document.querySelector("#previewImage");
const previewTitle = document.querySelector("#previewTitle");
const previewText = document.querySelector("#previewText");

const request = async path => {
    const response = await fetch(`${window.NEXUS_CONFIG.API_BASE_URL}${path}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "No se pudo cargar la galaxia");
    }

    return data;
};

const createStar = node => {
    const star = document.createElement("button");
    star.className = "star-node";
    star.type = "button";
    star.dataset.title = node.Title;

    star.style.left = `${node.XPercent}%`;
    star.style.top = `${node.YPercent}%`;
    star.style.setProperty("--star-size", `${node.StarSize || 16}px`);
    star.style.setProperty("--star-color", node.StarColor || "#00ff38");
    star.style.animationDelay = `${Math.random() * 2}s`;

    star.addEventListener("mouseenter", () => {
        previewImage.src = node.MediaUrl || "";
        previewImage.alt = node.Title;
        previewTitle.textContent = node.Title;
        previewText.textContent = node.Description || node.CategoryName || "Nodo de la constelación";
    });

    star.addEventListener("click", () => {
        window.location.href = `detalle.html?id=${node.PinId}`;
    });

    return star;
};

const loadGalaxy = async () => {
    if (!boardId) {
        title.textContent = "Constelación no encontrada";
        description.textContent = "No se recibió un identificador válido.";
        return;
    }

    try {
        const data = await request(`/constellations/${boardId}/galaxy`);

        title.textContent = data.constellation.Name;
        description.textContent = data.constellation.Description || "Mapa visual de nodos conectados.";

        starsLayer.innerHTML = "";

        if (!data.nodes.length) {
            description.textContent = "Esta constelación todavía no tiene nodos aprobados.";
            return;
        }

        data.nodes.forEach(node => {
            starsLayer.appendChild(createStar(node));
        });

        const first = data.nodes[0];
        previewImage.src = first.MediaUrl || "";
        previewImage.alt = first.Title;
        previewTitle.textContent = first.Title;
        previewText.textContent = first.Description || first.CategoryName || "Nodo de la constelación";
    } catch (error) {
        title.textContent = "Error al cargar galaxia";
        description.textContent = error.message;
    }
};

loadGalaxy();
