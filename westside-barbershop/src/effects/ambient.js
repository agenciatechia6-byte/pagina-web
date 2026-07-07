/* ============================================================
   Efectos ambientales estilo novify (monocromo):
   - Formas geométricas wireframe flotando con parallax de scroll
   - Botones "magnéticos" que siguen ligeramente al cursor
   ============================================================ */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Formas flotantes por sección: [sección, tipo, tamaño, posición, velocidad] */
const SHAPES = [
  ["servicios", "square", 110, { top: "8%", right: "4%" }, 0.12],
  ["servicios", "ring", 150, { bottom: "6%", left: "2%" }, -0.08],
  ["trabajos", "ring", 120, { top: "10%", left: "3%" }, 0.1],
  ["trabajos", "square", 90, { bottom: "12%", right: "5%" }, -0.12],
  ["opiniones", "square", 130, { top: "12%", right: "3%" }, 0.09],
  ["donde", "ring", 100, { top: "6%", left: "40%" }, -0.1],
];

export function initFloatingShapes() {
  // En móvil las formas en rotación provocaban overflow horizontal y gastaban
  // batería sin aportar apenas: las mostramos solo en pantallas medianas o más.
  if (prefersReducedMotion || window.innerWidth < 768) return;

  const items = [];
  SHAPES.forEach(([sectionId, type, size, pos, speed], i) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.classList.add("has-floats");

    const el = document.createElement("div");
    el.className = `float-shape float-${type}`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    Object.assign(el.style, pos);
    // El giro vive en ::before; el desfase se pasa por custom property para
    // que cada forma rote fuera de fase (un delay inline en el div no llega
    // al pseudo-elemento).
    el.style.setProperty("--spin-delay", `${i * -3}s`);
    el.setAttribute("aria-hidden", "true");
    section.appendChild(el);
    items.push({ el, section, speed });
  });

  if (!items.length) return;

  let ticking = false;
  function update() {
    const vh = window.innerHeight;
    items.forEach(({ el, section, speed }) => {
      const r = section.getBoundingClientRect();
      // Distancia del centro de la sección al centro del viewport
      const delta = r.top + r.height / 2 - vh / 2;
      el.style.setProperty("--parallax", `${(-delta * speed).toFixed(1)}px`);
    });
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/* Botones magnéticos: se inclinan hacia el cursor (solo dispositivos con hover) */
export function initMagneticButtons() {
  if (prefersReducedMotion || !window.matchMedia("(hover: hover)").matches) return;

  document.querySelectorAll(".btn-primary, .btn-outline").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = `translate(${x * 6}px, ${y * 5}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

/* Tarjetas con inclinación 3D al pasar el cursor */
export function initTiltCards() {
  if (prefersReducedMotion || !window.matchMedia("(hover: hover)").matches) return;

  document.querySelectorAll(".card-service, .gallery-img, .card-review").forEach((card) => {
    card.classList.add("tilt-ready");
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}
