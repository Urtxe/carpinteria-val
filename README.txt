# Carpintería Alex Val

Web estática en español: HTML, CSS y JavaScript sin framework, base de datos ni servidor PHP.
Navegación por anclas, galería con diálogo nativo y contacto por WhatsApp, teléfono y correo.
El envío mediante formulario queda pendiente; no se llama a enviar.php ni se utiliza PHPMailer.

## Desarrollo

Desde la raíz: python -m http.server 8080
Abrir http://localhost:8080
Comprobación: python scripts/check_site.py

El contenido y los enlaces funcionan sin JavaScript. JavaScript mejora la galería y
destaca la sección actual. La imagen portada.webp es una copia optimizada del PNG original.

## Despliegue con GitHub Actions

.github/workflows/deploy.yml valida la web y publica en GitHub Pages al hacer push a develop.
Los pull requests a develop ejecutan la validación sin publicar.
Configurar Settings > Pages > Source: GitHub Actions. El entorno github-pages debe permitir
despliegues desde develop. Se puede ejecutar manualmente el workflow desde esa rama.
Solo se publican index.html, style.css, script.js, LICENSE e imágenes; no el PHP heredado.

## SEO y próximos pasos

Incluye título, descripción, jerarquía de encabezados, contenido visible sin JavaScript,
textos alternativos y datos estructurados con los datos de contacto existentes.
Cuando se confirme el dominio definitivo: configurar dominio y DNS, canonical, imagen
social con URL absoluta, robots.txt y sitemap.xml; verificar Google Search Console.
Las páginas individuales de servicios y el formulario quedan para una siguiente fase.

Licencia: GNU AGPLv3 (LICENSE). Desarrollo: Mikel Urtxegi.
