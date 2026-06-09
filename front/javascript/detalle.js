/**
 * detalle.js - Lógica para la visualización del nodo
 */
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pinId = urlParams.get("id");

  if (!pinId) {
    window.location.href = "index.html";
    return;
  }

  const loadingIndicator = document.getElementById("loadingIndicator");
  const detalleContent = document.getElementById("detalleContent");
  const commentForm = document.getElementById("commentForm");
  const commentInput = document.getElementById("commentInput");
  const loginToComment = document.getElementById("loginToComment");
  const saveBtn = document.getElementById("saveBtn");
  const reportBtn = document.getElementById("reportBtn");

  const loadPinData = async () => {
    try {
      const pin = await NexusAPI.get(`/pins/${pinId}`);
      
      // Mostrar info
      document.getElementById("nodeTitle").textContent = pin.Title;
      document.getElementById("nodeDesc").textContent = pin.Description || "";
      document.getElementById("authorName").textContent = pin.AuthorName || "Usuario anónimo";
      
      const dateStr = pin.PublishedAt ? new Date(pin.PublishedAt).toLocaleDateString() : "En revisión";
      document.getElementById("nodeDate").textContent = dateStr;

      // Badges
      const badgesContainer = document.getElementById("badgesContainer");
      badgesContainer.innerHTML = "";
      if (pin.IsAiGenerated) {
        badgesContainer.innerHTML += `<span class="badge badge-ia mr-2">Generado con IA</span> `;
      }
      if (pin.IsSensitive) {
        badgesContainer.innerHTML += `<span class="badge badge-sensitive mr-2">Sensible</span> `;
      }
      if (pin.Status === "PENDING") {
        badgesContainer.innerHTML += `<span class="badge badge-pending">Pendiente de revisión</span>`;
      }

      // Media
      const wrapper = document.getElementById("mediaWrapper");
      if (pin.MediaKind === 'VIDEO') {
        wrapper.innerHTML = `<video src="${pin.MediaUrl}" controls autoplay loop></video>`;
      } else {
        wrapper.innerHTML = `<img src="${pin.MediaUrl}" alt="${pin.Title}">`;
      }

      loadingIndicator.style.display = "none";
      detalleContent.style.display = "flex";

    } catch (error) {
      NexusUI.showToast("No se pudo cargar el nodo visual", "error");
      setTimeout(() => window.location.href = "index.html", 2000);
    }
  };

  const loadComments = async () => {
    try {
      const comments = await NexusAPI.get(`/pins/${pinId}/comments`);
      const list = document.getElementById("commentsList");
      list.innerHTML = "";

      if (comments.length === 0) {
        list.innerHTML = `<p class="text-muted">Aún no hay conexiones o comentarios. ¡Sé el primero!</p>`;
        return;
      }

      comments.forEach(c => {
        const date = new Date(c.CreatedAt).toLocaleDateString();
        const initial = c.author_name ? c.author_name.charAt(0).toUpperCase() : "U";
        
        list.innerHTML += `
          <div class="comment-item">
            <div class="comment-avatar">${initial}</div>
            <div class="comment-content">
              <div class="comment-author">${c.author_name}</div>
              <div class="comment-text">${c.Content}</div>
              <span class="comment-date">${date}</span>
            </div>
          </div>
        `;
      });
    } catch (error) {
      console.error("Error al cargar comentarios", error);
    }
  };

  // Autenticación para acciones
  if (NexusSession.isAuthenticated()) {
    loginToComment.style.display = "none";
    commentForm.style.display = "flex";

    saveBtn.addEventListener("click", async () => {
      try {
        await NexusAPI.post(`/pins/${pinId}/save`);
        saveBtn.textContent = "Guardado";
        saveBtn.classList.replace("btn-primary", "btn-outline");
        saveBtn.disabled = true;
        NexusUI.showToast("Nodo guardado en tu biblioteca", "success");
      } catch (error) {
        NexusUI.showToast(error.message, "error");
      }
    });

    reportBtn.addEventListener("click", () => {
      NexusModal.report("PIN", pinId, async (type, id, reason, details) => {
        try {
          await NexusAPI.post("/reports", {
            entity_type: type,
            entity_id: Number(id),
            reason: reason,
            details: details
          });
          NexusUI.showToast("Reporte enviado a revisión ética", "success");
          reportBtn.disabled = true;
        } catch (error) {
          NexusUI.showToast("Error al reportar: " + error.message, "error");
        }
      });
    });

    commentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const content = commentInput.value.trim();
      if (!content) return;

      const btn = document.getElementById("submitCommentBtn");
      btn.disabled = true;

      try {
        await NexusAPI.post(`/pins/${pinId}/comments`, { content });
        commentInput.value = "";
        NexusUI.showToast("Conexión añadida", "success");
        await loadComments();
      } catch (error) {
        NexusUI.showToast("Error al publicar comentario", "error");
      } finally {
        btn.disabled = false;
      }
    });

  } else {
    saveBtn.addEventListener("click", () => window.location.href = "login.html");
    reportBtn.addEventListener("click", () => window.location.href = "login.html");
  }

  // Inicializar
  loadPinData();
  loadComments();
});
