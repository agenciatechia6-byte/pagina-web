/* ============================================================
   Lleida Tech IA — Animaciones 3D, calculadora e interacción
   ============================================================ */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Escena 3D del hero: red de partículas + icosaedro ---------- */
function initHeroScene() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || typeof THREE === "undefined" || prefersReducedMotion) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 16;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Red de partículas: evoca leads/conexiones llegando de todas partes
  const COUNT = 160;
  const positions = new Float32Array(COUNT * 3);
  const velocities = [];
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 36;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    velocities.push({
      x: (Math.random() - 0.5) * 0.012,
      y: (Math.random() - 0.5) * 0.012,
      z: (Math.random() - 0.5) * 0.008,
    });
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0x6db3ff, size: 0.09, transparent: true, opacity: 0.85 })
  );
  scene.add(particles);

  // Líneas entre partículas cercanas
  const MAX_LINKS = 600;
  const linePositions = new Float32Array(MAX_LINKS * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: 0x2f7bd9, transparent: true, opacity: 0.22 })
  );
  scene.add(lines);

  // Icosaedro dorado central: el "sistema" que ordena el caos
  const icoGroup = new THREE.Group();
  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.1, 0),
    new THREE.MeshBasicMaterial({ color: 0xd9b65a, wireframe: true, transparent: true, opacity: 0.5 })
  );
  const icoInner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.9, 1),
    new THREE.MeshBasicMaterial({ color: 0x2f7bd9, wireframe: true, transparent: true, opacity: 0.3 })
  );
  icoGroup.add(ico, icoInner);
  icoGroup.position.set(0, 0.5, -2);
  scene.add(icoGroup);

  let mouseX = 0, mouseY = 0;
  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  const LINK_DIST = 4.2;
  function animate(t) {
    requestAnimationFrame(animate);

    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;
      if (Math.abs(pos[i * 3]) > 18) velocities[i].x *= -1;
      if (Math.abs(pos[i * 3 + 1]) > 11) velocities[i].y *= -1;
      if (Math.abs(pos[i * 3 + 2]) > 7) velocities[i].z *= -1;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Reconstruir enlaces entre partículas cercanas
    let linkCount = 0;
    for (let i = 0; i < COUNT && linkCount < MAX_LINKS; i++) {
      for (let j = i + 1; j < COUNT && linkCount < MAX_LINKS; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < LINK_DIST * LINK_DIST) {
          const o = linkCount * 6;
          linePositions[o] = pos[i * 3];
          linePositions[o + 1] = pos[i * 3 + 1];
          linePositions[o + 2] = pos[i * 3 + 2];
          linePositions[o + 3] = pos[j * 3];
          linePositions[o + 4] = pos[j * 3 + 1];
          linePositions[o + 5] = pos[j * 3 + 2];
          linkCount++;
        }
      }
    }
    lineGeo.setDrawRange(0, linkCount * 2);
    lineGeo.attributes.position.needsUpdate = true;

    icoGroup.rotation.y += 0.0022;
    icoGroup.rotation.x += 0.0012;
    icoInner.rotation.y -= 0.004;
    icoGroup.position.y = 0.5 + Math.sin(t * 0.0006) * 0.5;

    // Parallax suave con el ratón
    camera.position.x += (mouseX * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}

/* ---------- Escena 3D del CTA: toroide de "flujo continuo 24/7" ---------- */
function initCtaScene() {
  const canvas = document.getElementById("cta-canvas");
  if (!canvas || typeof THREE === "undefined" || prefersReducedMotion) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 11;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const torus = new THREE.Mesh(
    new THREE.TorusKnotGeometry(3.4, 0.85, 140, 18),
    new THREE.MeshBasicMaterial({ color: 0x2f7bd9, wireframe: true, transparent: true, opacity: 0.28 })
  );
  scene.add(torus);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  function animate() {
    requestAnimationFrame(animate);
    torus.rotation.x += 0.0016;
    torus.rotation.y += 0.0024;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}

/* ---------- Aparición al hacer scroll ---------- */
function initReveals() {
  const els = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Contadores del hero ---------- */
function initCounters() {
  const counters = document.querySelectorAll(".trust-num");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      if (prefersReducedMotion) { el.textContent = target; io.unobserve(el); return; }
      const start = performance.now();
      const DURATION = 1600;
      (function tick(now) {
        const p = Math.min((now - start) / DURATION, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => io.observe(el));
}

/* ---------- Tilt 3D en tarjetas ---------- */
function initTilt() {
  if (prefersReducedMotion || !window.matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll(".card-tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

/* ---------- Calculadora de la pérdida ---------- */
function initCalculator() {
  const leads = document.getElementById("calcLeads");
  const value = document.getElementById("calcValue");
  if (!leads || !value) return;

  const leadsVal = document.getElementById("calcLeadsVal");
  const valueVal = document.getElementById("calcValueVal");
  const leadsLabel = document.getElementById("calcLeadsLabel");
  const valueLabel = document.getElementById("calcValueLabel");
  const month = document.getElementById("calcMonth");
  const year = document.getElementById("calcYear");
  const fmt = (n) => n.toLocaleString("es-ES");

  const SECTORS = {
    inmo: {
      leadsLabel: "Leads que se te escapan al mes",
      valueLabel: "Comisión media por operación (€)",
      valueDefault: 3000, valueMin: 500, valueMax: 9000, valueStep: 100,
      leadsDefault: 2,
    },
    camping: {
      leadsLabel: "Reservas que se te escapan al mes",
      valueLabel: "Valor medio de una estancia (€)",
      valueDefault: 450, valueMin: 100, valueMax: 2000, valueStep: 25,
      leadsDefault: 6,
    },
  };

  function update() {
    const monthly = parseInt(leads.value, 10) * parseInt(value.value, 10);
    leadsVal.textContent = leads.value;
    valueVal.textContent = fmt(parseInt(value.value, 10)) + " €";
    month.textContent = fmt(monthly);
    year.textContent = fmt(monthly * 12);
  }

  document.querySelectorAll(".calc-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".calc-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const s = SECTORS[tab.dataset.sector];
      leadsLabel.textContent = s.leadsLabel;
      valueLabel.textContent = s.valueLabel;
      value.min = s.valueMin; value.max = s.valueMax; value.step = s.valueStep; value.value = s.valueDefault;
      leads.value = s.leadsDefault;
      update();
    });
  });

  leads.addEventListener("input", update);
  value.addEventListener("input", update);
  update();
}

/* ---------- Nav: fondo al hacer scroll + menú móvil ---------- */
function initNav() {
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  const toggle = document.getElementById("navToggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

initHeroScene();
initCtaScene();
initReveals();
initCounters();
initTilt();
initCalculator();
initNav();
