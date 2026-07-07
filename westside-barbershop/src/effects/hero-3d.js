/* ============================================================
   Escena 3D del hero (estilo novify, en monocromo estricto):
   icosaedro y anillo wireframe flotando + partículas, con
   parallax al mover el ratón/girar el móvil.
   Se importa dinámicamente tras la carga para no penalizar
   el LCP; imports selectivos de three para un bundle mínimo.
   ============================================================ */
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  IcosahedronGeometry,
  TorusGeometry,
  Mesh,
  MeshBasicMaterial,
  BufferGeometry,
  BufferAttribute,
  Points,
  PointsMaterial,
  Group,
} from "three";

export function initHero3D() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-3d";
  canvas.setAttribute("aria-hidden", "true");
  // Insertar sobre el degradado pero bajo el grano y el contenido
  const grain = hero.querySelector(".grain");
  hero.insertBefore(canvas, grain);

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, 1, 0.1, 60);
  camera.position.z = 12;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const group = new Group();

  // Icosaedro wireframe — flota a la derecha del titular en desktop
  const ico = new Mesh(
    new IcosahedronGeometry(3, 0),
    new MeshBasicMaterial({ color: 0xfafafa, wireframe: true, transparent: true, opacity: 0.14 })
  );
  // Anillo wireframe atravesado
  const ring = new Mesh(
    new TorusGeometry(4.4, 0.05, 8, 90),
    new MeshBasicMaterial({ color: 0xfafafa, wireframe: true, transparent: true, opacity: 0.1 })
  );
  ring.rotation.x = Math.PI / 2.4;
  group.add(ico, ring);
  scene.add(group);

  // Partículas monocromas suspendidas
  const COUNT = 90;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 30;
    positions[i + 1] = (Math.random() - 0.5) * 18;
    positions[i + 2] = (Math.random() - 0.5) * 10;
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute("position", new BufferAttribute(positions, 3));
  const particles = new Points(
    pGeo,
    new PointsMaterial({ color: 0xfafafa, size: 0.05, transparent: true, opacity: 0.45 })
  );
  scene.add(particles);

  function layout() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // En desktop el conjunto se desplaza a la derecha del titular;
    // en móvil queda centrado arriba, detrás del texto.
    if (w >= 1024) group.position.set(4.5, 0.5, 0);
    else group.position.set(0, 2.8, -2);
  }
  window.addEventListener("resize", layout);
  layout();

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // Solo renderiza cuando el hero está a la vista y la pestaña activa
  let visible = true;
  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible && !running) start();
  }).observe(hero);

  let running = false;
  function frame(t) {
    if (!visible || document.hidden) {
      running = false;
      return;
    }
    group.rotation.y += 0.0018;
    ico.rotation.x += 0.0012;
    ring.rotation.z += 0.001;
    group.position.y += Math.sin(t * 0.0006) * 0.0035;
    particles.rotation.y += 0.0004;

    camera.position.x += (mouseX * 1.1 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.7 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function start() {
    running = true;
    requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && visible && !running) start();
  });
  start();
}
