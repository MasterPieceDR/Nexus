document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const mediaView = document.getElementById("mediaView");
  const detailCategory = document.getElementById("detailCategory");
  const detailTitle = document.getElementById("detailTitle");
  const detailDescription = document.getElementById("detailDescription");
  const detailAuthor = document.getElementById("detailAuthor");
  const detailDate = document.getElementById("detailDate");
  const detailStatus = document.getElementById("detailStatus");
  const detailTags = document.getElementById("detailTags");
  const reportButton = document.getElementById("reportButton");
  const commentForm = document.getElementById("commentForm");
  const commentInput = document.getElementById("commentInput");
  const commentMessage = document.getElementById("commentMessage");
  const commentsList = document.getElementById("commentsList");

  if (!postId) {
    detailTitle.textContent = "Publicación no encontrada";
    return;
  }

  const renderComments = comments => {
    commentsList.replaceChildren();

    if (!comments.length) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.textContent = "Aún no existen comentarios.";
      commentsList.appendChild(emptyState);
      return;
    }

    comments.forEach(comment => {
      const article = document.createElement("article");
      article.className = "comment-item";
      
      const strong = document.createElement("strong");
      strong.textContent = comment.author_name;
      
      const p = document.createElement("p");
      p.textContent = comment.content;
      
      article.appendChild(strong);
      article.appendChild(p);
      commentsList.appendChild(article);
    });
  };

  const loadComments = async () => {
    const comments = await PinCloudAPI.get(`/posts/${postId}/comments`);
    renderComments(comments);
  };

  try {
    const post = await PinCloudAPI.get(`/posts/${postId}`);
    detailCategory.textContent = post.category_name || "Categoría";
    detailTitle.textContent = post.title;
    detailDescription.textContent = post.description || "Sin descripción";
    detailAuthor.textContent = `Publicado por ${post.author_name}`;
    detailDate.textContent = `Fecha: ${new Date(post.created_at).toLocaleDateString("es-EC")}`;
    detailStatus.textContent = `Estado: ${post.status}`;

    const isVideo = post.media_type && post.media_type.includes("video");
    const media = document.createElement(isVideo ? "video" : "img");
    media.src = post.media_url || "../assets/placeholder.svg";
    media.alt = post.title;

    if (isVideo) {
      media.controls = true;
    }

    mediaView.replaceChildren(media);

    detailTags.replaceChildren();
    const tags = (post.tags || "").split(",").map(tag => tag.trim()).filter(Boolean);
    tags.forEach(tag => {
      const span = document.createElement("span");
      span.className = "badge";
      span.textContent = tag;
      detailTags.appendChild(span);
    });

    await loadComments();
  } catch (error) {
    detailTitle.textContent = error.message;
  }

  reportButton.addEventListener("click", async () => {
    if (!PinCloudSession.isAuthenticated()) {
      window.location.href = "login.html";
      return;
    }

    try {
      await PinCloudAPI.post("/reports", {
        post_id: Number(postId),
        reason: "Contenido reportado por posible incumplimiento de normas"
      });
      reportButton.textContent = "Reporte enviado";
      reportButton.disabled = true;
    } catch (error) {
      alert(error.message);
    }
  });

  commentForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!PinCloudSession.isAuthenticated()) {
      window.location.href = "login.html";
      return;
    }

    try {
      await PinCloudAPI.post(`/posts/${postId}/comments`, {
        content: commentInput.value.trim()
      });
      commentInput.value = "";
      commentMessage.textContent = "Comentario publicado";
      await loadComments();
    } catch (error) {
      commentMessage.textContent = error.message;
      commentMessage.classList.add("error");
    }
  });
});
