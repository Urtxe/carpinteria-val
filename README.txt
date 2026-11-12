# Carpintería Alex Val

Web estática en español: HTML, CSS y JavaScript sin framework, base de datos ni servidor PHP.
Navegación por anclas, galería con diálogo nativo y contacto por WhatsApp, teléfono y correo.
El formulario envía las consultas con Web3Forms sin salir de la web. No requiere SMTP ni servidor PHP.
La Access Key es pública y debe estar vinculada en Web3Forms a Alejandrovalcarpinteria@gmail.com.
Activar hCaptcha como protección antispam en el panel del formulario de Web3Forms: la web ya incluye
el widget gratuito. Sin JavaScript siguen disponibles los enlaces de correo, teléfono y WhatsApp.

## Desarrollo

Desde la raíz: python -m http.server 8080
Abrir http://localhost:8080
Comprobación: python scripts/check_site.py

El contenido y los enlaces funcionan sin JavaScript. JavaScript mejora la galería,
destaca la sección actual y envía el formulario. La imagen portada.webp es
una copia optimizada del PNG original.

## Despliegue con GitHub Actions

.github/workflows/deploy.yml valida la web y publica en GitHub Pages al hacer push a develop.
Los pull requests a develop ejecutan la validación sin publicar.
Configurar Settings > Pages > Source: GitHub Actions. El entorno github-pages debe permitir
despliegues desde develop. Se puede ejecutar manualmente el workflow desde esa rama.
Solo se publican index.html, style.css, script.js, robots.txt, sitemap.xml, LICENSE e imágenes;
no el PHP heredado.

## Dominio definitivo

Dominio principal: https://alejandrovalcarpinteria.es/
1. Verificar la propiedad del dominio en Settings > Pages de la cuenta Urtxe siguiendo el TXT
   que indique GitHub. Mantener ese TXT tras la verificación.
2. En el repositorio, Settings > Pages > Custom domain: alejandrovalcarpinteria.es.
3. En DonDominio, sustituir los registros de parking de @ por cuatro A:
   185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153.
   Sustituir el CNAME de www por urtxe.github.io (sin ruta ni https).
   Revisar que no queden A/AAAA de parking para @ o www; conservar los registros de correo.
4. Cuando GitHub valide el DNS y emita el certificado, activar Enforce HTTPS.
   Comprobar dominio principal y redirección de www. La propagación puede tardar 24 horas.
Al publicar mediante Actions no se necesita un archivo CNAME en el repositorio.
5. En Web3Forms, comprobar el destinatario y activar hCaptcha; realizar un envío real y comprobar
   recepción y Reply-To. La comprobación automatizada simula respuestas y no envía correos.

Comprobación del formulario: playwright-cli run-code --filename=scripts/check_contact.js,
tras abrir la web local en una sesión Chromium (el script intercepta Web3Forms).

## SEO y próximos pasos

Incluye título, descripción, jerarquía de encabezados, contenido visible sin JavaScript,
textos alternativos y datos estructurados con los datos de contacto existentes.
Incluye canonical, imagen social con URL absoluta, robots.txt y sitemap.xml del dominio definitivo.
Tras activar el dominio: verificar Google Search Console y enviar sitemap.xml.
Las páginas individuales de servicios quedan para una siguiente fase.

Licencia: GNU AGPLv3 (LICENSE). Desarrollo: Mikel Urtxegi.
