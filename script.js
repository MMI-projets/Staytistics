document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");


   const playButtons = document.querySelectorAll(".play");
    playButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const video = button.previousElementSibling;
            if (video.paused) {
                video.play();
                button.textContent = "⏸"; // Change to pause icon
            } else {
                video.pause();
                button.textContent = "⏵"; // Change to play icon
            }
        });
    });
});