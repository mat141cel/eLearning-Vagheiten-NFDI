const QUIZ_KEY = "numismatik_quiz_progress";
const TOTAL_LESSONS = 10; // upper bound

function updateProgressBar() {
    const progress = JSON.parse(localStorage.getItem(QUIZ_KEY) || "{}");
    const completed = Object.keys(progress).length;
    const percent = Math.round((completed / TOTAL_LESSONS) * 100);

    const bar = document.getElementById("progress-bar");
    const text = document.getElementById("progress-text");

    if (bar) bar.style.width = percent + "%";
    if (text) text.textContent = `${completed} / ${TOTAL_LESSONS} Lektionen abgeschlossen`;
}

// Update on page load
document.addEventListener("DOMContentLoaded", updateProgressBar);
