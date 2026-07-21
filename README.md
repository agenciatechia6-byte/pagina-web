# pagina-web

Monorepo con dos webs estáticas y su publicación automática en GitHub Pages.

| Carpeta | Web | Se publica en |
|---|---|---|
| [`westside-barbershop/`](westside-barbershop/) | **WestSide Barbershop** (Vite + Tailwind v4 + JS vanilla) | **raíz** del sitio de Pages |
| [`lleida-tech-ia/`](lleida-tech-ia/) | **Lleida Tech IA** (HTML/CSS/JS estático) | `/lleida-tech-ia/` |

## Publicación

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) compila
WestSide y despliega el resultado como web raíz, conservando Lleida Tech IA en su
subruta. Se dispara en cada push a `main` (o a mano desde la pestaña **Actions**).

**Configuración única en GitHub:** *Settings → Pages → Source → «GitHub Actions»*.

Tras el despliegue:
- WestSide → `https://agenciatechia6-byte.github.io/pagina-web/`
- Lleida Tech IA → `https://agenciatechia6-byte.github.io/pagina-web/lleida-tech-ia/`

## Desarrollo local

```bash
cd westside-barbershop
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/ (lo que publica el workflow)
```

Lleida Tech IA es estática: `cd lleida-tech-ia && python3 -m http.server 8000`.
