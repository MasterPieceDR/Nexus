/**
 * upload.js - Lógica para crear nodos
 */
document.addEventListener("DOMContentLoaded", () => {
  if (!NexusSession.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const dropArea = document.getElementById("dropArea");
  const mediaFile = document.getElementById("mediaFile");
  const previewContainer = document.getElementById("mediaPreviewContainer");
  const imagePreview = document.getElementById("imagePreview");
  const videoPreview = document.getElementById("videoPreview");
  const clearMediaBtn = document.getElementById("clearMediaBtn");
  const uploadForm = document.getElementById("uploadForm");
  const categorySelect = document.getElementById("category");
  const boardSelect = document.getElementById("boardId");
  const publishBtn = document.getElementById("publishBtn");
  
  let selectedFile = null;

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const categories = await NexusAPI.get("/categories");
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      NexusUI.showToast("No se pudieron cargar las áreas temáticas", "error");
    }
  };

  // Cargar constelaciones
  const loadMyConstellationsForUpload = async () => {
    try {
        const items = await NexusAPI.get("/constellations/me");

        boardSelect.innerHTML = `<option value="">Sin constelación</option>`;

        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item.BoardId;
            option.textContent = item.Name;
            boardSelect.appendChild(option);
        });
    } catch (error) {
        boardSelect.innerHTML = `<option value="">Sin constelación</option>`;
    }
  };

  // Drag and Drop Logic
  const handleFiles = (files) => {
    if (files.length === 0) return;
    const file = files[0];

    if (file.size > 15 * 1024 * 1024) {
      NexusUI.showToast("El archivo excede el límite de 15MB", "error");
      return;
    }

    selectedFile = file;
    dropArea.style.display = "none";
    previewContainer.style.display = "block";

    const fileUrl = URL.createObjectURL(file);
    if (file.type.startsWith("video/")) {
      imagePreview.style.display = "none";
      videoPreview.style.display = "block";
      videoPreview.src = fileUrl;
    } else {
      videoPreview.style.display = "none";
      imagePreview.style.display = "block";
      imagePreview.src = fileUrl;
    }
  };

  dropArea.addEventListener("click", () => mediaFile.click());
  
  mediaFile.addEventListener("change", (e) => handleFiles(e.target.files));

  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });

  clearMediaBtn.addEventListener("click", () => {
    selectedFile = null;
    mediaFile.value = "";
    previewContainer.style.display = "none";
    dropArea.style.display = "flex";
    imagePreview.src = "";
    videoPreview.src = "";
  });

  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      NexusUI.showToast("Debes seleccionar un archivo multimedia", "error");
      return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = "Subiendo archivo...";

    try {
      const fileName = `${Date.now()}-${selectedFile.name.replace(/\s+/g, '-')}`;
      const fileType = selectedFile.type;

      // 1. Obtener URL presignada
      const presigned = await NexusAPI.post("/uploads/presigned-url", {
        file_name: fileName,
        file_type: fileType
      });

      // 2. Subir directamente a S3 (o bucket local) usando PUT normal
      await fetch(presigned.upload_url, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: selectedFile
      });

      publishBtn.textContent = "Guardando nodo...";

      // 3. Registrar Nodo en BD
      const title = document.getElementById("title").value.trim();
      const description = document.getElementById("description").value.trim();
      const categoryId = Number(categorySelect.value);
      const tags = document.getElementById("tags").value.trim();
      const isAiGenerated = document.getElementById("isAiGenerated").checked;
      const isSensitive = document.getElementById("isSensitive").checked;
      const boardId = boardSelect.value ? Number(boardSelect.value) : null;

      await NexusAPI.post("/pins", {
        title: title,
        description: description,
        category_id: categoryId,
        board_id: boardId,
        tags: tags,
        s3_key: presigned.s3_key,
        media_type: fileType,
        is_ai_generated: isAiGenerated,
        is_sensitive: isSensitive
      });

      NexusUI.showToast("Tu nodo ha sido enviado a revisión", "success");
      setTimeout(() => {
        window.location.href = "usuario.html"; // Redirigir a usuario para que vea "Pendientes"
      }, 1500);

    } catch (error) {
      publishBtn.disabled = false;
      publishBtn.textContent = "Publicar nodo";
      NexusUI.showToast(error.message, "error");
    }
  });

  loadCategories();
  loadMyConstellationsForUpload();
});
