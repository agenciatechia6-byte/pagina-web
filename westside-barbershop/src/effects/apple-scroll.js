/* ============================================================
   AppleScroll — animaciones de scroll estilo apple.com
   (vanilla JS + IntersectionObserver + un solo rAF de scroll)

   1) Parallax 3D del hero: la imagen vive en un plano trasero
      (perspective + translateZ en CSS) y se desplaza a distinta
      velocidad que el scroll (transform, nunca top/left).
   2) Escena sticky (#nosotros): la sección se fija y las frases
      aparecen palabra a palabra al ritmo del scroll.
   3) Clip-path reveal de los títulos [data-clip].
   4) Fallback total con prefers-reduced-motion y modo suave en
      móvil (menos parallax, sin pin).

   ── CONFIG ─────────────────────────────────────────────── */
const CONFIG = {
  parallaxDesktop: 0.18, // proporción del scroll que se mueve la imagen
  parallaxMobile: 0.07, //  ↳ en móvil, mucho menor (evita lag)
  stickyLength: 1.6, //     alto extra de la escena sticky (× viewport)
  stickyMinWidth: 1024, //  ancho mínimo para fijar la sección
  wordLift: 14, //          px que sube cada palabra al aparecer
  wordStaggerMs: 42, //     desfase entre palabras en el fallback móvil
};
/* ─────────────────────────────────────────────────────────── */

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

/* ---------- utilidades de texto: partir en palabras ---------- */
function splitWords(el) {
  const text = el.textContent.trim().replace(/\s+/g, " ");
  // El aria-label conserva la frase entera para lectores de pantalla;
  // las palabras sueltas quedan ocultas para ellos.
  el.setAttribute("aria-label", text);
  el.textContent = "";
  const frag = document.createDocumentFragment();
  text.split(" ").forEach((word, i, arr) => {
    const s = document.createElement("span");
    s.className = "ws-word";
    s.textContent = word;
    s.setAttribute("aria-hidden", "true");
    frag.appendChild(s);
    if (i < arr.length - 1) frag.appendChild(document.createTextNode(" "));
  });
  el.appendChild(frag);
  return el.querySelectorAll(".ws-word");
}

export function initAppleScroll() {
  /* ---------- 3) Clip-path reveal de títulos ----------
     Nota: no vale IntersectionObserver aquí — Chromium aplica el clip-path
     del propio elemento al calcular la intersección, y un título 100%
     recortado tiene área visible 0 y nunca "interseca". Se resuelve en el
     driver de scroll comprobando su posición (barato: ≤5 elementos, solo
     hasta que se revelan). */
  let pendingClips = Array.from(document.querySelectorAll("[data-clip]"));
  if (reduce) {
    pendingClips.forEach((el) => el.classList.add("is-visible"));
    pendingClips = [];
  }
  function revealClipsFrame() {
    if (!pendingClips.length) return;
    const limit = window.innerHeight * 0.8;
    pendingClips = pendingClips.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < limit && r.bottom > 0) {
        el.classList.add("is-visible");
        return false;
      }
      return true;
    });
  }

  /* ---------- estado compartido de la escena sticky ---------- */
  const scene = document.getElementById("nosotros-scene");
  const lines = [];
  const pinned =
    !reduce &&
    scene &&
    window.innerWidth >= CONFIG.stickyMinWidth &&
    window.matchMedia("(min-height: 560px)").matches;

  document.querySelectorAll("[data-words]").forEach((el) => {
    const words = reduce ? null : splitWords(el);
    lines.push({ el, words });
  });
  const cta = scene?.querySelector(".ws-cta") ?? null;

  if (reduce) {
    // Fallback estático: todo visible, sin partir palabras ni fijar nada.
    cta?.classList.add("is-visible");
  } else if (pinned) {
    scene.classList.add("pinned");
    scene.style.height = `${window.innerHeight * (1 + CONFIG.stickyLength)}px`;
  } else {
    // Móvil/tablet: sin pin; cada línea revela sus palabras en cascada
    // al entrar en viewport (IntersectionObserver, barato).
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const item = lines.find((l) => l.el === e.target);
          if (item) {
            item.revealed = true;
            item.words?.forEach((w, i) => {
              w.style.transitionDelay = `${i * CONFIG.wordStaggerMs}ms`;
              w.classList.add("in");
            });
          }
          io.unobserve(e.target);
        }),
      { threshold: 0.4 }
    );
    lines.forEach((l) => io.observe(l.el));
    cta && new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        cta.classList.add("is-visible");
        obs.disconnect();
      }
    }, { threshold: 0.4 }).observe(cta);
  }

  /* ---------- driver único de scroll (parallax + sticky) ---------- */
  const hero = document.getElementById("hero");
  const depth = hero?.querySelector(".hero-depth");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const pFactor = isMobile ? CONFIG.parallaxMobile : CONFIG.parallaxDesktop;

  function stickyFrame() {
    const rect = scene.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    if (range <= 0) return;
    const p = clamp01(-rect.top / range);

    // Cada línea ocupa una ventana de la escena; sus palabras se encienden
    // secuencialmente dentro de esa ventana (solo opacity + transform).
    lines.forEach(({ words }, li) => {
      if (!words) return;
      const start = 0.05 + li * 0.27;
      const t = clamp01((p - start) / 0.3);
      const n = words.length;
      words.forEach((w, wi) => {
        const o = clamp01(t * (n + 2) - wi);
        w.style.opacity = o;
        w.style.transform = `translateY(${((1 - o) * CONFIG.wordLift).toFixed(1)}px)`;
      });
    });
    cta?.classList.toggle("is-visible", p > 0.88);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      // Parallax del hero: solo mientras el hero está en pantalla.
      if (depth && window.scrollY < hero.offsetHeight) {
        depth.style.transform = `translate3d(0, ${(window.scrollY * pFactor).toFixed(1)}px, 0)`;
      }
      revealClipsFrame();
      if (pinned) stickyFrame();
    });
  }

  if (!reduce) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Al cambiar de idioma, main.js re-escribe los textos: volvemos a partir
  // las palabras y a pintar el estado actual.
  window.addEventListener("westside:i18n", () => {
    if (reduce) return;
    lines.forEach((item) => {
      item.words = splitWords(item.el);
      // Solo se muestran de inmediato las líneas que ya estaban reveladas.
      if (!pinned && item.revealed) item.words.forEach((w) => w.classList.add("in"));
    });
    if (pinned) stickyFrame();
  });
}
