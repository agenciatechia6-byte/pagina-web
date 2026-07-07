/* ============================================================
   Reveal3D — transiciones 3D de entrada de secciones.
   Componente reutilizable, declarativo y configurable por HTML.

   USO (declarativo, sin tocar JS):
     <div data-reveal="tilt">…</div>

   PRESETS: "rise" (sutil), "tilt" (3D hacia el usuario),
            "flip" (llamativa, con resorte), "zoom".

   OVERRIDES por elemento (opcionales):
     data-reveal-duration="620"   → ms de la transición
     data-reveal-delay="120"      → ms de retardo
     data-reveal-depth="60"       → px de profundidad (translateZ)
     data-reveal-angle="9"        → grados de giro
     data-reveal-axis="x|y"       → eje del giro (por defecto x)

   STAGGER (encadenado): pon en el CONTENEDOR
     data-reveal-stagger="70"     → ms entre hijos directos
     data-reveal-stagger-base="0" → retardo inicial (opcional)
   y a cada hijo directo su propio data-reveal.

   Cumple:
   1) 60 fps → solo anima transform y opacity; nada de reflows.
   2) Easing natural → cubic-bezier (resorte en "flip").
   3) Duración 300–800 ms (600 ms por defecto).
   4) prefers-reduced-motion → aparición estática instantánea.
   5) Responsive → degrada el 3D en móvil/equipos modestos (.r3d-lite).
   6) will-change con criterio → se activa al animar y se retira al acabar.
   ============================================================ */

const DEFAULTS = {
  threshold: 0.15,
  rootMargin: "0px 0px -40px 0px",
  // Se considera "equipo modesto" para degradar el 3D:
  weakCores: 4, // núcleos lógicos <= este valor
  weakMemory: 4, // GB de RAM (deviceMemory) <= este valor
};

export function initReveal3D(userOpts = {}) {
  const opts = { ...DEFAULTS, ...userOpts };
  const root = document.documentElement;
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // (5) Degradación: sin rotaciones 3D en móvil o hardware modesto.
  const weak =
    window.matchMedia("(max-width: 640px)").matches ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= opts.weakCores) ||
    (navigator.deviceMemory && navigator.deviceMemory <= opts.weakMemory);
  if (weak) root.classList.add("r3d-lite");

  // (4) Fallback estático: mostramos todo sin animar.
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Stagger: fija el retardo de cada hijo directo del grupo.
  document.querySelectorAll("[data-reveal-stagger]").forEach((group) => {
    const step = parseInt(group.dataset.revealStagger, 10) || 80;
    const base = parseInt(group.dataset.revealStaggerBase, 10) || 0;
    group.querySelectorAll(":scope > [data-reveal]").forEach((child, i) => {
      child.style.setProperty("--r3d-delay", `${base + i * step}ms`);
    });
  });

  // Overrides por elemento → se traducen a custom properties CSS.
  els.forEach((el) => {
    const d = el.dataset;
    if (d.revealDuration) el.style.setProperty("--r3d-dur", `${d.revealDuration}ms`);
    if (d.revealDelay) el.style.setProperty("--r3d-delay", `${d.revealDelay}ms`);
    if (d.revealDepth) el.style.setProperty("--r3d-z", `${-Math.abs(parseFloat(d.revealDepth))}px`);
    if (d.revealAngle) {
      const axis = (d.revealAxis || "x").toLowerCase() === "y" ? "--r3d-ry" : "--r3d-rx";
      el.style.setProperty(axis, `${parseFloat(d.revealAngle)}deg`);
    }
  });

  // (6) will-change solo mientras dura la animación.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);

      el.classList.add("is-animating"); // activa will-change
      // Dos frames para garantizar que el estado inicial se pinta antes
      // de disparar la transición (evita saltos).
      requestAnimationFrame(() =>
        requestAnimationFrame(() => el.classList.add("is-visible"))
      );

      const cleanup = (e) => {
        if (e.target !== el || e.propertyName !== "transform") return;
        el.classList.remove("is-animating"); // retira will-change
        el.removeEventListener("transitionend", cleanup);
      };
      el.addEventListener("transitionend", cleanup);
    });
  }, { threshold: opts.threshold, rootMargin: opts.rootMargin });

  els.forEach((el) => io.observe(el));
}
