const createMediaElement = post => {
  const isVideo = post.media_type && post.media_type.includes("video");
  const element = document.createElement(isVideo ? "video" : "img");
  element.className = "pin-media";
  element.src = post.media_url || "../assets/placeholder.svg";
  element.alt = post.title;
  element.loading = "lazy";
  element.style.setProperty("--pin-ratio", post.visual_ratio || "4 / 5");

  if (isVideo) {
    element.controls = true;
    element.muted = true;
  }

  return element;
};

const createPinCard = post => {
  const article = document.createElement("article");
  article.className = "pin-card";

  const link = document.createElement("a");
  link.href = `detalle.html?id=${post.id}`;

  const media = createMediaElement(post);
  const body = document.createElement("div");
  body.className = "pin-body";

  const h3 = document.createElement("h3");
  h3.textContent = post.title;
  
  const p = document.createElement("p");
  p.textContent = post.description || "Sin descripción";
  
  const meta = document.createElement("div");
  meta.className = "pin-meta";
  
  const spanCategory = document.createElement("span");
  spanCategory.textContent = post.category_name || "Sin categoría";
  
  const spanAuthor = document.createElement("span");
  spanAuthor.textContent = post.author_name || "Usuario";
  
  meta.appendChild(spanCategory);
  meta.appendChild(spanAuthor);
  
  body.appendChild(h3);
  body.appendChild(p);
  body.appendChild(meta);

  link.appendChild(media);
  link.appendChild(body);
  article.appendChild(link);

  return article;
};
