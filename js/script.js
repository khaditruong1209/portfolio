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
            ".case-image img",
            ".about-img img",
            ".storyboard-grid img"
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

// ================= VIDEO MODAL =================

function createVideoModalStructure() {
    if (document.getElementById("video-modal-overlay")) return;

    const modalHTML = `
        <div id="video-modal-overlay" class="video-modal-overlay">
            <div class="video-modal-container">
                <button class="video-modal-close" id="video-modal-close" title="Close" aria-label="Close">&times;</button>
                <div class="video-modal-body">
                    <iframe id="video-modal-iframe" src="" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>
                    <video id="video-modal-player" controls playsinline style="display:none; width:100%; height:100%;"></video>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const overlay = document.getElementById("video-modal-overlay");
    const closeBtn = document.getElementById("video-modal-close");

    if (closeBtn) closeBtn.addEventListener("click", closeVideoModal);
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeVideoModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay && overlay.classList.contains("active")) {
            closeVideoModal();
        }
    });
}

function parseVideoUrl(url) {
    if (!url) return "";
    
    // YouTube convert (supports standard, youtu.be, and YouTube Shorts)
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }

    // Vimeo convert
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return url;
}

window.openVideoModal = function(url, isVertical = true) {
    createVideoModalStructure();
    const overlay = document.getElementById("video-modal-overlay");
    const container = overlay ? overlay.querySelector(".video-modal-container") : null;
    const iframe = document.getElementById("video-modal-iframe");
    const player = document.getElementById("video-modal-player");
    if (!overlay) return;

    if (container) {
        if (isVertical) {
            container.classList.add("is-vertical");
        } else {
            container.classList.remove("is-vertical");
        }
    }

    const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

    if (isDirectVideo) {
        if (iframe) {
            iframe.src = "";
            iframe.style.display = "none";
        }
        if (player) {
            player.src = url;
            player.style.display = "block";
            player.play().catch(() => {});
        }
    } else {
        if (player) {
            player.pause();
            player.src = "";
            player.style.display = "none";
        }
        if (iframe) {
            iframe.src = parseVideoUrl(url);
            iframe.style.display = "block";
        }
    }

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
};

window.closeVideoModal = function() {
    const overlay = document.getElementById("video-modal-overlay");
    const iframe = document.getElementById("video-modal-iframe");
    const player = document.getElementById("video-modal-player");
    if (overlay) {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    }
    if (iframe) iframe.src = "";
    if (player) {
        player.pause();
        player.src = "";
    }
};

// Auto wire data-video-url buttons & initialize
document.addEventListener("DOMContentLoaded", () => {
    createVideoModalStructure();

    document.querySelectorAll("[data-video-url]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const url = btn.getAttribute("data-video-url");
            const ratio = btn.getAttribute("data-ratio");
            const isVertical = ratio === "16:9" ? false : true;
            if (url) window.openVideoModal(url, isVertical);
        });
    });
});

// ================= CONTACT FORM HANDLING =================
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            const statusDiv = document.getElementById("form-status");
            const submitBtn = contactForm.querySelector("button[type='submit']");
            
            // Check if action is configured (e.g., Formspree or Web3Forms)
            const action = contactForm.getAttribute("action");
            const accessKeyInput = contactForm.querySelector("[name='access_key']");
            const hasRealKey = accessKeyInput && accessKeyInput.value && !accessKeyInput.value.includes("YOUR_");

            if (!action || action === "#" || (action.includes("web3forms") && !hasRealKey)) {
                // Graceful fallback: open mail client directly
                e.preventDefault();
                const isVi = document.documentElement.lang === "vi";
                if (statusDiv) {
                    statusDiv.className = "form-status info";
                    statusDiv.innerHTML = isVi 
                        ? "Đang mở ứng dụng email của bạn để gửi thư..." 
                        : "Opening your email client to send...";
                }
                const name = encodeURIComponent(contactForm.querySelector("[name='name']")?.value || "");
                const email = encodeURIComponent(contactForm.querySelector("[name='email']")?.value || "");
                const msg = encodeURIComponent(contactForm.querySelector("[name='message']")?.value || "");
                window.location.href = `mailto:khadi.truong1209@gmail.com?subject=Portfolio%20Contact%20from%20${name}&body=${msg}%0A%0A---%0ASender:%20${name}%20(%20${email}%20)`;
                return;
            }

            e.preventDefault();
            const isVi = document.documentElement.lang === "vi";
            if (submitBtn) submitBtn.disabled = true;
            if (statusDiv) {
                statusDiv.className = "form-status loading";
                statusDiv.textContent = isVi ? "Đang gửi..." : "Sending...";
            }

            try {
                const formData = new FormData(contactForm);
                const res = await fetch(action, {
                    method: "POST",
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    contactForm.reset();
                    if (statusDiv) {
                        statusDiv.className = "form-status success";
                        statusDiv.textContent = isVi 
                            ? "Cảm ơn bạn! Tin nhắn đã được gửi thành công." 
                            : "Thank you! Your message has been sent successfully.";
                    }
                } else {
                    throw new Error("Submit failed");
                }
            } catch (err) {
                if (statusDiv) {
                    statusDiv.className = "form-status error";
                    statusDiv.textContent = isVi 
                        ? "Có lỗi xảy ra khi gửi. Vui lòng thử lại hoặc gửi trực tiếp qua email." 
                        : "There was an error sending. Please try again or email directly.";
                }
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
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

