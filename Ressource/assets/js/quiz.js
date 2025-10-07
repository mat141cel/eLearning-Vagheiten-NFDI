// prettier quiz.js for Quarto pages
function renderQuiz(containerId, quizData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ""; // clear old content

    quizData.forEach((q, idx) => {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("quiz-question");

        // Question text
        const questionText = document.createElement("p");
        questionText.innerHTML = `<strong>${q.question}</strong>`;
        questionDiv.appendChild(questionText);

        // Options list
        const ul = document.createElement("ul");
        q.choices.forEach(choice => {
            const li = document.createElement("li");
            li.classList.add("option-button");
            li.textContent = choice.text;
            li.dataset.feedback = choice.feedback;
            ul.appendChild(li);
        });
        questionDiv.appendChild(ul);

        // Feedback div
        const feedbackDiv = document.createElement("div");
        feedbackDiv.classList.add("feedback");
        questionDiv.appendChild(feedbackDiv);

        // Action buttons container
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        const checkBtn = document.createElement("button");
        checkBtn.textContent = "Check";
        checkBtn.classList.add("check-button", "action-buttons");

        const resetBtn = document.createElement("button");
        resetBtn.textContent = "Reset";
        resetBtn.classList.add("reset-button", "action-buttons");

        buttonContainer.appendChild(checkBtn);
        buttonContainer.appendChild(resetBtn);
        questionDiv.appendChild(buttonContainer);

        container.appendChild(questionDiv);

        // State
        let selectedOption = null;

        // Option click
        ul.querySelectorAll(".option-button").forEach(opt => {
            opt.addEventListener("click", () => {
                ul.querySelectorAll(".option-button").forEach(o => o.classList.remove("selected"));
                opt.classList.add("selected");
                selectedOption = opt;
            });
        });

        // Check button
        checkBtn.addEventListener("click", () => {
            if (!selectedOption) return;
            const feedback = selectedOption.dataset.feedback;
            feedbackDiv.textContent = feedback;

            if (feedback.startsWith("✅")) {
                selectedOption.classList.add("correct");
            } else {
                selectedOption.classList.add("incorrect");
            }

            // disable buttons after check
            ul.querySelectorAll(".option-button").forEach(o => o.disabled = true);
            checkBtn.disabled = true;
        });

        // Reset button
        resetBtn.addEventListener("click", () => {
            ul.querySelectorAll(".option-button").forEach(o => {
                o.classList.remove("selected", "correct", "incorrect");
                o.disabled = false;
            });
            feedbackDiv.textContent = "";
            selectedOption = null;
            checkBtn.disabled = false;
        });
    });
}
