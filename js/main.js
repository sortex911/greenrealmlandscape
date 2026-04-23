// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Draggable);

// Initialize all animations when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initHeroAnimations();
  initScrollAnimations();
  initPortfolioScroller();
  initOverviewAnimations();
  initProcessAnimation();
  initTeamAnimations();
  initTestimonialAnimations();
});

// Navbar scroll effect
function initNavbar() {
  const navbar = document.getElementById("navbar");
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// Hero Section Animations
function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // Canvas Image Sequence Animation
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const context = canvas.getContext("2d");
    canvas.width = 1920;
    canvas.height = 1080;

    const frameCount = 156;
    const currentFrame = index => (
      `assets/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`
    );

    const images = [];
    const heroSequence = {
      frame: 0
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    images[0].onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
    };

    gsap.to(heroSequence, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "+=1500",
        scrub: 0.5,
        pin: true
      },
      onUpdate: () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        if(images[heroSequence.frame]) {
          context.drawImage(images[heroSequence.frame], 0, 0, canvas.width, canvas.height);
        }
      }
    });

    // Fade out hero text while scrolling
    gsap.to(".hero-content, .scroll-indicator", {
      opacity: 0,
      y: -50,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "+=50%",
        scrub: true
      }
    });
  }

  // Initial load animations
  tl.fromTo(".hero-title", 
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 1.2, delay: 0.2 }
  )
  .fromTo(".hero-subtitle",
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 1 },
    "-=0.8"
  )
  .fromTo(".scroll-indicator",
    { opacity: 0 },
    { opacity: 1, duration: 1 },
    "-=0.6"
  );
}

// General Scroll Reveal Animations
function initScrollAnimations() {
  // Fade up elements
  const fadeUpElements = document.querySelectorAll(".fade-up");
  
  fadeUpElements.forEach(element => {
    gsap.fromTo(element,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%", // trigger when element is 85% down the viewport
          toggleActions: "play none none reverse" // Play on scroll down, reverse on scroll up
        }
      }
    );
  });

  // Services Section Premium Animation
  const servicesTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".services",
      start: "top 80%",
    }
  });

  servicesTl.to(".service-header-animate", {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: "power3.out"
  })
  .to(".service-card-animate", {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out"
  }, "-=0.4")
  .to(".icon-animate", {
    scale: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: "back.out(1.7)"
  }, "-=0.6");
}
// 3D Portfolio Scroller
function initPortfolioScroller() {
  const boxes = gsap.utils.toArray('.box');
  if (boxes.length === 0) return;

  const progressObj = { value: 0 };
  
  function updateBoxes() {
    boxes.forEach((box, i) => {
      const offset = i - progressObj.value; 
      
      let wrappedOffset = offset;
      const half = boxes.length / 2;
      while (wrappedOffset > half) wrappedOffset -= boxes.length;
      while (wrappedOffset < -half) wrappedOffset += boxes.length;

      const sign = wrappedOffset < 0 ? -1 : 1;
      const absOffset = Math.abs(wrappedOffset);

      let rotateY = sign * (-50 * Math.min(absOffset, 1));
      let scale = 1 - (Math.min(absOffset, 3) * 0.12);
      let z = -absOffset * 150;
      let opacity = 1 - (Math.max(absOffset - 1, 0) * 0.4);
      
      let x = 0;
      let xStep1 = window.innerWidth < 768 ? 140 : 250;
      let xStepMore = window.innerWidth < 768 ? 60 : 100;

      if (absOffset <= 1) {
        x = sign * (xStep1 * absOffset);
      } else {
        x = sign * (xStep1 + (absOffset - 1) * xStepMore);
      }
      
      gsap.set(box, {
        x: x,
        yPercent: -50,
        xPercent: -50,
        left: "50%",
        top: "50%",
        z: z,
        scale: Math.max(scale, 0),
        rotationY: rotateY,
        opacity: Math.max(opacity, 0),
        zIndex: Math.round(100 - absOffset * 10)
      });
    });
  }

  // Initial render
  updateBoxes();
  window.addEventListener('resize', updateBoxes);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".portfolio",
      start: "center center",
      end: "+=3000",
      pin: true,
      scrub: 1,
    }
  });

  tl.to(progressObj, {
    value: boxes.length,
    ease: "none",
    onUpdate: updateBoxes
  });

  // Connect drag to window scroll seamlessly
  Draggable.create(".drag-proxy", {
    type: "x",
    trigger: ".boxes-wrapper",
    onDrag: function() {
      // Moving drag proxy left (negative deltaX) should scroll page down (positive scroll)
      const scrollAmount = -this.deltaX * 4;
      window.scrollBy(0, scrollAmount);
    }
  });
}

// Stats Counter Animation
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  let hasAnimated = false;

  // Using Intersection Observer for the counters since it's cleaner for simple number counting
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasAnimated) {
      hasAnimated = true;
      
      counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.innerText = Math.ceil(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.innerText = target;
          }
        };
        
        updateCounter();
      });
    }
  }, { threshold: 0.5 });

  const statsSection = document.getElementById("stats");
  if (statsSection) {
    observer.observe(statsSection);
  }
}

// Contact Form Submission (Mock)
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button');
  const originalText = btn.innerText;
  
  btn.innerText = 'Sending...';
  btn.style.opacity = '0.8';
  
  setTimeout(() => {
    btn.innerText = 'Message Sent!';
    btn.style.backgroundColor = '#476A2F'; // Lighter green success
    this.reset();
    
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.backgroundColor = '';
      btn.style.opacity = '1';
    }, 3000);
  }, 1500);
});

// Team Section Animations
function initTeamAnimations() {
  const teamSection = document.getElementById("team");
  if (!teamSection) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: teamSection,
      start: "top 80%",
    }
  });

  // Reveal Header
  tl.to(".team-header-animate", {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: "power3.out"
  });

  // Stagger Cards
  tl.to(".team-card-animate", {
    scale: 1,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out"
  }, "-=0.4");
}

// Overview Section Animations
function initOverviewAnimations() {
  const overviewSection = document.getElementById("overview");
  if (!overviewSection) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: overviewSection,
      start: "top 75%",
    }
  });

  tl.to(".overview-animate-title", {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: "power3.out"
  })
  .to(".overview-animate-text", {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.15,
    ease: "power3.out"
  }, "-=0.4")
  .to(".overview-animate-image", {
    scale: 1,
    opacity: 1,
    duration: 1,
    ease: "power3.out"
  }, "-=0.6");
}

// Testimonials Animations
function initTestimonialAnimations() {
  const section = document.querySelector('.testimonials-premium');
  if (!section) return;

  const items = gsap.utils.toArray('.timeline-item');
  const cards = gsap.utils.toArray('.testimonial-card');
  const progressLine = document.querySelector('.timeline-progress');

  let mm = gsap.matchMedia();

  mm.add("(min-width: 769px)", () => {
    // Initial states
    gsap.set(items.slice(1), { opacity: 0.3, scale: 0.8 });
    gsap.set(cards.slice(1), { opacity: 0, x: 50, autoAlpha: 0 });
    gsap.set(items[0], { opacity: 1, scale: 1.2 });
    gsap.set(cards[0], { opacity: 1, x: 0, autoAlpha: 1 });

    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        toggleClass: { targets: "body", className: "bg-beige" }
      }
    });

    // Progress line fills entire duration
    mainTl.to(progressLine, { height: "100%", ease: "none" }, 0);

    // Duration of each transition relative to total scroll
    const totalItems = items.length;
    
    items.forEach((item, i) => {
      if (i > 0) {
        const startTime = (i / totalItems);

        // Previous item & card OUT
        mainTl.to(items[i-1], { 
          opacity: 0.3, 
          scale: 0.8, 
          duration: 0.1 
        }, startTime);
        
        mainTl.to(cards[i-1], { 
          opacity: 0, 
          x: -50, 
          autoAlpha: 0,
          duration: 0.1 
        }, startTime);

        // Current item & card IN
        mainTl.to(item, { 
          opacity: 1, 
          scale: 1.2, 
          duration: 0.1 
        }, startTime);
        
        mainTl.to(cards[i], { 
          opacity: 1, 
          x: 0, 
          autoAlpha: 1,
          duration: 0.1 
        }, startTime);
      }
    });
  });
}

// CodePen Process Timeline Animations
function initProcessAnimation() {
  const images = document.querySelectorAll(".process-section img");
  const loader = document.querySelector(".loader--text");
  const loaderContainer = document.querySelector(".loader");
  
  if (!loaderContainer || !images.length) return;

  // loading progress
  const updateProgress = (instance) => {
    if (loader) {
      loader.textContent = Math.round((instance.progressedCount / images.length) * 100) + "%";
    }
  };

  // main animation
  const showDemo = () => {
    gsap.to(loaderContainer, { autoAlpha: 0 });

    const processSection = document.getElementById("process");

    // Calculate the longest scroll distance to use for a responsive 1:1 scroll mapping
    const wrappers = gsap.utils.toArray(".demo-gallery .wrapper");
    const maxScrollDistance = Math.max(...wrappers.map(w => w.scrollWidth - window.innerWidth));

    let mm = gsap.matchMedia();

    // Desktop Animation (Pin & Scrub)
    mm.add("(min-width: 769px)", () => {
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: processSection,
          start: "center center",
          end: () => "+=" + Math.max(maxScrollDistance, 1000), // Responsive distance, min 1000px
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          toggleClass: { targets: ".navbar", className: "nav-hidden" }
        }
      });

      gsap.utils.toArray(".demo-gallery").forEach((section, index) => {
        const wrapper = section.querySelector(".wrapper");
        const maxScroll = wrapper.scrollWidth - section.offsetWidth;
        
        const [xStart, xEnd] =
          index % 2
            ? [0, -maxScroll] // Row 2 (index 1): Move Left
            : [-maxScroll, 0]; // Row 1 (index 0): Move Right

        tl.fromTo(
          wrapper,
          { x: xStart },
          { x: xEnd, ease: "none" },
          0 // All rows animate simultaneously
        );
      });
    });
  };

  // Mobile Menu Toggle Logic
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const icon = mobileMenuBtn.querySelector("i");
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("ph-list");
        icon.classList.add("ph-x");
      } else {
        icon.classList.remove("ph-x");
        icon.classList.add("ph-list");
      }
    });
    
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        const icon = mobileMenuBtn.querySelector("i");
        icon.classList.remove("ph-x");
        icon.classList.add("ph-list");
      });
    });
  }

  // wait for images load
  imagesLoaded(images)
    .on("progress", updateProgress)
    .on("always", showDemo);
}
