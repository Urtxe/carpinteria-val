# Web Corporativa - Carpintería Alex Val

Este repositorio contiene el código fuente del sitio web oficial de **Carpintería Alex Val**, desarrollado como una Single Page Application (SPA) simulada para la presentación de servicios, portafolio de trabajos y contacto con el cliente.

El proyecto implementa navegación sin recarga mediante manipulación del DOM, una galería de imágenes interactiva con funcionalidad de zoom y un backend ligero en PHP para la gestión de correos electrónicos vía SMTP.

## Descripción Técnica

El sitio web está construido sobre una arquitectura monolítica simple utilizando tecnologías web estándar. No requiere frameworks de frontend ni bases de datos.

### Funcionalidades

  * **Navegación SPA:** Gestión de vistas (Inicio, Servicios, Trabajos, Contacto) mediante JavaScript, alternando la visibilidad de secciones HTML sin peticiones adicionales al servidor.
  * **Galería Modal Interactiva:**
      * Visualización de imágenes en contenedor modal (Lightbox).
      * Lógica de zoom (x2.5) y desplazamiento (panming) basada en la posición relativa del cursor sobre la imagen.
  * **Formulario de Contacto (AJAX):** Envío asíncrono de datos al servidor mediante `fetch()`, proporcionando feedback inmediato al usuario sin recargar la página.
  * **Integración SMTP:** Backend configurado con **PHPMailer** para el envío autenticado de correos electrónicos a través de los servidores de Google.
  * **Integración WhatsApp:** Botón flotante implementado con SVG para contacto directo vía API de WhatsApp.

## Stack Tecnológico

  * **Frontend:** HTML5, CSS3 (Flexbox/Grid, Animaciones CSS), JavaScript (ES6+).
  * **Backend:** PHP 7.4+.
  * **Dependencias:** [PHPMailer](https://github.com/PHPMailer/PHPMailer) (v6.x).
  * **Entorno de Desarrollo:** Apache HTTP Server (vía XAMPP/WAMP).

## Estructura del Proyecto

```text
/carpinteria-alex-val
│
├── index.php          # Punto de entrada y estructura HTML
├── style.css          # Hoja de estilos principal y media queries
├── script.js          # Lógica de cliente (navegación, galería, formulario)
├── enviar.php         # Controlador PHP para el envío de correos
│
├── img/               # Recursos gráficos
│   ├── portada.png
│   ├── armarios.jpg
│   └── ...
│
└── PHPMailer/         # Librería de terceros para SMTP
    ├── Exception.php
    ├── PHPMailer.php
    └── SMTP.php
```

## Instalación y Configuración

1.  **Despliegue de archivos:**
    Clonar el repositorio o copiar los archivos en el directorio público del servidor web (ej. `htdocs` en XAMPP o `/var/www/html` en Apache).

2.  **Verificación de Dependencias:**
    Asegurarse de que la carpeta `PHPMailer` contiene las clases `Exception.php`, `PHPMailer.php` y `SMTP.php`.

3.  **Configuración SMTP:**
    Para habilitar el funcionamiento del formulario de contacto, es necesario configurar las credenciales de envío en el archivo `enviar.php`.

    Abrir `enviar.php` y modificar las siguientes constantes:

    ```php
    // Configuración de credenciales Gmail
    $mi_gmail = "tu-email@gmail.com";
    $mi_password_app = "tu-contraseña-de-aplicación"; // Generada en Google Security
    $destinatario_final = "email-destino@dominio.com";
    ```

    *Nota: Se recomienda el uso de "Contraseñas de Aplicación" si se utiliza autenticación en dos pasos en Google.*

## Licencia

Este proyecto se distribuye bajo la licencia **GNU Affero General Public License v3.0 (AGPLv3)**.

Esta licencia permite el uso, modificación y distribución del software. La condición principal es que si se ejecuta una versión modificada de este programa en un servidor e interactúa con usuarios a través de una red, se debe poner el código fuente correspondiente a disposición de dichos usuarios bajo la misma licencia.

Para más detalles, consultar el texto completo en [https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html).

## Autor

**Mikel Urtxegi**

  * Desarrollo Full Stack
  * Contacto: carpinteriaval@gmail.com