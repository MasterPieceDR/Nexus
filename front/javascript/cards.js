const createMediaElement = post => {
  const isVideo = post.MediaKind === "VIDEO";
  const element = document.createElement(isVideo ? "video" : "img");
  element.className = "pin-media";
  element.src = post.MediaUrl || "../assets/placeholder.svg";
  element.alt = post.Title;
  element.loading = "lazy";
  
  const ratio = (post.WidthPx && post.HeightPx) ? `${post.WidthPx} / ${post.HeightPx}` : "4 / 5";
  element.style.setProperty("--pin-ratio", ratio);

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
  link.href = `detalle.html?id=${post.PinId}`;

  const media = createMediaElement(post);
  const body = document.createElement("div");
  body.className = "pin-body";

  const h3 = document.createElement("h3");
  h3.textContent = post.Title;
  
  const p = document.createElement("p");
  p.textContent = post.Description || "Sin descripción";
  
  const meta = document.createElement("div");
  meta.className = "pin-meta";
  
  const spanCategory = document.createElement("span");
  spanCategory.textContent = post.CategoryName || "Sin categoría";
  
  const spanAuthor = document.createElement("span");
  spanAuthor.textContent = post.DisplayName || "Usuario";
  
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
