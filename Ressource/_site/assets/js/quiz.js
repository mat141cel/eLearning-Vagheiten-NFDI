function renderQuiz(containerId, quizData) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    quizData.forEach(q => {
        const questionDiv = createElement("div", "quiz-question");

        const questionText = createElement("p", null, `<strong>${q.question}</strong>`);
        questionDiv.appendChild(questionText);

        const ul = createElement("ul");
        const feedbackDiv = createElement("div", "feedback");
        let selectedOption = null;

        q.choices.forEach(choice => {
            const li = createElement("li", "option-button", choice.text);
            li.dataset.feedback = choice.feedback;

            li.addEventListener("click", () => {
                ul.querySelectorAll(".option-button").forEach(o => o.classList.remove("selected"));
                li.classList.add("selected");
                selectedOption = li;
            });

            ul.appendChild(li);
        });

        questionDiv.appendChild(ul);
        questionDiv.appendChild(feedbackDiv);

        const buttonContainer = createElement("div", "button-container");

        const checkBtn = createButton("Check", "check-button action-buttons", () => {
            if (!selectedOption) return;
            const feedback = selectedOption.dataset.feedback;
            feedbackDiv.textContent = feedback;

            selectedOption.classList.add(feedback.startsWith("✅") ? "correct" : "incorrect");
            ul.querySelectorAll(".option-button").forEach(o => o.disabled = true);
            checkBtn.disabled = true;
        });

        const resetBtn = createButton("Reset", "reset-button action-buttons", () => {
            ul.querySelectorAll(".option-button").forEach(o => o.classList.remove("selected", "correct", "incorrect"));
            ul.querySelectorAll(".option-button").forEach(o => o.disabled = false);
            feedbackDiv.textContent = "";
            selectedOption = null;
            checkBtn.disabled = false;
        });

        buttonContainer.append(checkBtn, resetBtn);
        questionDiv.appendChild(buttonContainer);
        container.appendChild(questionDiv);
    });

    function createElement(tag, className = null, html = null) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (html !== null) el.innerHTML = html;
        return el;
    }

    function createButton(text, className, onClick) {
        const btn = createElement("button", className, text);
        btn.addEventListener("click", onClick);
        return btn;
    }
}
