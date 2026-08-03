console.log("Portfolio Loaded Successfully");

// ================= LIGHTBOX INITIALIZATION =================

document.addEventListener("DOMContentLoaded", () => {
    createLightboxStructure();
    initializeLightbox();
});

function createLightboxStructure() {
    if (document.getElementById("lightbox-overlay")) return;

    const lightboxHTML = `
        <div id="lightbox-overlay" class="lightbox-overlay">
            <div class="lightbox-container">
                <img id="lightbox-img" class="lightbox-img" src="" alt="">
                <div class="lightbox-controls">
                    <button class="lightbox-btn" id="lightbox-zoom-in" title="Zoom in">+</button>
                    <button class="lightbox-btn" id="lightbox-zoom-out" title="Zoom out">−</button>
                    <button class="lightbox-btn" id="lightbox-reset" title="Reset">↺</button>
                    <button class="lightbox-btn" id="lightbox-close" title="Close">✕</button>
                </div>
                <button class="lightbox-nav prev" id="lightbox-prev" title="Previous">‹</button>
                <button class="lightbox-nav next" id="lightbox-next" title="Next">›</button>
                <div class="lightbox-info" id="lightbox-info"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", lightboxHTML);
}

function initializeLightbox() {
    const overlay = document.getElementById("lightbox-overlay");
    const container = document.querySelector(".lightbox-container");
    const img = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("lightbox-close");
    const zoomInBtn = document.getElementById("lightbox-zoom-in");
    const zoomOutBtn = document.getElementById("lightbox-zoom-out");
    const resetBtn = document.getElementById("lightbox-reset");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");
    const infoDiv = document.getElementById("lightbox-info");

    let currentImages = [];
    let currentIndex = 0;
    let zoomLevel = 1;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let offsetX = 0;
    let offsetY = 0;

    // Make all images with clickable-img class or in gallery clickable
    function makeImagesClickable() {
        const selectorsToWatch = [
            "img.clickable-img",
            ".gallery img",
            ".hero-img img",
            ".case-image img",
            ".about-img img"
        ];

        selectorsToWatch.forEach(selector => {
            document.querySelectorAll(selector).forEach(image => {
                if (!image.classList.contains("lightbox-ready")) {
                    image.classList.add("clickable-img", "lightbox-ready");
                    image.addEventListener("click", (e) => {
                        e.stopPropagation();
                        openLightbox(image);
                    });
                }
            });
        });
    }

    function openLightbox(clickedImage) {
        // Find all clickable images on the page
        currentImages = Array.from(document.querySelectorAll(".clickable-img")).filter(img => img.offsetParent !== null);
        currentIndex = currentImages.indexOf(clickedImage);

        if (currentIndex === -1) {
            currentIndex = 0;
            currentImages = [clickedImage];
        }

        displayImage(currentIndex);
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        zoomLevel = 1;
        offsetX = 0;
        offsetY = 0;
    }

    function displayImage(index) {
        if (currentImages.length === 0) return;

        currentIndex = (index + currentImages.length) % currentImages.length;
        const image = currentImages[currentIndex];

        img.src = image.src;
        img.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;

        // Update info
        infoDiv.textContent = `${currentIndex + 1} / ${currentImages.length}`;

        // Show/hide nav buttons
        prevBtn.style.display = currentImages.length > 1 ? "flex" : "none";
        nextBtn.style.display = currentImages.length > 1 ? "flex" : "none";
    }

    // Event listeners
    closeBtn.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    zoomInBtn.addEventListener("click", () => {
        zoomLevel += 0.2;
        updateImageTransform();
    });

    zoomOutBtn.addEventListener("click", () => {
        if (zoomLevel > 0.5) {
            zoomLevel -= 0.2;
            updateImageTransform();
        }
    });

    resetBtn.addEventListener("click", () => {
        zoomLevel = 1;
        offsetX = 0;
        offsetY = 0;
        updateImageTransform();
    });

    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        displayImage(currentIndex - 1);
    });

    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        displayImage(currentIndex + 1);
    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
        if (!overlay.classList.contains("active")) return;

        switch(e.key) {
            case "Escape":
                closeLightbox();
                break;
            case "ArrowLeft":
                displayImage(currentIndex - 1);
                break;
            case "ArrowRight":
                displayImage(currentIndex + 1);
                break;
            case "+":
            case "=":
                zoomLevel += 0.2;
                updateImageTransform();
                break;
            case "-":
                if (zoomLevel > 0.5) {
                    zoomLevel -= 0.2;
                    updateImageTransform();
                }
                break;
            case "0":
                zoomLevel = 1;
                offsetX = 0;
                offsetY = 0;
                updateImageTransform();
                break;
        }
    });

    // Mouse dragging
    img.addEventListener("mousedown", (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        img.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging || zoomLevel <= 1) return;

        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;

        offsetX += deltaX;
        offsetY += deltaY;

        dragStartX = e.clientX;
        dragStartY = e.clientY;

        updateImageTransform();
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        img.style.cursor = "grab";
    });

    // Mouse wheel zoom
    container.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (e.deltaY > 0) {
            if (zoomLevel > 0.5) zoomLevel -= 0.1;
        } else {
            zoomLevel += 0.1;
        }
        updateImageTransform();
    }, { passive: false });

    function updateImageTransform() {
        img.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
    }

    function closeLightbox() {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
        img.src = "";
        offsetX = 0;
        offsetY = 0;
        zoomLevel = 1;
    }

    // Initial setup
    makeImagesClickable();

    // Watch for new images added to the page
    const observer = new MutationObserver(() => {
        makeImagesClickable();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

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

/* ================= MOBILE EXPERIENCE SLIDER ================= */
document.addEventListener("DOMContentLoaded", () => {
    const mobileSliderContainer = document.querySelector(".mobile-slider-container");
    if (mobileSliderContainer) {
        initializeSlider(mobileSliderContainer, "mobile-slider-prev", "mobile-slider-next");
    }
});

function initializeSlider(container, prevBtnId, nextBtnId) {
    const sliderTrack = container.querySelector(".slider-track");
    const sliderItems = container.querySelectorAll(".slider-item");
    const sliderPrev = document.getElementById(prevBtnId);
    const sliderNext = document.getElementById(nextBtnId);
    const dots = container.querySelectorAll(".slider-dots .dot");

    let currentIndex = 0;
    let autoPlayInterval;

    function updateSlider(index) {
        currentIndex = (index + sliderItems.length) % sliderItems.length;
        const offset = -currentIndex * 100;
        sliderTrack.style.transform = `translateX(${offset}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });

        resetAutoPlay();
    }

    function nextSlide() {
        updateSlider(currentIndex + 1);
    }

    function prevSlide() {
        updateSlider(currentIndex - 1);
    }

    function autoPlay() {
        autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlay();
    }

    sliderNext.addEventListener("click", nextSlide);
    sliderPrev.addEventListener("click", prevSlide);

    dots.forEach(dot => {
        dot.addEventListener("click", (e) => {
            updateSlider(parseInt(e.target.dataset.index));
        });
    });

    autoPlay();
}
