// Badge tracking for quizzes
const QUIZ_BADGES_KEY = "numismatik_quiz_badges";
const allQuizzes = ["Basics", "", "quiz3"]; // Add all quiz IDs here

function getBadges() {
    const badges = localStorage.getItem(QUIZ_BADGES_KEY);
    return badges ? JSON.parse(badges) : [];
}

function saveBadge(quizId) {
    const badges = getBadges();
    if (!badges.includes(quizId)) {
        badges.push(quizId);
        localStorage.setItem(QUIZ_BADGES_KEY, JSON.stringify(badges));
    }
}

function renderBadges() {
    const badges = getBadges();
    const badgeContainer = document.getElementById("badge-display");
    if (!badgeContainer) return;

    badgeContainer.innerHTML = "";
    allQuizzes.forEach(id => {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = id.toUpperCase();
        if (badges.includes(id)) badge.classList.add("earned");
        badgeContainer.appendChild(badge);
    });
}

function updateProgress() {
    const badges = getBadges();
    const percent = (badges.length / allQuizzes.length) * 100;
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) progressBar.style.width = percent + "%";
}

// Call this after quiz completion
function markQuizComplete(quizId) {
    saveBadge(quizId);
    renderBadges();
    updateProgress();
}

// Initialize badges on page load
document.addEventListener("DOMContentLoaded", () => {
    renderBadges();
    updateProgress();
});
