// ==================== PARALLAX AND SCROLL ANIMATIONS ====================

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ==================== SCROLL REVEAL ANIMATIONS ====================
function initScrollAnimations() {
    // Animate all elements with data-scroll attribute
    const scrollElements = document.querySelectorAll('[data-scroll]');

    scrollElements.forEach((element) => {
        // Check if element is a stat-highlight for special animation
        if (element.classList.contains('stat-highlight')) {
            gsap.fromTo(element, {
                opacity: 0,
                scale: 0.9,
                y: 50
            }, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    end: 'top 20%',
                    toggleActions: 'play none none reverse',
                    onEnter: () => element.classList.add('visible'),
                    onLeaveBack: () => element.classList.remove('visible')
                }
            });
        }
        // Check if element is a viz-container for special animation
        else if (element.classList.contains('viz-container') ||
            element.classList.contains('chart-controls') ||
            element.classList.contains('section-intro') ||
            element.classList.contains('year-selector')) {
            gsap.fromTo(element, {
                opacity: 0,
                y: 60
            }, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 90%',
                    end: 'top 20%',
                    toggleActions: 'play none none reverse',
                    onEnter: () => element.classList.add('visible'),
                    onLeaveBack: () => element.classList.remove('visible')
                }
            });
        }
        // Check if element is an action-card for staggered animation
        else if (element.classList.contains('action-card')) {
            gsap.fromTo(element, {
                opacity: 0,
                y: 40,
                scale: 0.95
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'back.out(1.2)',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
        // Standard scroll-content animation
        else if (element.classList.contains('scroll-content')) {
            gsap.fromTo(element, {
                opacity: 0,
                y: 50
            }, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    end: 'top 20%',
                    toggleActions: 'play none none reverse',
                    onEnter: () => element.classList.add('visible'),
                    onLeaveBack: () => element.classList.remove('visible')
                }
            });
        }
        // Generic animation for other elements
        else {
            gsap.fromTo(element, {
                opacity: 0,
                y: 40
            }, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    });
}

// ==================== HERO PARALLAX EFFECT ====================
function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const parallaxBg = document.querySelector('.parallax-bg');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const ctaButton = document.querySelector('.cta-button');

    if (!hero) return;

    // Parallax background movement
    if (parallaxBg) {
        gsap.to(parallaxBg, {
            y: '30%',
            opacity: 0.5,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // Hero content parallax
    if (heroTitle) {
        gsap.to(heroTitle, {
            y: '50%',
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    if (heroSubtitle) {
        gsap.to(heroSubtitle, {
            y: '30%',
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    if (ctaButton) {
        gsap.to(ctaButton, {
            y: '20%',
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }
}

// ==================== SECTION BACKGROUND GRADIENTS ====================
function initGradientTransitions() {
    const sections = document.querySelectorAll('.scroll-section, .viz-section');

    sections.forEach((section, index) => {
        // Create subtle gradient shifts as you scroll through each section
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                scrub: true,
                onEnter: () => {
                    section.style.transition = 'background 0.8s ease';
                },
                onLeave: () => {
                    section.style.transition = 'background 0.8s ease';
                }
            }
        });
    });
}

// ==================== SMOOTH SCROLL FOR NAVIGATION ====================
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link, a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Only handle internal links
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    // Close mobile menu if open
                    const navMenu = document.querySelector('.nav-menu');
                    const hamburger = document.querySelector('.hamburger');
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        hamburger.classList.remove('active');
                    }

                    // Smooth scroll to target
                    gsap.to(window, {
                        duration: 1.5,
                        scrollTo: {
                            y: target,
                            offsetY: 80 // Account for fixed header
                        },
                        ease: 'power3.inOut'
                    });
                }
            }
        });
    });
}

// ==================== HEADER SCROLL EFFECT ====================
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScroll = 0;

    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        onUpdate: (self) => {
            const currentScroll = self.scroll();

            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down & past threshold
                gsap.to(header, {
                    y: -100,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                // Scrolling up or at top
                gsap.to(header, {
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }

            lastScroll = currentScroll;
        }
    });

    // Add shadow on scroll
    ScrollTrigger.create({
        start: 'top -1',
        end: 99999,
        onEnter: () => {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        },
        onLeaveBack: () => {
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}

// ==================== NUMBER COUNTER ANIMATION ====================
function initCounterAnimations() {
    const bigNumbers = document.querySelectorAll('.big-number');

    bigNumbers.forEach(element => {
        const text = element.textContent.trim();

        // Check if it's a percentage
        if (text.includes('%')) {
            const targetValue = parseFloat(text.replace('%', ''));

            // Determine decimal places from original value
            const decimalPlaces = (text.split('.')[1] || '').replace('%', '').length;

            ScrollTrigger.create({
                trigger: element,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    gsap.from({
                        value: 0
                    }, {
                        value: targetValue,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function () {
                            const currentValue = this.targets()[0].value;
                            element.textContent = currentValue.toFixed(Math.max(1, decimalPlaces)) + '%';
                        }
                    });
                }
            });
        }
        // Check if it's a dollar amount
        else if (text.includes('$')) {
            const targetValue = parseInt(text.replace(/[$,]/g, ''));

            ScrollTrigger.create({
                trigger: element,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    gsap.from({
                        value: 0
                    }, {
                        value: targetValue,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            element.textContent = '$' + current.toLocaleString();
                        }
                    });
                }
            });
        }
    });
}

// ==================== INITIALIZE ALL ANIMATIONS ====================
function initAllParallaxEffects() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                initScrollAnimations();
                initHeroParallax();
                initGradientTransitions();
                initSmoothScroll();
                initHeaderScroll();
                initCounterAnimations();

                // Refresh ScrollTrigger after all animations are set
                ScrollTrigger.refresh();
            }, 100);
        });
    } else {
        setTimeout(() => {
            initScrollAnimations();
            initHeroParallax();
            initGradientTransitions();
            initSmoothScroll();
            initHeaderScroll();
            initCounterAnimations();

            // Refresh ScrollTrigger after all animations are set
            ScrollTrigger.refresh();
        }, 100);
    }
}

// ==================== REFRESH ON WINDOW RESIZE ====================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});

// ==================== START EVERYTHING ====================
initAllParallaxEffects();

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initScrollAnimations,
        initHeroParallax,
        initGradientTransitions,
        initSmoothScroll
    };
}