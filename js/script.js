console.log("Portfolio Loaded Successfully");

document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => {
        alert("Xem chi tiết case study!");
    });
});
