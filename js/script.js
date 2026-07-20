console.log("Portfolio Loaded Successfully");

document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => {
        alert("Xem chi tiết case study!");
    });
});

/* WORK DROPDOWN — click to toggle on mobile */
document.querySelectorAll(".nav-dropdown").forEach(dropdown => {
    const trigger = dropdown.querySelector("a");

    trigger.addEventListener("click", (e) => {
        // Only intercept as a toggle on mobile (hover handles desktop)
        if (window.matchMedia("(max-width: 768px)").matches) {
            e.preventDefault();
            dropdown.classList.toggle("open");
        }
    });
});

/* Close the mobile dropdown when tapping outside of it */
document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-dropdown")) {
        document.querySelectorAll(".nav-dropdown.open").forEach(d => {
            d.classList.remove("open");
        });
    }
});
