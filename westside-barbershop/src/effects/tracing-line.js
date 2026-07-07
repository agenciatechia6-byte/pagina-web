/* ============================================================
   Línea de transiciones (tracing beam):
   nace al principio de la página, serpentea por las secciones
   y termina en el icono de Instagram del footer.
   Se dibuja progresivamente con el scroll.
   ============================================================ */

const SVG_NS = "http://www.w3.org/2000/svg";

export function initTracingLine() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("tracing-line");

  // Trazado completo (pista tenue) + trazado de progreso (blanco brillante)
  const track = document.createElementNS(SVG_NS, "path");
  track.classList.add("tl-track");
  const beam = document.createElementNS(SVG_NS, "path");
  beam.classList.add("tl-beam");

  // Cabeza luminosa que viaja por la línea
  const head = document.createElementNS(SVG_NS, "circle");
  head.classList.add("tl-head");
  head.setAttribute("r", "5");

  // Nodo final: anillo que late alrededor del icono de Instagram
  const endRing = document.createElementNS(SVG_NS, "circle");
  endRing.classList.add("tl-end");
  endRing.setAttribute("r", "26");

  svg.append(track, beam, head, endRing);
  document.body.prepend(svg);

  let pathLength = 0;
  let endPoint = { x: 0, y: 0 };
  let progress = 0;
  let target = 0;
  let rafId = null;

  function anchorPoints() {
    const W = document.documentElement.clientWidth;
    const isNarrow = W < 1024;
    // La línea debe correr SIEMPRE por el canalón (fuera del contenido, que
    // llega hasta px-5 = 20px del borde). En pantallas anchas usamos el margen
    // libre del contenedor (máx 1200px); si no hay margen, la pegamos al borde.
    const gutter = (W - 1200) / 2 - 36;
    const edge = isNarrow ? 8 : Math.max(8, gutter);
    // El primer punto arranca en el mismo lado que la primera sección para no
    // cruzar el contenido del hero (título, CTAs y reel).
    const startX = isNarrow ? edge : W - edge;
    const pts = [[startX, 4]];

    ["servicios", "nosotros", "trabajos", "opiniones", "donde"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      // En pantallas estrechas baja por el canalón izquierdo; en anchas
      // alterna de lado por los márgenes libres del contenedor.
      const x = isNarrow ? edge : i % 2 === 0 ? W - edge : edge;
      pts.push([x, top + r.height * 0.3]);
      pts.push([x, top + r.height * 0.7]);
    });

    // Final: el icono de Instagram del footer
    const ig = document.getElementById("ig-footer");
    if (ig) {
      const r = ig.getBoundingClientRect();
      pts.push([r.left + window.scrollX + r.width / 2, r.top + window.scrollY + r.height / 2]);
    }
    return pts;
  }

  function buildPath() {
    const H = document.documentElement.scrollHeight;
    const W = document.documentElement.clientWidth;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.style.height = `${H}px`;

    const pts = anchorPoints();
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const dy = Math.max((y1 - y0) / 2, 0);
      d += ` C ${x0} ${y0 + dy}, ${x1} ${y1 - dy}, ${x1} ${y1}`;
    }
    track.setAttribute("d", d);
    beam.setAttribute("d", d);

    pathLength = beam.getTotalLength();
    beam.style.strokeDasharray = `${pathLength}`;

    const last = pts[pts.length - 1];
    endPoint = { x: last[0], y: last[1] };
    endRing.setAttribute("cx", endPoint.x);
    endRing.setAttribute("cy", endPoint.y);

    // Tras reconstruir (resize, carga de imágenes/iframe, cambio de idioma) el
    // alto del documento cambia: resincronizamos el progreso con el scroll
    // real para que la cabeza y el anillo no queden desfasados hasta el
    // siguiente evento scroll.
    target = scrollProgress();
    progress = target;
    render();
  }

  function scrollProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    return max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  }

  function render() {
    beam.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
    if (pathLength > 0) {
      const p = beam.getPointAtLength(pathLength * progress);
      head.setAttribute("cx", p.x);
      head.setAttribute("cy", p.y);
    }
    // Al llegar al final (>97%) se enciende el anillo del Instagram
    endRing.classList.toggle("active", progress > 0.97);
    head.classList.toggle("hidden-head", progress > 0.99 || progress < 0.002);
  }

  function tick() {
    // Suavizado: la línea persigue al scroll con un poco de inercia
    progress += (target - progress) * 0.12;
    if (Math.abs(target - progress) < 0.0005) {
      progress = target;
      render();
      rafId = null;
      return;
    }
    render();
    rafId = requestAnimationFrame(tick);
  }

  function onScroll() {
    target = scrollProgress();
    if (prefersReducedMotion) {
      progress = target;
      render();
      return;
    }
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  // Reconstruir cuando cambie la altura del documento (imágenes, embed
  // de Instagram, cambio de idioma) o el tamaño de la ventana.
  let rebuildTimer = null;
  const scheduleRebuild = () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(buildPath, 150);
  };
  window.addEventListener("resize", scheduleRebuild);
  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleRebuild).observe(document.body);
  }
  window.addEventListener("load", scheduleRebuild);

  window.addEventListener("scroll", onScroll, { passive: true });
  buildPath();
  onScroll();
}
