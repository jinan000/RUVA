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

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const scrollySection = document.getElementById('scrolly-section');
        let shouldBeSolid = false;

        if (scrollySection) {
            const rect = scrollySection.getBoundingClientRect();
            if (rect.bottom <= window.innerHeight) {
                shouldBeSolid = true;
            }
        } else {
            if (currentScrollY > 50) {
                shouldBeSolid = true;
            }
        }

        if (shouldBeSolid) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // --- Mobile: hide header on scroll-down, show on scroll-up ---
        if (window.innerWidth <= 768) {
            // Only trigger after scrolling past 80px to ignore tiny bounces
            if (currentScrollY > 80) {
                if (currentScrollY > lastScrollY) {
                    // Scrolling down → slide header up & out
                    header.classList.add('header-hidden');
                } else {
                    // Scrolling up → bring header back
                    header.classList.remove('header-hidden');
                }
            } else {
                // Near top — always show the header
                header.classList.remove('header-hidden');
            }
        } else {
            // Desktop — never hide
            header.classList.remove('header-hidden');
        }

        lastScrollY = currentScrollY;
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

        // Force hardware acceleration, isolate container, and retain centering
        canvas.style.transform = 'translate(-50%, -50%) translateZ(0)';

        // Optimization: Disable alpha if we know frames are opaque to help compositing
        const ctx = canvas.getContext('2d', { alpha: false });
        
        const frameCount = 304; 
        const images = new Array(frameCount + 1).fill(null);
        let loadedInitial = 0;
        let isLooping = false;
        
        const INITIAL_FRAMES = 12; // Preload a small batch first
        const PRELOAD_AHEAD = 12;
        const UNLOAD_THRESHOLD = 40;

        // Configuration for text visibility [startFadeIn, fullyVisible, startFadeOut, fullyHidden]
        const textTimings = [
            [0, 10, 30, 40],       // Text 1: "Every detail begins with intention"
            [70, 85, 120, 135],    // Text 2: "Crafted for Her Moment"
            [220, 240, 290, 304]   // Text 4: "RUVA"
        ];

        const getPaddedIndex = (i) => Math.max(1, Math.min(frameCount, i)).toString().padStart(4, '0');

        const loadFrame = (index) => {
            if (index < 1 || index > frameCount || images[index]) return;
            const img = new Image();
            img.src = `frames/frame_${getPaddedIndex(index)}.webp`;
            images[index] = img;
        };

        const unloadFrame = (index) => {
            if (images[index]) {
                images[index].src = '';
                images[index] = null;
            }
        };

        // 1. Progressive Image Loading
        for (let i = 1; i <= Math.min(INITIAL_FRAMES, frameCount); i++) {
            const img = new Image();
            img.src = `frames/frame_${getPaddedIndex(i)}.webp`;
            img.onload = () => {
                loadedInitial++;
                if (loadedInitial === Math.min(INITIAL_FRAMES, frameCount)) {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.style.display = 'none', 1000);
                    handleResize(); 
                    startAnimationLoop();
                }
            };
            img.onerror = img.onload;
            images[i] = img;
        }

        // 2. Responsive Canvas Scaling
        const drawImageCentered = (img) => {
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            
            // Switch to 'contain' (Math.min) on portrait orientations to preserve clarity
            // Use 'cover' (Math.max) for landscape screens
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

        const renderFrame = (frameValue) => {
            const frame1 = Math.floor(frameValue);
            const frame2 = Math.min(frame1 + 1, frameCount);
            const blendFactor = frameValue - frame1;
            
            ctx.fillStyle = '#120D0B'; // Dark background precisely matching var(--clr-background-dark)
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const img1 = images[Math.max(1, frame1)];
            const img2 = images[Math.max(1, frame2)];

            const currentVelocity = Math.abs(currentFrameValue - prevFrameValue);
            const isLowVelocity = currentVelocity < 0.8;
            
            if (img1 && img1.complete) {
                // Intelligent frame blending only during low velocity
                if (isLowVelocity && blendFactor > 0.05 && blendFactor < 0.95 && img2 && img2.complete) {
                    ctx.globalAlpha = 1;
                    drawImageCentered(img1);
                    ctx.globalAlpha = blendFactor;
                    drawImageCentered(img2);
                    ctx.globalAlpha = 1; 
                } else {
                    // Fast scrolling skips blending, draws nearest
                    const roundedImg = (blendFactor > 0.5 && img2 && img2.complete) ? img2 : img1;
                    drawImageCentered(roundedImg);
                }
            }
        };

        const handleResize = () => {
            // Adaptive playback sensitivity and density
            const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance on ultra-high DPR displays
            const w = window.innerWidth;
            const h = window.innerHeight;

            canvas.width  = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width  = w + 'px';
            canvas.style.height = h + 'px';

            renderFrame(currentFrameValue || 1);
        };

        window.addEventListener('resize', handleResize);

        // 3. Scroll Tracking & Interpolation
        let targetFrameValue = 1;
        let currentFrameValue = 1;
        let prevFrameValue = 1;
        let scrollDirection = 1; 

        const interpolateOpacity = (currentFrame, timings) => {
            const [startIn, fullIn, startOut, fullOut] = timings;
            if (currentFrame < startIn) return 0;
            if (currentFrame >= startIn && currentFrame < fullIn) return (currentFrame - startIn) / (fullIn - startIn);
            if (currentFrame >= fullIn && currentFrame < startOut) return 1;
            if (currentFrame >= startOut && currentFrame < fullOut) return 1 - ((currentFrame - startOut) / (fullOut - startOut));
            return 0;
        };

        const updateScrollProgress = () => {
            const rect = section.getBoundingClientRect();
            const totalScrollableDistance = rect.height - window.innerHeight;
            let progress = -rect.top / totalScrollableDistance;
            progress = Math.max(0, Math.min(1, progress));

            const newTarget = 1 + progress * (frameCount - 1);
            if (newTarget > targetFrameValue) scrollDirection = 1;
            else if (newTarget < targetFrameValue) scrollDirection = -1;
            targetFrameValue = newTarget;

            // Handle fixed container visibility for clean layered scrolling
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
        };

        const manageMemory = (currentIdx, direction) => {
            const lookBehind = 6;
            let startLoad = direction >= 0 ? currentIdx - lookBehind : currentIdx - PRELOAD_AHEAD;
            let endLoad = direction >= 0 ? currentIdx + PRELOAD_AHEAD : currentIdx + lookBehind;
            
            for (let i = Math.max(1, startLoad); i <= Math.min(frameCount, endLoad); i++) {
                loadFrame(i);
            }

            for (let i = 1; i <= frameCount; i++) {
                if (images[i] && (i < currentIdx - UNLOAD_THRESHOLD || i > currentIdx + UNLOAD_THRESHOLD)) {
                    unloadFrame(i);
                }
            }
        };

        const renderLoop = () => {
            // Scroll inertia smoothing: tuned to visually settle in ~120ms (approx 7 frames at 60fps)
            const diff = targetFrameValue - currentFrameValue;
            currentFrameValue += diff * 0.35; 

            // Update text elements relative to current smooth frame
            textTimings.forEach((timings, idx) => {
                const el = textElements[idx];
                if (el) {
                    el.style.opacity = interpolateOpacity(currentFrameValue, timings).toString();
                }
            });

            // Prevent repetitive over-rendering if there is unnoticeable difference
            if (Math.abs(currentFrameValue - prevFrameValue) > 0.005) {
                renderFrame(currentFrameValue);
                // Dynamically load/unload frames around the current index
                manageMemory(Math.round(currentFrameValue), scrollDirection);
                prevFrameValue = currentFrameValue;
            }

            requestAnimationFrame(renderLoop);
        };

        // Defer full sequence activation to viewport entry
        let observer;
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    canvas.style.willChange = 'transform';
                    // Kickstart the memory management just inside viewport bounds
                    manageMemory(Math.round(currentFrameValue), 1);
                } else {
                    canvas.style.willChange = 'auto'; 
                }
            }, { rootMargin: '200px 0px' });
            observer.observe(section);
        }

        const startAnimationLoop = () => {
            if (isLooping) return;
            isLooping = true;

            // Optional GSAP integration if present; otherwise fallback passive scroll bind
            if (typeof gsap !== 'undefined') {
                gsap.ticker.add(updateScrollProgress);
            } else {
                window.addEventListener('scroll', updateScrollProgress, { passive: true });
            }
            // Dedicated animation frame for decoupling rendering and DOM events
            requestAnimationFrame(renderLoop);
        };
    };

    // Initialize scrollytelling
    initScrollytelling();



});
