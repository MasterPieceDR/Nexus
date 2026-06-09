/**
 * moderacion.js - Lógica del Panel de Revisión Ética
 */
document.addEventListener("DOMContentLoaded", () => {
  if (!NexusSession.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const user = NexusSession.getUser();
  if (user.RoleId !== 1 && user.RoleId !== 2) { // 1 = Admin, 2 = Moderator
    window.location.href = "index.html";
    return;
  }

  const tabs = document.querySelectorAll(".mod-tab");
  const pendingNodesView = document.getElementById("pendingNodesView");
  const reportsView = document.getElementById("reportsView");
  
  const loadingNodes = document.getElementById("loadingNodes");
  const emptyNodes = document.getElementById("emptyNodes");
  const pendingGrid = document.getElementById("pendingGrid");

  const loadingReports = document.getElementById("loadingReports");
  const emptyReports = document.getElementById("emptyReports");
  const reportsList = document.getElementById("reportsList");

  // Tabs logic
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      if (tab.dataset.tab === "PENDING_NODES") {
        pendingNodesView.style.display = "block";
        reportsView.style.display = "none";
        loadPendingNodes();
      } else {
        pendingNodesView.style.display = "none";
        reportsView.style.display = "block";
        loadReports();
      }
    });
  });

  const handleModeration = async (pinId, status) => {
    try {
      await NexusAPI.post(`/moderation/pins/${pinId}/status`, { status });
      NexusUI.showToast(`Nodo marcado como ${status}`, "success");
      loadPendingNodes();
    } catch (error) {
      NexusUI.showToast(error.message, "error");
    }
  };

  const createPendingCard = (node) => {
    const card = document.createElement("div");
    card.className = "mod-card";
    
    const isVideo = node.MediaKind === 'VIDEO';
    const mediaHtml = isVideo 
      ? `<video src="${node.MediaUrl}" class="mod-card-media" controls></video>`
      : `<img src="${node.MediaUrl}" class="mod-card-media">`;

    card.innerHTML = `
      ${mediaHtml}
      <div class="mod-card-body">
        <h3 class="mod-card-title">${node.Title}</h3>
        <p class="mod-card-meta">
          Autor ID: ${node.OwnerUserId} <br>
          IA: ${node.IsAiGenerated ? 'Sí' : 'No'} | Sensible: ${node.IsSensitive ? 'Sí' : 'No'}
        </p>
        <div class="mod-card-actions">
          <button class="btn btn-danger btn-reject">Rechazar</button>
          <button class="btn btn-success" style="background-color: var(--color-success); color:white;" class="btn-approve">Aprobar</button>
        </div>
      </div>
    `;

    card.querySelector(".btn-reject").addEventListener("click", () => handleModeration(node.PinId, "REJECTED"));
    card.querySelector(".btn-success").addEventListener("click", () => handleModeration(node.PinId, "APPROVED"));

    return card;
  };

  const loadPendingNodes = async () => {
    pendingGrid.innerHTML = "";
    emptyNodes.style.display = "none";
    loadingNodes.style.display = "block";

    try {
      // Usar endpoint de búsqueda o crear uno para pendientes
      // Para efectos de Nexus: asumimos un endpoint `/api/moderation/pending`
      const nodes = await NexusAPI.get("/moderation/pending");
      
      loadingNodes.style.display = "none";
      
      if (!nodes || nodes.length === 0) {
        emptyNodes.style.display = "block";
        return;
      }

      nodes.forEach(n => {
        pendingGrid.appendChild(createPendingCard(n));
      });
    } catch (error) {
      loadingNodes.style.display = "none";
      NexusUI.showToast("Error al cargar pendientes: " + error.message, "error");
    }
  };

  const handleReportResolution = async (reportId, action) => {
    try {
      await NexusAPI.post(`/moderation/reports/${reportId}/resolve`, {
        action_taken: action,
        notes: `Resuelto por ${user.DisplayName}`
      });
      NexusUI.showToast("Reporte resuelto", "success");
      loadReports();
    } catch (error) {
      NexusUI.showToast(error.message, "error");
    }
  };

  const loadReports = async () => {
    reportsList.innerHTML = "";
    emptyReports.style.display = "none";
    loadingReports.style.display = "block";

    try {
      const reports = await NexusAPI.get("/moderation/reports");
      
      loadingReports.style.display = "none";
      
      const openReports = reports.filter(r => r.Status === "OPEN");

      if (openReports.length === 0) {
        emptyReports.style.display = "block";
        return;
      }

      openReports.forEach(r => {
        const item = document.createElement("div");
        item.className = "report-item";
        item.innerHTML = `
          <div class="report-info">
            <h4>${r.Reason}</h4>
            <p class="mb-1">${r.Details || 'Sin detalles'}</p>
            <p class="report-meta">Reportado el: ${new Date(r.CreatedAt).toLocaleDateString()} | Entidad: ${r.EntityType} ${r.EntityId}</p>
          </div>
          <div class="report-actions">
            <button class="btn btn-outline mb-2 w-100 btn-dismiss">Ignorar Reporte</button>
            <button class="btn btn-danger w-100 btn-delete">Eliminar Contenido</button>
          </div>
        `;
        
        item.querySelector(".btn-dismiss").addEventListener("click", () => handleReportResolution(r.ReportId, "DISMISSED"));
        item.querySelector(".btn-delete").addEventListener("click", () => handleReportResolution(r.ReportId, "CONTENT_REMOVED"));

        reportsList.appendChild(item);
      });
    } catch (error) {
      loadingReports.style.display = "none";
      NexusUI.showToast("Error al cargar reportes", "error");
    }
  };

  // Init
  loadPendingNodes();
});
