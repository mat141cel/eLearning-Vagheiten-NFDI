document.addEventListener("DOMContentLoaded", () => {

    //
    // ─── BASIC LOCAL LOGIN ───────────────────────────────────────────────
    //
    let user = localStorage.getItem("elearnUser");
    if (!user) {
        user = prompt("Enter your name to start:") || "Guest";
        localStorage.setItem("elearnUser", user);
    }

    // Small badge showing logged-in user
    const userBadge = document.createElement("div");
    userBadge.textContent = `👋 Welcome, ${user}`;
    userBadge.style = `
    position:fixed;bottom:10px;right:10px;
    background:#eee;padding:6px 10px;border-radius:4px;
    font-size:0.9em;box-shadow:0 0 4px #aaa;
    z-index:9999;
  `;
    document.body.appendChild(userBadge);


    //
    // ─── LOAD EXISTING PROGRESS ──────────────────────────────────────────
    //
    const progress = JSON.parse(localStorage.getItem("elearnProgress") || "{}");


    //
    // ─── MARK PROGRESS ITEMS ─────────────────────────────────────────────
    //
    document.querySelectorAll("[data-progress-id]").forEach(el => {
        const id = el.dataset.progressId;

        // Visually show completed state
        if (progress[id]) el.classList.add("completed");

        // When clicked, mark as done
        el.addEventListener("click", () => {
            progress[id] = true;
            localStorage.setItem("elearnProgress", JSON.stringify(progress));
            el.classList.add("completed");
            alert(`✅ Progress saved for: ${id}`);
        });
    });


    //
    // ─── OPTIONAL RESET BUTTON ───────────────────────────────────────────
    //
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset My Progress";
    resetBtn.style = `
    position:fixed;bottom:10px;left:10px;
    background:#f44336;color:white;border:none;
    padding:6px 12px;border-radius:4px;cursor:pointer;
    font-size:0.8em;
  `;
    resetBtn.onclick = () => {
        if (confirm("Clear all saved progress?")) {
            localStorage.removeItem("elearnProgress");
