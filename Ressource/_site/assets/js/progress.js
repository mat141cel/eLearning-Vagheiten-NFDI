// localstorage.js
document.addEventListener("DOMContentLoaded", () => {
    let courseURL = localStorage.getItem("courseURL");
    if (!courseURL) {
        courseURL = prompt("Enter the course URL:");
        if (courseURL) localStorage.setItem("courseURL", courseURL);
    }

    // Example: display it on the page
    const div = document.createElement("div");
    div.textContent = `Course URL: ${courseURL}`;
    document.body.prepend(div); // add at the top
});
