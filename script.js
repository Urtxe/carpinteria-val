document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MENÚ DE NAVEGACIÓN ---
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            link.classList.add('active');
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 2. FORMULARIO DE CONTACTO ---
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            statusDiv.textContent = 'Enviando...';
            statusDiv.className = '';
            const formData = new FormData(form);

            fetch('enviar.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                if (data.trim() === 'exito') {
                    statusDiv.textContent = '¡Mensaje enviado correctamente!';
                    statusDiv.className = 'status-success';
                    form.reset();
                } else {
                    statusDiv.textContent = 'Hubo un error. Inténtalo más tarde.';
                    statusDiv.className = 'status-error';
                }
            })
            .catch(error => {
                statusDiv.textContent = 'Error de conexión.';
                statusDiv.className = 'status-error';
            });
        });
    }

   // --- 3. GALERÍA ZOOM ESTABLE ---
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("img01");
    const closeBtn = document.querySelector(".close");
    const images = document.querySelectorAll('.zoomable');

    // Al abrir el modal
    images.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "flex"; // Usamos flex para centrar mejor
            modal.style.alignItems = "center";
            modal.style.justifyContent = "center";
            
            modalImg.src = this.src; 
            
            // Reseteamos todo al abrir
            modalImg.classList.remove('zoomed');
            modalImg.style.transform = "scale(1)";
            modalImg.style.transformOrigin = "center center";
        });
    });

    // --- LÓGICA DE MOVIMIENTO ---

    // 1. Clic para activar/desactivar zoom
    modalImg.addEventListener('click', function(e) {
        e.stopPropagation(); // Evita cerrar el modal
        
        if (this.classList.contains('zoomed')) {
            // ALEJAR (Reset)
            this.classList.remove('zoomed');
            this.style.transform = "scale(1)";
            this.style.transformOrigin = "center center";
        } else {
            // ACERCAR
            this.classList.add('zoomed');
            this.style.transform = "scale(2.5)";
            
            // Ajustar posición inicial inmediatamente al hacer clic
            moverImagen(e);
        }
    });

    // 2. Mover ratón sobre la imagen ampliada
    modalImg.addEventListener('mousemove', function(e) {
        if (this.classList.contains('zoomed')) {
            moverImagen(e);
        }
    });

    // Función matemática corregida (Por porcentajes)
    function moverImagen(e) {
        // Obtenemos el ancho y alto total de la ventana visible
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Calculamos el porcentaje de dónde está el ratón (0% a 100%)
        const xPct = (e.clientX / width) * 100;
        const yPct = (e.clientY / height) * 100;

        // Aplicamos ese porcentaje al punto de origen de la transformación
        modalImg.style.transformOrigin = `${xPct}% ${yPct}%`;
    }

    // --- CERRAR ---

    // Botón X
    if (closeBtn) {
        closeBtn.onclick = function() {
            cerrarModal();
        }
    }

    // Clic fuera
    window.onclick = function(event) {
        if (event.target == modal) {
            cerrarModal();
        }
    }

    function cerrarModal() {
        modal.style.display = "none";
        modalImg.classList.remove('zoomed');
        modalImg.style.transform = "scale(1)";
    }
});