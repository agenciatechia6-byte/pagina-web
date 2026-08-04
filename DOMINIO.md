# Publicar con el dominio propio (westsidebarbershop.com)

Guía para pasar de la URL provisional de GitHub Pages al dominio de la barbería.

**Estado actual:** el sitio se publica en
`https://agenciatechia6-byte.github.io/pagina-web/`.

**Importante — el orden importa.** No añadas el fichero `CNAME` al repositorio
antes de tener el dominio comprado y el DNS apuntando. Si lo haces, Pages deja
de servir en la URL de `github.io` e intenta servir en un dominio que todavía no
existe: te quedas sin web durante el proceso.

---

## Paso 1 · Comprar el dominio

Un `.com` cuesta orientativamente entre 10 y 15 € al año (el precio del primer
año suele ser de oferta; mira el de **renovación**, que es el que pagarás
siempre). Registradores: **Cloudflare** y **Porkbun** son de los más baratos y
sin sobrecostes; **DonDominio**, **IONOS**, **Hostinger** o **Namecheap** si
prefieres soporte en español.

Al contratarlo:

- **Activa la privacidad del WHOIS.** En un `.com` tus datos de contacto son
  públicos por defecto. Cloudflare y Porkbun la incluyen gratis; otros la cobran
  aparte. Sin ella, tu teléfono y dirección quedan expuestos.
- **No contrates el hosting.** Solo el dominio. El alojamiento ya lo da GitHub
  Pages y es gratuito.
- Considera comprar también el `.es` y redirigirlo, para que nadie lo ocupe.

## Paso 2 · Configurar el DNS

En el panel del registrador, busca la zona DNS del dominio (suele llamarse
«DNS», «Zona DNS» o «Gestión de DNS») y crea estos registros.

**Para el dominio raíz** (`westsidebarbershop.com`) — cuatro registros `A`:

| Tipo | Nombre / Host | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

Si el panel admite IPv6, añade además los cuatro `AAAA`: `2606:50c0:8000::153`,
`2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.

**Para `www`** — un registro `CNAME`:

| Tipo | Nombre / Host | Valor |
|---|---|---|
| CNAME | `www` | `agenciatechia6-byte.github.io.` |

> Estas IP son las de GitHub Pages. Si algo no cuadra, confírmalas en la
> documentación oficial: <https://docs.github.com/pages> → «Managing a custom
> domain for your GitHub Pages site».

El DNS tarda en propagarse: normalmente minutos, a veces hasta 24-48 h.

## Paso 3 · Declarar el dominio en GitHub

1. Repositorio → pestaña **Settings** (arriba, en la fila `Code · Issues · … · Settings`).
2. Barra izquierda → **Pages**.
3. Apartado **Custom domain**: escribe `westsidebarbershop.com` y pulsa **Save**.

GitHub comprobará el DNS. Cuando aparezca el check verde, marca la casilla
**Enforce HTTPS** (puede tardar un rato en habilitarse mientras emite el
certificado).

Aquí es donde tiene sentido el aviso de «dominios verificados» que te salía: es
opcional, sirve para impedir que otra cuenta reclame tu dominio. Puedes ignorarlo.

## Paso 4 · Ajustar el código

Al usar dominio propio, el sitio pasa a servirse en la **raíz** del dominio, ya
no en la subcarpeta `/pagina-web/`. Las rutas de imágenes, CSS y JS son todas
relativas, así que **no hay que tocar ninguna**: funcionan igual en los dos casos.

Sí hay que actualizar las URL absolutas, que son obligatoriamente absolutas
porque las usan Google y las vistas previas al compartir en WhatsApp o redes:

| Archivo | Qué cambiar |
|---|---|
| `westside-barbershop/public/CNAME` | Crear, con una sola línea: `westsidebarbershop.com` |
| `westside-barbershop/index.html` | `canonical`, `og:url`, `og:image`, `twitter:image` y los campos `url` e `image` del JSON-LD |
| `westside-barbershop/public/robots.txt` | La línea `Sitemap:` |
| `westside-barbershop/public/sitemap.xml` | La etiqueta `<loc>` |
| `westside-barbershop/public/404.html` | El enlace «Volver al inicio» |

En la práctica es sustituir `https://agenciatechia6-byte.github.io/pagina-web/`
por `https://westsidebarbershop.com/` en todo el proyecto.

## Paso 5 · Comprobar

- `https://westsidebarbershop.com` carga con el candado de HTTPS.
- `https://www.westsidebarbershop.com` redirige al dominio sin `www`.
- La vista previa al compartir por WhatsApp muestra la imagen y el título.
  Para forzar el refresco: <https://developers.facebook.com/tools/debug/>
- Dar de alta el sitio en Google Search Console y enviar el `sitemap.xml`.
