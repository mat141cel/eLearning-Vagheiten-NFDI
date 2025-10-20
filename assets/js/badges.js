/**
 * renderBadges - Standalone progress badges
 * @param {string} containerId - ID of the container div
 * @param {number} totalBadges - Total badges (default 5)
 */
function renderBadges(containerId, totalBadges = 5) {
    const container = document.getElementById(containerId);
    if (!container) return console.error(`Container with id "${containerId}" not found.`);

    container.innerHTML = "";

    let progress = parseInt(localStorage.getItem("progress") || "0", 10);
    if (progress > totalBadges) progress = totalBadges;

    for (let i = 1; i <= totalBadges; i++) {
        const btn = document.createElement("button");
        btn.className = "badge-button";
        btn.textContent = `Badge ${i}`;

        if (i <= progress) {
            btn.style.backgroundColor = "#4caf50"; // earned
            btn.style.color = "#fff";
        } else {
            btn.style.backgroundColor = "#ddd"; // locked
            btn.style.color = "#555";
        }

        btn.addEventListener("click", () => {
            alert(`Badge ${i}: ${i <= progress ? "Earned!" : "Locked."}`);
        });

        container.appendChild(btn);
    }
}

/**
 * watchProgress - Automatically updates badges when localStorage.progress changes
 * @param {string} containerId - ID of the badge container
 * @param {number} totalBadges - Number of badges
 */
function watchProgress(containerId, totalBadges = 5) {
    let lastProgress = parseInt(localStorage.getItem("progress") || "0", 10);

    // Polling approach: check every 200ms
    setInterval(() => {
        const currentProgress = parseInt(localStorage.getItem("progress") || "0", 10);
        if (currentProgress !== lastProgress) {
            lastProgress = currentProgress;
            renderBadges(containerId, totalBadges);
        }
    }, 200);
}
