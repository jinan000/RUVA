// main.js - RUVA Global JavaScript

// --- Bubble Menu Logic --- (runs on window load so GSAP is always ready)
const initBubbleMenu = () => {
    const toggleBtn = document.querySelector('.toggle-bubble');
    const overlay = document.querySelector('.bubble-menu-items');
    if (!toggleBtn || !overlay) return;
    if (typeof gsap === 'undefined') {
        // GSAP not loaded, retry after a moment
        setTimeout(initBubbleMenu, 100);
        return;
    }

    const bubbles = Array.from(overlay.querySelectorAll('.pill-link'));
    const labels = Array.from(overlay.querySelectorAll('.pill-label'));

    let isMenuOpen = false;
    const animationEase = 'back.out(1.5)';
    const animationDuration = 0.5;
    const staggerDelay = 0.12;

    toggleBtn.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;

        if (isMenuOpen) {
            toggleBtn.classList.add('open');
            overlay.style.display = 'flex';

            gsap.killTweensOf([...bubbles, ...labels]);
            gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
            gsap.set(labels, { y: 24, autoAlpha: 0 });

            bubbles.forEach((bubble, i) => {
                const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
                const tl = gsap.timeline({ delay });

                tl.to(bubble, {
                    scale: 1,
                    duration: animationDuration,
                    ease: animationEase
                });

                if (labels[i]) {
                    tl.to(labels[i], {
                        y: 0,
                        autoAlpha: 1,
                        duration: animationDuration,
                        ease: 'power3.out'
                    }, `-=${animationDuration * 0.9}`);
                }
            });
        } else {
            toggleBtn.classList.remove('open');

            gsap.killTweensOf([...bubbles, ...labels]);
            gsap.to(labels, {
                y: 24,
                autoAlpha: 0,
                duration: 0.2,
                ease: 'power3.in'
            });

            gsap.to(bubbles, {
                scale: 0,
                duration: 0.2,
                ease: 'power3.in',
                onComplete: () => {
                    overlay.style.display = 'none';
                }
            });
        }
    });

    window.addEventListener('resize', () => {
        if (isMenuOpen) {
            const isDesktop = window.innerWidth >= 900;
            bubbles.forEach((bubble) => {
                const rotStr = bubble.style.getPropertyValue('--item-rot');
                let rotation = 0;
                if (isDesktop && rotStr) rotation = parseFloat(rotStr);
                gsap.set(bubble, { rotation, scale: 1 });
            });
        }
    });
};

window.addEventListener('load', initBubbleMenu);

document.addEventListener('DOMContentLoaded', () => {

    // Header Scroll Effect
    const header = document.querySelector('.site-header');


    const handleScroll = () => {
        const scrollySection = document.getElementById('scrolly-section');
        let shouldBeSolid = false;

        if (scrollySection) {
            // Keep transparent until we scroll PAST the entire 400vh section
            // The section ends when its bottom edge hits the top of the viewport (or slightly before)
            // Let's make it solid when progress > 0.95 or when rect.bottom < window.innerHeight
            const rect = scrollySection.getBoundingClientRect();
            // If the bottom of the scrolly section is at or above the top of the viewport
            // (meaning we have scrolled past it)
            if (rect.bottom <= window.innerHeight) {
                shouldBeSolid = true;
            }
        } else {
            // Fallback for pages without scrolly-section
            if (window.scrollY > 50) {
                shouldBeSolid = true;
            }
        }

        if (shouldBeSolid) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init Check

    // Intersection Observer for scroll animations
    const fadeElements = document.querySelectorAll('.fade-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Unobserve after animating once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        animationObserver.observe(el);
    });

    // --- Bounce Cards GSAP Animation Logic ---
    const bounceContainer = document.getElementById('bounceCards');
    if (bounceContainer && typeof gsap !== 'undefined') {
        const cards = Array.from(bounceContainer.querySelectorAll('.card'));

        // Use smaller offsets on mobile so cards don't overflow the viewport
        const isMobile = () => window.innerWidth <= 600;

        const getTransformStyles = () => isMobile()
            ? [
                "rotate(5deg) translate(-88px)",
                "rotate(0deg) translate(-42px)",
                "rotate(-5deg)",
                "rotate(5deg) translate(42px)",
                "rotate(-5deg) translate(88px)"
              ]
            : [
                "rotate(5deg) translate(-150px)",
                "rotate(0deg) translate(-70px)",
                "rotate(-5deg)",
                "rotate(5deg) translate(70px)",
                "rotate(-5deg) translate(150px)"
              ];

        // Initial Appearance Animation
        gsap.fromTo(
            cards,
            { scale: 0 },
            {
                scale: 1,
                stagger: 0.08,
                ease: 'elastic.out(1, 0.5)',
                delay: 0.5
            }
        );

        const getNoRotationTransform = transformStr => {
            const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
            if (hasRotate) {
                return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
            } else if (transformStr === 'none') {
                return 'rotate(0deg)';
            } else {
                return `${transformStr} rotate(0deg)`;
            }
        };

        const getPushedTransform = (baseTransform, offsetX) => {
            const translateRegex = /translate\(([-0-9.]+)px\)/;
            const match = baseTransform.match(translateRegex);
            if (match) {
                const currentX = parseFloat(match[1]);
                const newX = currentX + offsetX;
                return baseTransform.replace(translateRegex, `translate(${newX}px)`);
            } else {
                return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
            }
        };

        // Hover Interaction Logic
        const pushSiblings = hoveredIdx => {
            const transformStyles = getTransformStyles();
            const pushOffset = isMobile() ? 96 : 160;
            cards.forEach((card, i) => {
                gsap.killTweensOf(card);
                const baseTransform = transformStyles[i] || 'none';

                if (i === hoveredIdx) {
                    const noRotationTransform = getNoRotationTransform(baseTransform);
                    gsap.to(card, {
                        transform: noRotationTransform,
                        duration: 0.4,
                        ease: 'back.out(1.4)',
                        overwrite: 'auto',
                        zIndex: 10 // Bring to front
                    });
                } else {
                    const offsetX = i < hoveredIdx ? -pushOffset : pushOffset;
                    const pushedTransform = getPushedTransform(baseTransform, offsetX);
                    const distance = Math.abs(hoveredIdx - i);
                    const delay = distance * 0.05;

                    gsap.to(card, {
                        transform: pushedTransform,
                        duration: 0.4,
                        ease: 'back.out(1.4)',
                        delay: delay,
                        overwrite: 'auto',
                        zIndex: 1 // Push back
                    });
                }
            });
        };

        const resetSiblings = () => {
            const transformStyles = getTransformStyles();
            cards.forEach((card, i) => {
                gsap.killTweensOf(card);
                const baseTransform = transformStyles[i] || 'none';
                gsap.to(card, {
                    transform: baseTransform,
                    duration: 0.4,
                    ease: 'back.out(1.4)',
                    overwrite: 'auto',
                    clearProps: "zIndex" // Reset zIndex mapping
                });
            });
        };

        // Attach Event Listeners to each card
        cards.forEach((card, idx) => {
            card.addEventListener('mouseenter', () => pushSiblings(idx));
            card.addEventListener('mouseleave', () => resetSiblings());
        });
    }

    // --- Spotlight Card Animation Logic ---
    const spotlightCards = document.querySelectorAll('.card-spotlight');
    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- Rotating Text Animation Logic ---
    const rotatingWrapper = document.getElementById('aboutRotatingText');
    if (rotatingWrapper && typeof gsap !== 'undefined') {
        const textsStr = rotatingWrapper.getAttribute('data-texts');
        if (textsStr) {
            try {
                const texts = JSON.parse(textsStr);
                if (texts.length > 0) {
                    let currentIndex = 0;
                    const staggerDuration = 0.05;
                    const rotationInterval = 1500; // Time each word stays visible

                    const splitText = (text) => {
                        return text.split('').map(char => {
                            const span = document.createElement('span');
                            span.className = 'rotate-char';
                            span.textContent = char === ' ' ? '\u00A0' : char;
                            return span;
                        });
                    };

                    const showNextText = () => {
                        const currentText = texts[currentIndex];
                        const chars = splitText(currentText);

                        rotatingWrapper.innerHTML = ''; // clear previous

                        const textContainer = document.createElement('span');
                        textContainer.className = 'rotate-text-group';
                        chars.forEach(char => textContainer.appendChild(char));

                        rotatingWrapper.appendChild(textContainer);

                        // Animate In
                        gsap.fromTo(chars,
                            { y: "100%", opacity: 0 },
                            {
                                y: "0%",
                                opacity: 1,
                                stagger: staggerDuration,
                                duration: 0.8,
                                ease: "back.out(1.7)",
                                onComplete: () => {
                                    // Wait for the interval, then animate out
                                    setTimeout(() => {
                                        gsap.to(chars, {
                                            y: "-120%",
                                            opacity: 0,
                                            stagger: staggerDuration,
                                            duration: 0.6,
                                            ease: "power2.in",
                                            onComplete: () => {
                                                // Trigger next text
                                                currentIndex = (currentIndex + 1) % texts.length;
                                                showNextText();
                                            }
                                        });
                                    }, rotationInterval);
                                }
                            }
                        );
                    };

                    // Start the rotation loop
                    showNextText();
                }
            } catch (e) {
                console.error("Failed to parse rotating texts", e);
            }
        }
    }

    // --- Tilted Cards Animation ---
    const initTiltedCards = () => {
        const tiltedCards = document.querySelectorAll('.tilted-card-figure');

        tiltedCards.forEach(figure => {
            const inner = figure.querySelector('.tilted-card-inner');
            if (!inner) return;

            // Configuration (matching React component)
            const rotateAmplitude = 12;
            const scaleOnHover = 1.05;

            // Create GSAP quickTo setters for performant spring-like tracking
            // Use "power2.out" for a snappy, springy feel
            // GSAP strictly uses rotationX and rotationY for 3D transforms
            const xTo = gsap.quickTo(inner, "rotationX", { duration: 0.4, ease: "power2.out" });
            const yTo = gsap.quickTo(inner, "rotationY", { duration: 0.4, ease: "power2.out" });
            const scaleTo = gsap.quickTo(inner, "scale", { duration: 0.4, ease: "back.out(1.5)" });

            figure.addEventListener('mousemove', (e) => {
                const rect = figure.getBoundingClientRect();

                // Calculate mouse offset from the center of the element (-1 to 1 range roughly)
                const offsetX = e.clientX - rect.left - rect.width / 2;
                const offsetY = e.clientY - rect.top - rect.height / 2;

                // Calculate rotation based on offset
                // Note: dragging mouse UP (negative offsetY) rotates X positively (tilts up)
                const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
                const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

                xTo(rotationX);
                yTo(rotationY);
            });

            figure.addEventListener('mouseenter', () => {
                scaleTo(scaleOnHover);
            });

            figure.addEventListener('mouseleave', () => {
                // Reset rotation and scale smoothly on leave
                xTo(0);
                yTo(0);
                scaleTo(1);
            });
        });
    };

    // Initialize tilted cards
    initTiltedCards();

    // --- Scrollytelling Animation Logic ---
    const initScrollytelling = () => {
        const section = document.getElementById('scrolly-section');
        const canvas = document.getElementById('jewellery-canvas');
        const loader = document.getElementById('scrolly-loader');
        const textElements = [
            document.getElementById('scrolly-text-1'),
            document.getElementById('scrolly-text-2'),
            document.getElementById('scrolly-text-4')
        ];

        if (!section || !canvas || !loader) return;

        const ctx = canvas.getContext('2d');
        const frameCount = 480;
        const images = [];
        let loadedFrames = 0;
        let isLooping = false;

        // Configuration for text visibility [startFadeIn, fullyVisible, startFadeOut, fullyHidden]
        // Mapped to frame indexes
        const textTimings = [
            [0, 15, 45, 60],       // Text 1: "Every detail begins with intention"
            [100, 120, 180, 200],  // Text 2: "Crafted for Her Moment"
            [310, 330, 410, 430]   // Text 4: "RUVA"
        ];

        // 1. Preload Images
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            // Pad index with zeros: 1 -> 0001
            const paddedIndex = i.toString().padStart(4, '0');
            img.src = `frames/frame_${paddedIndex}.webp`;

            const onLoadOrError = () => {
                loadedFrames++;
                if (loadedFrames === frameCount) {
                    // All images loaded
                    loader.style.opacity = '0';
                    setTimeout(() => loader.style.display = 'none', 1000);
                    handleResize(); // Initial draw
                    startAnimationLoop();
                }
            };

            img.onload = onLoadOrError;
            img.onerror = onLoadOrError;
            images.push(img);
        }

        // 2. Responsive Canvas Scaling
        const renderFrame = (frameIndex) => {
            const img = images[frameIndex];
            if (!img || !img.complete) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;

            // On portrait / mobile screens the image aspect ratio is much wider than
            // the viewport is tall, so 'cover' (Math.max) over-zooms and destroys
            // clarity. Switch to 'contain' (Math.min) on portrait orientations so
            // the full frame is visible. On landscape / desktop keep 'cover' so the
            // animation fills the screen edge-to-edge.
            const isPortrait = canvas.height > canvas.width;
            const ratio = isPortrait ? Math.min(hRatio, vRatio) : Math.max(hRatio, vRatio);

            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;

            ctx.drawImage(
                img,
                0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
            );
        };

        const handleResize = () => {
            // Scale the drawing buffer to the physical pixel count of the screen.
            // Without this, high-DPR mobile displays (2x / 3x) upscale a low-res
            // canvas buffer causing blurry / unclear frames.
            const dpr = window.devicePixelRatio || 1;
            const w = window.innerWidth;
            const h = window.innerHeight;

            canvas.width  = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);

            // Pin the CSS display size to logical pixels so the element
            // doesn't grow to fill the now-larger drawing buffer.
            canvas.style.width  = w + 'px';
            canvas.style.height = h + 'px';

            // Re-render current frame based on scroll
            updateScrollProgress();
        };

        window.addEventListener('resize', handleResize);

        // 3. Scroll Tracking & Text Interpolation
        let currentScrollProgress = 0;
        let lastRenderedFrame = -1;

        const interpolateOpacity = (currentFrame, timings) => {
            const [startIn, fullIn, startOut, fullOut] = timings;

            if (currentFrame < startIn) return 0;
            if (currentFrame >= startIn && currentFrame < fullIn) {
                // Fading in
                return (currentFrame - startIn) / (fullIn - startIn);
            }
            if (currentFrame >= fullIn && currentFrame < startOut) {
                // Fully visible
                return 1;
            }
            if (currentFrame >= startOut && currentFrame < fullOut) {
                // Fading out
                return 1 - ((currentFrame - startOut) / (fullOut - startOut));
            }
            return 0; // After fullOut
        };

        const updateScrollProgress = () => {
            const rect = section.getBoundingClientRect();

            // Calculate progress 0 -> 1 based on section top & height
            // rect.top is 0 when the top of the section hits the top of viewport.
            // When rect.bottom hits the bottom of the viewport, progress should be 1.
            const totalScrollableDistance = rect.height - window.innerHeight;
            let progress = -rect.top / totalScrollableDistance;

            // Clamp progress between 0 and 1
            progress = Math.max(0, Math.min(1, progress));

            // Determine frame
            const targetFrame = Math.floor(progress * (frameCount - 1));

            // Hide the fixed container completely if we scroll past the 400vh section
            // This prevents it from bleeding through semi-transparent footers/sections
            const fixedContainer = document.querySelector('.scrolly-fixed');
            if (fixedContainer) {
                if (rect.bottom <= 0) {
                    fixedContainer.style.opacity = '0';
                    fixedContainer.style.pointerEvents = 'none';
                } else {
                    fixedContainer.style.opacity = '1';
                    fixedContainer.style.pointerEvents = 'auto';
                }
            }

            // Only draw and process if frame changed or on initial load
            if (targetFrame !== lastRenderedFrame) {
                renderFrame(targetFrame);
                lastRenderedFrame = targetFrame;

                // Sync Text Opacities
                textTimings.forEach((timings, idx) => {
                    const el = textElements[idx];
                    if (el) {
                        el.style.opacity = interpolateOpacity(targetFrame, timings).toString();
                        // Optional: slightly translate Y based on opacity for subtle float effect
                        // const yOffset = (1 - el.style.opacity) * 10;
                        // el.style.transform = `translateY(${yOffset}px)`;
                    }
                });
            }
        };

        const startAnimationLoop = () => {
            if (isLooping) return;
            isLooping = true;

            // Drive from gsap.ticker so this runs AFTER Lenis applies its eased
            // scroll position each frame — eliminating jitter from the old rAF loop.
            if (typeof gsap !== 'undefined') {
                gsap.ticker.add(updateScrollProgress);
            } else {
                const loop = () => { updateScrollProgress(); requestAnimationFrame(loop); };
                requestAnimationFrame(loop);
            }
        };
    };

    // Initialize scrollytelling
    initScrollytelling();



});
