/**
 * renderQuiz - Render a quiz and manage localStorage automatically.
 * @param {string} containerId - ID of the container div
 * @param {Array} quizData - Array of questions
 * @param {Object} options - Optional: { quizKey, onComplete }
 */
function renderQuiz(containerId, quizData, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return console.error(`Container with id "${containerId}" not found.`);

    container.innerHTML = "";

    const correctAnswers = new Array(quizData.length).fill(false);

    // LocalStorage keys
    const quizKey = options.quizKey || containerId + "_completed";
    if (!localStorage.getItem(quizKey)) localStorage.setItem(quizKey, "false");

    if (!localStorage.getItem("progress")) localStorage.setItem("progress", "0");

    quizData.forEach((q, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "quiz-question";

        const questionText = document.createElement("p");
        questionText.innerHTML = `<strong>${q.question}</strong>`;
        questionDiv.appendChild(questionText);

        const ul = document.createElement("ul");
        const feedbackDiv = document.createElement("div");
        feedbackDiv.className = "feedback";

        q.choices.forEach(choice => {
            const li = document.createElement("li");
            li.className = "option-button";
            li.textContent = choice.text;

            li.addEventListener("click", () => {
                const correct = choice.feedback.startsWith("✅");

                if (correct) {
                    li.classList.add("correct");
                    feedbackDiv.textContent = choice.feedback;
                    correctAnswers[index] = true;
                    ul.querySelectorAll(".option-button").forEach(o => o.disabled = true);
                } else {
                    li.classList.add("incorrect");
                    feedbackDiv.textContent = choice.feedback;
                    ul.querySelectorAll(".option-button").forEach(o => o.disabled = true);

                    setTimeout(() => {
                        li.classList.remove("incorrect");
                        feedbackDiv.textContent = "";
                        ul.querySelectorAll(".option-button").forEach(o => o.disabled = false);
                    }, 1000);
                }

                if (correctAnswers.every(ans => ans)) {
                    // Increment progress only if first completion
                    if (localStorage.getItem(quizKey) === "false") {
                        let progress = parseInt(localStorage.getItem("progress"), 10) || 0;
                        progress += 1;
                        localStorage.setItem("progress", progress.toString());
                        localStorage.setItem(quizKey, "true");
                        console.log("Current progress:", progress);
                    }
                    if (options.onComplete) options.onComplete(true);
                }
            });

            ul.appendChild(li);
        });

        questionDiv.appendChild(ul);
        questionDiv.appendChild(feedbackDiv);
        container.appendChild(questionDiv);
    });
}
