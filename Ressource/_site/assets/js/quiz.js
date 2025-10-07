// assets/js/quiz.js

function renderQuiz(containerId, quizData) {
    let quizDiv = document.getElementById(containerId);
    quizDiv.innerHTML = ""; // clear old content

    quizData.forEach((q, idx) => {
        let html = `<p><strong>${q.question}</strong></p>`;
        q.choices.forEach(c => {
            html += `<button onclick="showFeedback('${containerId}', ${idx}, '${c.text}')">${c.text}</button> `;
        });
        html += `<div id="${containerId}-result-${idx}" style="margin-bottom:1em; font-style:italic;"></div>`;
        quizDiv.innerHTML += html;
    });
}

function showFeedback(containerId, qIdx, choiceText) {
    const quizData = window[containerId + "_data"];
    const resDiv = document.getElementById(`${containerId}-result-${qIdx}`);
    const q = quizData[qIdx];
    const selected = q.choices.find(c => c.text === choiceText);
    resDiv.innerHTML = selected.feedback;
}
