/* =========================================================
   Spendora Intro Animation
   Standalone overlay — does not modify React or localStorage.
   ========================================================= */

(() => {
  "use strict";

  // Avoid creating the overlay more than once.
  if (document.getElementById("spendora-intro")) {
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const letters = "SPENDORA";
  const introDuration = reduceMotion ? 450 : 3500;
  const exitDuration = reduceMotion ? 50 : 700;

  const intro = document.createElement("div");
  intro.id = "spendora-intro";
  intro.setAttribute("role", "status");
  intro.setAttribute("aria-label", "Welcome to Spendora");
  intro.setAttribute("aria-live", "polite");

  const glow = document.createElement("div");
  glow.className = "spendora-intro__glow";
  glow.setAttribute("aria-hidden", "true");

  const grid = document.createElement("div");
  grid.className = "spendora-intro__grid";
  grid.setAttribute("aria-hidden", "true");

  const content = document.createElement("div");
  content.className = "spendora-intro__content";

  const orb = document.createElement("div");
  orb.className = "spendora-intro__orb";
  orb.setAttribute("aria-hidden", "true");

  const wordmark = document.createElement("h1");
  wordmark.className = "spendora-intro__wordmark";
  wordmark.setAttribute("aria-label", "Spendora");

  const directions = [
    { x: "-55px", y: "-45px", rotate: "-24deg" },
    { x: "0px", y: "55px", rotate: "18deg" },
    { x: "42px", y: "-50px", rotate: "28deg" },
    { x: "-38px", y: "40px", rotate: "-20deg" },
    { x: "0px", y: "-60px", rotate: "14deg" },
    { x: "45px", y: "45px", rotate: "-15deg" },
    { x: "-48px", y: "-35px", rotate: "20deg" },
    { x: "30px", y: "55px", rotate: "-24deg" }
  ];

  Array.from(letters).forEach((letter, index) => {
    const span = document.createElement("span");

    span.className = "spendora-intro__letter";
    span.textContent = letter;
    span.style.setProperty("--intro-x", directions[index].x);
    span.style.setProperty("--intro-y", directions[index].y);
    span.style.setProperty(
      "--intro-rotate",
      directions[index].rotate
    );
    span.style.setProperty(
      "--intro-delay",
      `${reduceMotion ? 0 : 450 + index * 95}ms`
    );

    span.setAttribute("aria-hidden", "true");
    wordmark.appendChild(span);
  });

  const line = document.createElement("div");
  line.className = "spendora-intro__line";
  line.setAttribute("aria-hidden", "true");

  const tagline = document.createElement("p");
  tagline.className = "spendora-intro__tagline";
  tagline.append("SMARTER SPENDING. ");

  const accent = document.createElement("span");
  accent.textContent = "SIMPLER LIVING.";
  tagline.appendChild(accent);

  const loader = document.createElement("div");
  loader.className = "spendora-intro__loader";

  const loaderDot = document.createElement("span");
  loaderDot.className = "spendora-intro__loader-dot";
  loaderDot.setAttribute("aria-hidden", "true");

  const loaderText = document.createElement("span");
  loaderText.textContent = "YOUR MONEY, IN FOCUS";

  loader.append(loaderDot, loaderText);
  content.append(orb, wordmark, line, tagline);
  intro.append(glow, grid, content, loader);

  function mountIntro() {
    if (!document.body || document.getElementById("spendora-intro")) {
      return;
    }

    document.body.appendChild(intro);

    // Keep the overlay temporary, even if an animation event is missed.
    window.setTimeout(() => {
      intro.classList.add("spendora-intro--leaving");

      window.setTimeout(() => {
        intro.remove();
      }, exitDuration);
    }, introDuration);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountIntro, {
      once: true
    });
  } else {
    mountIntro();
  }
})();