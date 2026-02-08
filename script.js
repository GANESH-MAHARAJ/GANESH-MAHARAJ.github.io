// 3D Background & Animation Logic

// --- Configuration ---
const CONFIG = {
    colors: {
        background: 0x0f172a, // Slate 900
        particles: 0x64748b,  // Slate 500
        links: 0x3b82f6,      // Blue 500
        accent: 0x8b5cf6      // Violet 500
    },
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        z: 30
    },
    particles: {
        count: 150,
        size: 0.2,
        linkDistance: 100 // Distance to draw lines
    }
};

// --- Three.js Setup ---
let scene, camera, renderer, particles, particleSystem, lenis;

function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // 1. Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(CONFIG.colors.background, 0.002);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, CONFIG.camera.near, CONFIG.camera.far);
    camera.position.z = CONFIG.camera.z;

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Particles (Neural Network)
    createParticles();

    // 5. Events
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);

    // 6. Animation Loop
    animate();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < CONFIG.particles.count; i++) {
        // Random position spread
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 50;
        positions.push(x, y, z);

        // Random velocity
        const vx = (Math.random() - 0.5) * 0.05;
        const vy = (Math.random() - 0.5) * 0.05;
        const vz = (Math.random() - 0.5) * 0.05;
        velocities.push(vx, vy, vz);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    // Custom property to store velocities
    geometry.userData = { velocities: velocities };

    const material = new THREE.PointsMaterial({
        color: CONFIG.colors.links,
        size: CONFIG.particles.size,
        transparent: true,
        opacity: 0.8
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Lines (will be dynamic)
    // For simplicity efficiently, we can use a LineSegments geometry updated every frame 
    // or just render points for now and add lines later if needed for performance.
    // Let's stick to points floating nicely first, maybe add lines if performance allows.
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let mouseX = 0;
let mouseY = 0;

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
}

function animate() {
    requestAnimationFrame(animate);

    // Particle Movement
    const positions = particles.geometry.attributes.position.array;
    const velocities = particles.geometry.userData.velocities;

    for (let i = 0; i < CONFIG.particles.count; i++) {
        // Update positions
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        // Boundary check (bounce)
        if (positions[i * 3] < -50 || positions[i * 3] > 50) velocities[i * 3] *= -1;
        if (positions[i * 3 + 1] < -50 || positions[i * 3 + 1] > 50) velocities[i * 3 + 1] *= -1;
        if (positions[i * 3 + 2] < -25 || positions[i * 3 + 2] > 25) velocities[i * 3 + 2] *= -1;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // Mouse Interaction (Parallax & repulsion)
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Interactive Particles (Repulsion from mouse)
    // Convert 2D mouse to 3D position approx
    const vector = new THREE.Vector3(mouseX * 20, -mouseY * 20, 0); // Approx scaling

    for (let i = 0; i < CONFIG.particles.count; i++) {
        const px = positions[i * 3];
        const py = positions[i * 3 + 1];

        const dx = px - vector.x;
        const dy = py - vector.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 8) {
            const force = (8 - dist) * 0.05;
            velocities[i * 3] += dx * force * 0.2;
            velocities[i * 3 + 1] += dy * force * 0.2;
        }
    }

    renderer.render(scene, camera);
}

// --- Active Navigation ---
function initActiveNav() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll("nav a");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    link.classList.remove("nav-link-active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("nav-link-active");
                    }
                });
            }
        });
    }, { threshold: 0.3 }); // Trigger when 30% visible

    sections.forEach(section => observer.observe(section));
}

// --- GSAP Animations ---
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // 1. Scroll Progress Bar
    gsap.to("#progress-bar", {
        width: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3
        }
    });

    // 2. Typewriter Effect (Hero Text)
    const typeWriterText = document.getElementById("typewriter-text");
    if (typeWriterText) {
        gsap.to(typeWriterText, {
            text: {
                value: "B.Tech Computer Science (Data Science)",
                delimiter: ""
            },
            duration: 2.5,
            delay: 0.5,
            ease: "none"
        });
        // Clear initially to let it type out
        typeWriterText.innerText = "";
    }

    // 3. Magnetic Buttons
    const magneticBtns = document.querySelectorAll(".magnetic-btn");
    magneticBtns.forEach(btn => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                duration: 0.3,
                x: x * 0.2, // Magnetic strength
                y: y * 0.2,
                ease: "power2.out"
            });
        });

        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, {
                duration: 0.5,
                x: 0,
                y: 0,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // Hero Fade In
    gsap.from("#hero-content > *", {
        y: 50,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power3.out"
    });

    // Section Headers
    gsap.utils.toArray('.section-heading').forEach(heading => {
        gsap.from(heading, {
            scrollTrigger: {
                trigger: heading,
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            x: -50,
            opacity: 0,
            duration: 1
        });
    });

    // Cards Stagger
    gsap.utils.toArray('section').forEach(section => {
        const cards = section.querySelectorAll('.glass-card, .skill-card, .cert-card');
        if (cards.length > 0) {
            gsap.from(cards, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%" // Trigger a bit earlier
                },
                y: 50,
                // opacity: 0, // REMOVED to ensure visibility
                duration: 0.8,
                stagger: 0.1,
                ease: "back.out(1.7)"
            });
        }
    });
}

// --- Advanced Visuals ---
function initAdvancedVisuals() {
    // 1. Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows immediately
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with lag (handled by CSS transition or simple animation)
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Expand on hover
        const interactiveElements = document.querySelectorAll('a, button, .card-link');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    }

    // 2. 3D Tilt (Vanilla Tilt)
    VanillaTilt.init(document.querySelectorAll(".glass-card, .cert-card"), {
        max: 5,            // Max tilt rotation (degrees)
        speed: 400,        // Speed of the enter/exit transition
        glare: true,       // if it should have a "glare" effect
        "max-glare": 0.1,  // the maximum "glare" opacity
        scale: 1.02        // 2% scale on hover
    });
}

// --- Preloader (Refactored) ---
function initPreloader() {
    // Lock Scroll (Native + Lenis)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Stop Lenis if it exists
    if (window.lenis) window.lenis.stop();

    window.scrollTo(0, 0);

    const lines = [
        "> System.init()",
        "> Loading modules...",
        "> Accessing Neural Network...",
        "> Access Granted."
    ];

    const terminalLine = document.getElementById("terminal-line");
    const preloader = document.getElementById("preloader");

    let timeline = gsap.timeline({
        onComplete: () => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.8,
                onComplete: () => {
                    preloader.style.display = "none";

                    // Unlock Scroll - Forcefully
                    document.documentElement.style.overflow = '';
                    document.body.style.overflow = '';

                    // Restart Lenis
                    if (window.lenis) window.lenis.start();

                    // Start animations AFTER preloader
                    initThreeJS();
                    initGSAP();
                    initAdvancedVisuals();
                }
            });
        }
    });

    lines.forEach((line) => {
        timeline.to(terminalLine, {
            text: line,
            duration: 0.8,
            ease: "none",
            delay: 0.1
        }).to(terminalLine, {
            text: "",
            duration: 0.3,
            delay: 0.2
        });
    });
}

// --- Border Upgrade ---
function upgradeCards() {
    // Add gradient border class to specific cards for impact, or all glass-cards
    const cards = document.querySelectorAll(".glass-card, .cert-card");
    cards.forEach(card => {
        card.classList.add("gradient-border-card");
    });
}

// --- Lenis Smooth Scroll ---
function initLenis() {
    // Make it globally accessible via window to be safe
    window.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Connect GSAP
    if (typeof ScrollTrigger !== 'undefined') {
        window.lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            window.lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }
}

// --- Spotlight Effect ---
function initSpotlight() {
    const cards = document.querySelectorAll(".glass-card, .cert-card");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.background = `radial-gradient(800px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.06), rgba(15, 23, 42, 0.6) 40%)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.background = "";
        });
    });
}

// Initialize Everything (Clean Flow)
document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    // Stop immediately
    if (window.lenis) window.lenis.stop();

    initPreloader();
    initActiveNav();
    upgradeCards();
    initSpotlight();
});
