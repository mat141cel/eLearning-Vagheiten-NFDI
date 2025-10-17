function renderQuiz(containerId, quizData) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    quizData.forEach(q => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "quiz-question";
        questionDiv.innerHTML = `<p><strong>${q.question}</strong></p>`;

        const ul = document.createElement("ul");
        const feedbackDiv = document.createElement("div");
        feedbackDiv.className = "feedback";

        q.choices.forEach(choice => {
            const li = document.createElement("li");
            li.className = "option-button";
            li.textContent = choice.text;

            li.onclick = () => {
                const correct = choice.feedback.startsWith("✅");
                li.classList.add(correct ? "correct" : "incorrect");
                feedbackDiv.textContent = choice.feedback;

                // disable all options temporarily
                ul.querySelectorAll(".option-button").forEach(o => o.disabled = true);

                if (!correct) {
                    // reset after 1 second if wrong
                    setTimeout(() => {
                        li.classList.remove("incorrect");
                        feedbackDiv.textContent = "";
                        ul.querySelectorAll(".option-button").forEach(o => o.disabled = false);
                    }, 1000);
                }
            };

            ul.appendChild(li);
        });

        questionDiv.append(ul, feedbackDiv);
        container.appendChild(questionDiv);
    });
}