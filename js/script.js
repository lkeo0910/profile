const colorModes = ["dark", "light", "ultra"];
const HOME_TO_PAGE_MS = 1220;
const PAGE_TO_HOME_MS = 920;
const pageCache = new Map();
const prefetchedRoutes = new Set();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let homeEnterTimer;

const applyColorMode = (mode) => {
  const normalizedMode = mode === "night" ? "dark" : mode;
  const nextMode = colorModes.includes(normalizedMode) ? normalizedMode : "dark";
  document.body.dataset.theme = nextMode;
  localStorage.setItem("portfolioColorMode", nextMode);
};

const navigateTo = (url) => {
  window.location.assign(url);
};

const isModifiedClick = (event) =>
  event?.type === "click" && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0);

const canPrefetch = (url) => url.origin === window.location.origin && url.pathname.endsWith(".html");

const isHomeUrl = (url) => /\/(?:index\.html)?$/.test(url.pathname);

const fetchRoute = async (url) => {
  if (pageCache.has(url.href)) return pageCache.get(url.href);

  const response = await fetch(url.href, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Unable to fetch ${url.href}`);

  const html = await response.text();
  pageCache.set(url.href, html);
  return html;
};

const prefetchRoute = (href) => {
  if (!href) return Promise.resolve();

  const url = new URL(href, window.location.href);
  if (!canPrefetch(url) || prefetchedRoutes.has(url.href)) return Promise.resolve(pageCache.get(url.href));

  prefetchedRoutes.add(url.href);

  const hint = document.createElement("link");
  hint.rel = "prefetch";
  hint.href = url.href;
  hint.as = "document";
  document.head.append(hint);

  return fetchRoute(url).catch(() => {});
};

const prefetchSiteRoutes = () => {
  document.querySelectorAll('a[href$=".html"], [data-href$=".html"]').forEach((element) => {
    prefetchRoute(element.getAttribute("href") || element.dataset.href);
  });
};

const enterPage = () => {
  requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
};

const setPageTypeClasses = () => {
  const isHomePage = Boolean(document.querySelector(".home-stage"));
  document.body.classList.toggle("home-page", isHomePage);
  document.body.classList.toggle("detail-page", !isHomePage);
};

const prepareHomeTransition = () => {
  window.clearTimeout(homeEnterTimer);

  const isHomePage = document.body.classList.contains("home-page");
  document.body.classList.toggle("home-transitioning", isHomePage && !reduceMotion);
  document.body.classList.remove("home-enter-complete");

  if (!isHomePage || reduceMotion) {
    document.body.classList.add("home-enter-complete");
  }
};

const finishHomeTransition = () => {
  if (!document.body.classList.contains("home-page") || reduceMotion) return;

  homeEnterTimer = window.setTimeout(() => {
    document.body.classList.add("home-enter-complete");
    document.body.classList.remove("home-transitioning", "from-return-transition");
  }, 1250);
};

const setIdentityRouteOffset = () => {
  const identityBlock = document.querySelector(".left-rail .identity-block");
  const leftRail = document.querySelector(".left-rail");
  if (!identityBlock || !leftRail) return;

  const railStyles = window.getComputedStyle(leftRail);
  const targetTop = leftRail.getBoundingClientRect().top + parseFloat(railStyles.paddingTop || "0");
  const currentTop = identityBlock.getBoundingClientRect().top;
  document.documentElement.style.setProperty("--identity-route-y", `${targetTop - currentTop}px`);
};

const setIdentityReturnOffset = () => {
  const identityBlock = document.querySelector(".left-rail .identity-block");
  const leftRail = document.querySelector(".left-rail");
  if (!identityBlock || !leftRail) return;

  const railRect = leftRail.getBoundingClientRect();
  const blockRect = identityBlock.getBoundingClientRect();
  const railStyles = window.getComputedStyle(leftRail);
  const targetTop = railRect.bottom - parseFloat(railStyles.paddingBottom || "0") - blockRect.height;
  document.documentElement.style.setProperty("--identity-return-y", `${targetTop - blockRect.top}px`);
};

const swapPage = async (destination, options = {}) => {
  const { push = true, fromHomeTransition = false, fromReturnTransition = false } = options;

  try {
    const html = await fetchRoute(destination);
    const nextDocument = new DOMParser().parseFromString(html, "text/html");
    const currentTheme = document.body.dataset.theme || localStorage.getItem("portfolioColorMode") || "dark";

    document.title = nextDocument.title;
    document.body.className = nextDocument.body.className;
    document.body.innerHTML = nextDocument.body.innerHTML;
    applyColorMode(currentTheme);
    setPageTypeClasses();

    if (fromHomeTransition) {
      document.body.classList.add("from-route-transition");
    }

    if (fromReturnTransition) {
      document.body.classList.add("from-return-transition");
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (push) {
      history.pushState({ portfolioPage: true }, "", destination.href);
    }

    initPortfolio();
  } catch {
    navigateTo(destination.href);
  }
};

const homeTransitionOut = (item, destination) => {
  const homeStage = document.querySelector(".home-stage");
  prefetchRoute(destination.href);

  if (reduceMotion || !homeStage || document.body.classList.contains("route-transitioning")) {
    swapPage(destination);
    return;
  }

  setIdentityRouteOffset();
  document.body.classList.add("home-enter-complete");
  document.body.classList.remove("home-transitioning", "from-return-transition");
  item.classList.add("is-selected");
  homeStage.classList.add("is-transitioning");
  document.body.classList.add("route-transitioning");

  window.setTimeout(() => {
    swapPage(destination, { fromHomeTransition: true });
  }, HOME_TO_PAGE_MS);
};

const detailReturnTransition = (destination, options = {}) => {
  const { push = true } = options;
  prefetchRoute(destination.href);
  if (document.body.classList.contains("return-transitioning")) return;

  if (reduceMotion) {
    swapPage(destination, { push, fromReturnTransition: true });
    return;
  }

  setIdentityReturnOffset();
  document.body.classList.add("return-transitioning");

  window.setTimeout(() => {
    swapPage(destination, { push, fromReturnTransition: true });
  }, PAGE_TO_HOME_MS);
};

const closeMenu = () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("[data-nav-links]");
  if (!navToggle || !navLinks) return;

  navToggle.setAttribute("aria-expanded", "false");
  navLinks.classList.remove("is-open");
  document.body.classList.remove("nav-open");
};

const initThemeToggle = () => {
  let colorToggle = document.querySelector("[data-color-toggle]");

  if (!colorToggle) {
    colorToggle = document.createElement("button");
    colorToggle.className = "color-toggle";
    colorToggle.type = "button";
    colorToggle.setAttribute("aria-label", "Change color mode");
    colorToggle.dataset.colorToggle = "";
    colorToggle.append(document.createElement("span"));
    document.body.append(colorToggle);
  }

  colorToggle.addEventListener("click", () => {
    const currentIndex = colorModes.indexOf(document.body.dataset.theme);
    const nextMode = colorModes[(currentIndex + 1) % colorModes.length];
    applyColorMode(nextMode);
  });
};

const initBackTransition = () => {
  const pageBack = document.querySelector(".page-back");
  if (!pageBack) return;

  pageBack.addEventListener("pointerenter", () => prefetchRoute(pageBack.getAttribute("href")));
  pageBack.addEventListener("focus", () => prefetchRoute(pageBack.getAttribute("href")));

  pageBack.addEventListener("click", (event) => {
    if (isModifiedClick(event)) return;

    const href = pageBack.getAttribute("href");
    if (!href || document.body.classList.contains("return-transitioning")) return;

    const destination = new URL(href, window.location.href);
    event.preventDefault();
    detailReturnTransition(destination);
  });
};

const initIdentityRouteLinks = () => {
  document.querySelectorAll('.brand[href$=".html"], .mobile-brand[href$=".html"]').forEach((link) => {
    link.addEventListener("pointerenter", () => prefetchRoute(link.getAttribute("href")));
    link.addEventListener("focus", () => prefetchRoute(link.getAttribute("href")));
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || isModifiedClick(event)) return;

      const destination = new URL(href, window.location.href);
      if (!canPrefetch(destination) || destination.href === window.location.href) return;

      event.preventDefault();

      if (document.body.classList.contains("detail-page") && isHomeUrl(destination)) {
        detailReturnTransition(destination);
        return;
      }

      swapPage(destination);
    });
  });
};

const initMobileNav = () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("[data-nav-links]");
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("pointerenter", () => prefetchRoute(link.getAttribute("href")));
    link.addEventListener("focus", () => prefetchRoute(link.getAttribute("href")));
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href) return;

      if (!href.startsWith("#")) {
        const destination = new URL(href, window.location.href);
        if (canPrefetch(destination) && destination.href !== window.location.href && !isModifiedClick(event)) {
          event.preventDefault();
          closeMenu();
          swapPage(destination);
          return;
        }

        closeMenu();
        return;
      }

      const target = document.querySelector(href);

      if (target) {
        event.preventDefault();
        const headerOffset = window.matchMedia("(max-width: 1120px)").matches ? 76 : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: targetTop, behavior: reduceMotion ? "auto" : "smooth" });
        history.pushState(null, "", href);
      }

      closeMenu();
    });
  });
};

const initHomeProjects = () => {
  document.querySelectorAll(".home-stage .projectsLi").forEach((item) => {
    const getHref = () => item.dataset.href || item.querySelector("a")?.getAttribute("href");

    item.addEventListener("pointerenter", () => prefetchRoute(getHref()));
    item.addEventListener("focus", () => prefetchRoute(getHref()));

    item.addEventListener("click", (event) => {
      const link = item.querySelector("a");
      const href = getHref();
      if (!href || href.startsWith("#")) return;

      const destination = new URL(href, window.location.href);
      if (destination.href === window.location.href) return;

      if (link?.target && link.target !== "_self") return;
      if (isModifiedClick(event) && event.target.closest("a")) return;

      event.preventDefault();
      homeTransitionOut(item, destination);
    });

    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      item.click();
    });
  });
};

const initReveal = () => {
  const revealTargets = document.querySelectorAll("[data-reveal], .reveal-item");

  if (reduceMotion) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

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
};

const initPointerTilt = () => {
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
};

const initPortfolio = () => {
  applyColorMode(localStorage.getItem("portfolioColorMode") || document.body.dataset.theme || "dark");
  setPageTypeClasses();
  prepareHomeTransition();
  enterPage();
  finishHomeTransition();
  initThemeToggle();
  initBackTransition();
  initIdentityRouteLinks();
  initMobileNav();
  initHomeProjects();
  initReveal();
  initPointerTilt();

  if ("requestIdleCallback" in window) {
    requestIdleCallback(prefetchSiteRoutes, { timeout: 1200 });
  } else {
    window.setTimeout(prefetchSiteRoutes, 600);
  }
};

window.addEventListener("popstate", () => {
  const destination = new URL(window.location.href);

  if (document.body.classList.contains("detail-page") && isHomeUrl(destination)) {
    detailReturnTransition(destination, { push: false });
    return;
  }

  swapPage(destination, { push: false });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

history.replaceState({ portfolioPage: true }, "", window.location.href);
initPortfolio();
