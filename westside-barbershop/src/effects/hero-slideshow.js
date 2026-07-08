/* ============================================================
   Slideshow del hero con crossfade suave (solo opacity, GPU).

   - Cambio cada INTERVAL_MS con fundido de FADE_MS (el fade vive
     en CSS: .hero-slide { transition: opacity 1.5s }).
   - La primera foto carga eager (LCP); las demás se cargan justo
     antes de su primera aparición (data-src → src).
   - Se pausa cuando el hero sale de pantalla o la pestaña se
     oculta (batería/CPU).
   - prefers-reduced-motion: sin rotación, primera foto estática.

   ── CONFIG ─────────────────────────────────────────────── */
const INTERVAL_MS = 5500; // cada cuánto cambia la foto
const FADE_MS = 1500; //     debe coincidir con la transición CSS
/* ─────────────────────────────────────────────────────────── */

export function initHeroSlideshow() {
  const box = document.getElementById("hero-slideshow");
  if (!box) return;
  const slides = [...box.querySelectorAll(".hero-slide")];
  if (slides.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let current = 0;
  let timer = null;

  const ensureLoaded = (img) => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
  };

  function next() {
    const prev = current;
    current = (current + 1) % slides.length;
    ensureLoaded(slides[current]);
    // Precargar también la siguiente para que el próximo fundido sea limpio.
    ensureLoaded(slides[(current + 1) % slides.length]);
    slides[current].classList.add("is-active");
    slides[prev].classList.remove("is-active");
  }

  const start = () => {
    if (!timer) timer = setInterval(next, INTERVAL_MS);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  // Solo rota cuando el hero está a la vista y la pestaña activa.
  new IntersectionObserver((entries) => {
    entries.some((e) => e.isIntersecting) ? start() : stop();
  }).observe(box);
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  // Precalentar la segunda foto en cuanto haya un respiro.
  const warm = () => ensureLoaded(slides[1]);
  "requestIdleCallback" in window ? requestIdleCallback(warm, { timeout: 3000 }) : setTimeout(warm, 1500);
}
