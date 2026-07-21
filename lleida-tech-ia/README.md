# Lleida Tech IA — Página web

Web de **Lleida Tech IA**, consultoría de automatización con IA para agencias
inmobiliarias, campings y alojamientos (Lleida, Pirineo y Cataluña).

## Estructura

- `index.html` — toda la página (una sola página con secciones)
- `css/styles.css` — estilos (paleta azul marino + dorado)
- `js/main.js` — animaciones 3D (Three.js), calculadora de pérdida, contadores y efectos
- `js/vendor/three.min.js` — Three.js incluido en local (sin depender de CDN)

## Cómo verla en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Cómo publicarla gratis con GitHub Pages

1. En GitHub: **Settings → Pages**
2. En *Source*, elegir la rama principal y la carpeta `/ (root)`
3. Guardar. En unos minutos la web estará en `https://<usuario>.github.io/pagina-web/`

## Pendiente de personalizar

- **Número de WhatsApp**: en `index.html` buscar `wa.me/34600000000` y poner el número real.
- **Reseñas**: las 4 reseñas actuales son ejemplos realistas. Sustituirlas por
  testimonios reales de clientes (nombre, negocio y zona) en la sección `#resenas`.
