# WESTSIDE Barbershop — Web

One-page estática, mobile-first, bilingüe ES/CA. Pensada como link in bio de Instagram.
Conversión: WhatsApp + Instagram. Sin backend, sin cookies, sin analytics.

**Stack:** Vite + HTML/CSS/JS vanilla + Tailwind CSS v4.

## Correr en local

```bash
npm install
npm run dev      # abre http://localhost:5173
npm run build    # genera /dist para producción
```

## Cómo sustituir las fotos placeholder

Todas las fotos están en `public/img/`. Sustituye el archivo **manteniendo el mismo nombre**:

| Archivo | Qué es | Formato recomendado |
|---|---|---|
| `assets/img/hero/hero-01..05.webp` | Slideshow del hero (5 fotos con crossfade) | WebP, ~1600px lado mayor, calidad 70 |
| `corte-01.webp` … `corte-08.webp` | Galería de trabajos | WebP 4:5, ~800×1000 |
| `og.png` | Imagen al compartir el link en redes | PNG 1200×630 |
| `favicon.svg` / `apple-touch-icon.png` | Iconos (W) — sustituir por logo cuando exista | — |

> Convertir a WebP: [squoosh.app](https://squoosh.app) (gratis, en el navegador).
> Se pueden añadir más fotos a la galería copiando un `<img>` más en la sección
> `#trabajos` de `index.html`.

## Cómo cambiar los textos (i18n)

Todos los textos viven en `src/i18n/es.json` y `src/i18n/ca.json`.
Cada nodo del HTML con `data-i18n="clave"` toma su texto del JSON según el idioma.
Edita los dos JSON y listo — no hace falta tocar el HTML.

El idioma por defecto es castellano; el catalán se activa con el selector
(la preferencia viaja en el hash de la URL: `…/#ca`).

## Deploy en Vercel (3 pasos)

1. Sube el repo a GitHub y entra en [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
2. Si el proyecto está en la subcarpeta `westside-barbershop`, en **Root Directory** selecciónala. Vercel detecta Vite solo (build `npm run build`, output `dist`).
3. **Deploy**. En ~1 minuto tienes la URL `*.vercel.app` para ponerla en el link in bio.

(En Netlify es igual: *Add new site → Import*, base directory `westside-barbershop`, build `npm run build`, publish `dist`.)

## Conectar el dominio cuando lo compren

1. En Vercel: **Settings → Domains → Add** y escribe el dominio (ej. `westsidebarbershop.es`).
2. En el panel del registrador (Namecheap, IONOS…), apunta el DNS como te indica Vercel
   (registro `A` a `76.76.21.21` o `CNAME` a `cname.vercel-dns.com`).
3. Espera la propagación (minutos–horas). HTTPS se activa solo.
4. **Importante:** sustituye `https://westsidebarbershop.es/` en los meta `og:url`, `og:image`,
   `twitter:image` y en el JSON-LD de `index.html` por el dominio real.

## ⏳ Lista de [PENDIENTE] para el dueño

- [x] **Teléfono/WhatsApp**: 873 431 553 (configurado en `src/main.js` y JSON-LD).
- [x] **Horarios**: lunes a sábado 10:00–20:30 (textos ES/CA y JSON-LD).
- [x] **Fotos del hero**: las 5 reales integradas. **Galería**: 4 de 8 cortes reales; faltan 4 (IMG_8614/8616/8620/8623, pendientes de descarga de Drive).
- [ ] **Reseñas reales de Google**: 3-4 → textos `reviews.r1..r3` en los JSON + enlazar el badge al perfil real de Google Business.
- [ ] **Logo**: archivo → sustituir el texto WESTSIDE del nav y los favicons.
- [ ] **Dominio**: cuando exista, actualizar OG/JSON-LD (ver arriba).
- [ ] **Nota "Web por Lleida Tech IA"** en el footer: preguntar a Elias (está comentada en el HTML, lista para activar).
