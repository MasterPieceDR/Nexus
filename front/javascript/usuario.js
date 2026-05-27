document.addEventListener("DOMContentLoaded", async () => {
  PinCloudSession.requireAuth();

  const user = PinCloudSession.getUser();
  const profileAvatar = document.getElementById("profileAvatar");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const totalPosts = document.getElementById("totalPosts");
  const approvedPosts = document.getElementById("approvedPosts");
  const pendingPosts = document.getElementById("pendingPosts");
  const statusMessage = document.getElementById("statusMessage");
  const grid = document.getElementById("userPostsGrid");

  const loadScript = src => new Promise(resolve => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    document.body.appendChild(script);
  });

  await loadScript("../javascript/cards.js");

  if (user) {
    profileAvatar.textContent = user.full_name.charAt(0).toUpperCase();
    profileName.textContent = user.full_name;
    profileEmail.textContent = user.email;
  }

  try {
    const posts = await PinCloudAPI.get("/users/me/posts");
    grid.innerHTML = "";
    totalPosts.textContent = posts.length;
    approvedPosts.textContent = posts.filter(post => post.status === "APPROVED").length;
    pendingPosts.textContent = posts.filter(post => post.status === "PENDING").length;

    if (!posts.length) {
      statusMessage.textContent = "Todavía no tienes publicaciones.";
      grid.innerHTML = `<div class="empty-state">Crea tu primera publicación desde el botón Crear.</div>`;
      return;
    }

    statusMessage.textContent = "";
    posts.forEach(post => grid.appendChild(createPinCard(post)));
  } catch (error) {
    statusMessage.textContent = error.message;
    statusMessage.classList.add("error");
  }
});
