/**
 * modal.js - Controlador de modales reutilizables
 */
const NexusModal = (() => {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  const close = () => {
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.innerHTML = "";
    }, 300);
  };

  const confirm = (title, message, confirmText, onConfirm, type = "primary") => {
    overlay.innerHTML = `
      <div class="modal-content">
        <h3 class="modal-title">${title}</h3>
        <p class="text-muted">${message}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" id="modalCancel">Cancelar</button>
          <button class="btn btn-${type}" id="modalConfirm">${confirmText}</button>
        </div>
      </div>
    `;
    
    document.getElementById("modalCancel").addEventListener("click", close);
    document.getElementById("modalConfirm").addEventListener("click", () => {
      onConfirm();
      close();
    });
    
    overlay.classList.add("active");
  };

  const report = (entityType, entityId, onSubmit) => {
    overlay.innerHTML = `
      <div class="modal-content">
        <h3 class="modal-title">Reportar Contenido</h3>
        <p class="text-muted mb-3">Ayúdanos a mantener Nexus seguro. Selecciona un motivo:</p>
        
        <div class="form-group">
          <select id="reportReason" class="form-control mb-2">
            <option value="Contenido inapropiado u ofensivo">Contenido inapropiado u ofensivo</option>
            <option value="Posible plagio / Derechos de autor">Posible plagio / Derechos de autor</option>
            <option value="Información falsa o engañosa">Información falsa o engañosa</option>
            <option value="Contenido sensible no marcado">Contenido sensible no marcado</option>
            <option value="Spam">Spam</option>
            <option value="Otro">Otro</option>
          </select>
          <textarea id="reportDetails" class="form-control" placeholder="Detalles adicionales (Opcional)"></textarea>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-outline" id="modalCancel">Cancelar</button>
          <button class="btn btn-primary" id="modalSubmit">Enviar Reporte</button>
        </div>
      </div>
    `;

    document.getElementById("modalCancel").addEventListener("click", close);
    document.getElementById("modalSubmit").addEventListener("click", () => {
      const reason = document.getElementById("reportReason").value;
      const details = document.getElementById("reportDetails").value;
      onSubmit(entityType, entityId, reason, details);
      close();
    });

    overlay.classList.add("active");
  };

  return { confirm, report, close };
})();
