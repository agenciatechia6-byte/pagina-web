/* ============================================================
   WESTSIDE Barbershop — i18n ES/CA, WhatsApp, animaciones
   ============================================================ */
import "./style.css";
import es from "./i18n/es.json";
import ca from "./i18n/ca.json";
import { initTracingLine } from "./effects/tracing-line.js";
import { initFloatingShapes, initMagneticButtons, initTiltCards } from "./effects/ambient.js";
import { initReveal3D } from "./effects/reveal-3d.js";
import { initAppleScroll } from "./effects/apple-scroll.js";
import { initHeroSlideshow } from "./effects/hero-slideshow.js";

// [PENDIENTE] Número real de WhatsApp del dueño (formato 34XXXXXXXXX, sin +)
const WHATSAPP_NUMBER = "34XXXXXXXXX";

const DICTS = { es, ca };
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- i18n: idioma en el hash (#ca), sin localStorage ---------- */
function getLang() {
  return location.hash.replace("#", "") === "ca" ? "ca" : "es";
}

function t(dict, key) {
  return key.split(".").reduce((o, k) => (o ? o[k] : undefined), dict);
}

function applyLang(lang) {
  const dict = DICTS[lang];
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = t(dict, el.dataset.i18n);
    if (val) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-content]").forEach((el) => {
    const val = t(dict, el.dataset.i18nContent);
    if (val) el.setAttribute("content", val);
  });

  // Enlaces de WhatsApp con mensaje precargado en el idioma activo
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t(dict, "wa.message"))}`;
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waUrl;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Estado visual del selector
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.setAttribute("aria-pressed", String(active));
    btn.classList.toggle("text-paper/50", !active);
  });

  // Avisar a los efectos que re-parten texto (palabra a palabra) de que el
  // contenido acaba de cambiar de idioma.
  window.dispatchEvent(new CustomEvent("westside:i18n", { detail: { lang } }));
}

function initI18n() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      // Guardamos la preferencia en el propio hash de la URL (sin localStorage)
      history.replaceState(null, "", lang === "ca" ? "#ca" : location.pathname);
      applyLang(lang);
    });
  });
  window.addEventListener("hashchange", () => {
    if (["", "#", "#ca", "#es"].includes(location.hash)) applyLang(getLang());
  });
  applyLang(getLang());
}

/* ---------- Nav: fondo al hacer scroll ---------- */
function initNav() {
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Micro-animaciones de aparición (fade simple para texto) ---------- */
function initReveals() {
  const els = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Escena 3D del hero: carga diferida tras el primer pintado ---------- */
function initHero3DLazy() {
  if (prefersReducedMotion) return;
  // El 3D solo aporta en escritorio con ratón (su interacción es el parallax
  // del cursor). En móvil/táctil lo omitimos: ahorra batería, datos (~120 kB)
  // y protege la puntuación de rendimiento móvil.
  const isDesktop = window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;
  if (!isDesktop) return;
  const load = () =>
    import("./effects/hero-3d.js")
      .then((m) => m.initHero3D())
      .catch(() => {}); // sin 3D si falla la carga: la web sigue funcionando
  if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 2500 });
  else setTimeout(load, 900);
}

/* ---------- Año del footer ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

initI18n();
initNav();
initReveals();
initReveal3D();
initAppleScroll();
initHeroSlideshow();
initTracingLine();
initFloatingShapes();
initMagneticButtons();
initTiltCards();
initHero3DLazy();
