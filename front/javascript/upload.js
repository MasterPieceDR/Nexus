document.addEventListener("DOMContentLoaded", async () => {
  PinCloudSession.requireAuth();

  const form = document.getElementById("uploadForm");
  const categorySelect = document.getElementById("categoryId");
  const formMessage = document.getElementById("formMessage");

  const setMessage = (message, type = "") => {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`.trim();
  };

  try {
    const categories = await PinCloudAPI.get("/categories");
    categorySelect.innerHTML = categories.map(category => `<option value="${category.id}">${category.name}</option>`).join("");
  } catch (error) {
    setMessage(error.message, "error");
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setMessage("Preparando archivo...");

    const file = document.getElementById("mediaFile").files[0];

    if (!file) {
      setMessage("Selecciona un archivo", "error");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setMessage("El archivo supera el límite de 15 MB", "error");
      return;
    }

    try {
      const uploadData = await PinCloudAPI.post("/uploads/presigned-url", {
        filename: file.name,
        content_type: file.type
      });

      setMessage("Subiendo archivo a S3...");
      const uploadResponse = await PinCloudAPI.putFile(uploadData.upload_url, file, file.type);

      if (!uploadResponse.ok) {
        throw new Error("No se pudo subir el archivo a S3");
      }

      setMessage("Guardando publicación...");

      await PinCloudAPI.post("/pins", {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        category_id: Number(categorySelect.value),
        tags: document.getElementById("tags").value.trim(),
        s3_key: uploadData.s3_key,
        media_type: file.type
      });

      setMessage("Publicación creada correctamente. Puede quedar pendiente de revisión.", "success");
      form.reset();
      setTimeout(() => window.location.href = "usuario.html", 900);
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
});
