const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("[data-nav-links]");
const colorToggle = document.querySelector("[data-color-toggle]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const colorModes = ["dark", "light", "ultra"];

const applyColorMode = (mode) => {
  const normalizedMode = mode === "night" ? "dark" : mode;
  const nextMode = colorModes.includes(normalizedMode) ? normalizedMode : "dark";
  document.body.dataset.theme = nextMode;
  localStorage.setItem("portfolioColorMode", nextMode);
};

applyColorMode(localStorage.getItem("portfolioColorMode") || "dark");

if (colorToggle) {
  colorToggle.addEventListener("click", () => {
    const currentIndex = colorModes.indexOf(document.body.dataset.theme);
    const nextMode = colorModes[(currentIndex + 1) % colorModes.length];
    applyColorMode(nextMode);
  });
}

const closeMenu = () => {
  if (!navToggle || !navLinks) return;
  navToggle.setAttribute("aria-expanded", "false");
  navLinks.classList.remove("is-open");
  document.body.classList.remove("nav-open");
};

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) {
        closeMenu();
        return;
      }

      const target = targetId && document.querySelector(targetId);

      if (target) {
        event.preventDefault();
        const headerOffset = window.matchMedia("(max-width: 1120px)").matches ? 76 : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: targetTop, behavior: reduceMotion ? "auto" : "smooth" });
        history.pushState(null, "", targetId);
      }

      closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const homeStage = document.querySelector(".home-stage");
const homeProjectLinks = document.querySelectorAll(".home-stage .projects a");

homeProjectLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (reduceMotion || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (link.target && link.target !== "_self") return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || !homeStage || document.body.classList.contains("route-transitioning")) return;

    const destination = new URL(href, window.location.href);
    if (destination.href === window.location.href) return;

    event.preventDefault();
    const selectedItem = link.closest(".projectsLi");
    selectedItem?.classList.add("is-selected");
    homeStage.classList.add("is-transitioning");
    document.body.classList.add("route-transitioning");

    window.setTimeout(() => {
      window.location.href = destination.href;
    }, 1320);
  });
});

const revealTargets = document.querySelectorAll("[data-reveal], .reveal-item");

if (reduceMotion) {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((target) => observer.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

document.querySelectorAll(".button-link, .project-link").forEach((link) => {
  link.addEventListener("pointermove", (event) => {
    if (reduceMotion) return;
    const rect = link.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    link.style.transform = `translate(${x * 0.08}px, ${y * 0.14}px)`;
  });

  link.addEventListener("pointerleave", () => {
    link.style.transform = "";
  });
});
