// General badge/progress tracker
const BADGES_KEY = "numismatik_badges";
const allUnits = ["Intro", "numismatische Daten verstehen", "lesson3"]; // all lesson/unit IDs

function getBadges() {
    const badges = localStorage.getItem(BADGES_KEY);
    return badges ? JSON.parse(badges) : [];
}

function saveBadge(unitId) {
    const badges = getBadges();
    if (!badges.includes(unitId)) {
        badges.push(unitId);
        localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
    }
}

function renderBadges(unitId) {
    const badges = getBadges();
    const badgeContainer = document.querySelector(`#${unitId}-badges #badge-display`);
    if (!badgeContainer) return;

    badgeContainer.innerHTML = "";
    allUnits.forEach(id => {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = id.toUpperCase();
        if (badges.includes(id)) badge.classList.add("earned");
        badgeContainer.appendChild(badge);
    });
}

function updateProgress(unitId) {
    const badges = getBadges();
    const percent = (badges.length / allUnits.length) * 100;
    const progressBar = document.querySelector(`#${unitId}-badges #progress-bar`);
    if (progressBar) progressBar.style.width = percent + "%";
}

function markUnitComplete(unitId) {
    saveBadge(unitId);
    renderBadges(unitId);
    updateProgress(unitId);
}

// Initialize badges for a unit
function initUnitBadges(unitId) {
    renderBadges(unitId);
    updateProgress(unitId);
}

// Example: input-based completion
function setupInputUnit(unitId, inputSelector, submitSelector, correctAnswer) {
    const submitBtn = document.querySelector(submitSelector);
    const inputEl = document.querySelector(inputSelector);

    if (!submitBtn || !inputEl) return;

    submitBtn.addEventListener("click", () => {
        if (inputEl.value.trim().toLowerCase() === correctAnswer.toLowerCase()) {
            markUnitComplete(unitId);
            alert("Correct! Badge earned!");
        } else {
            alert("Incorrect, try again.");
        }
    });

    initUnitBadges(unitId);
}
