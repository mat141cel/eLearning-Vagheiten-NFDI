console.log("local_storage.js loaded"); // Debug

window.saveUserData = function () {
    const usernameEl = document.getElementById('username');
    const scoreEl = document.getElementById('score');
    const progressEl = document.getElementById('progress');

    if (!usernameEl || !scoreEl || !progressEl) return;

    const userData = {
        name: usernameEl.value,
        score: parseInt(scoreEl.value) || 0,
        progress: parseInt(progressEl.value) || 0
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    alert('Data saved!');
};

window.displayUserData = function () {
    const container = document.getElementById('displayUserData');
    if (!container) return;

    const storedData = localStorage.getItem('userData');
    if (storedData) {
        const userData = JSON.parse(storedData);
        container.innerHTML = `
            <p>Name: ${userData.name}</p>
            <p>Score: ${userData.score}</p>
            <p>Progress: ${userData.progress}</p>
        `;
    } else {
        container.innerText = 'No user data found.';
    }
};

// Attach event listeners safely after DOM + script load
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, binding buttons"); // Debug

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveUserData);

    const loadBtn = document.getElementById('loadBtn');
    if (loadBtn) loadBtn.addEventListener('click', displayUserData);

    // Optional: display data immediately
    displayUserData();
});
