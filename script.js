// Los enlaces y las fotografías siguen funcionando sin JavaScript.
const modal = document.querySelector("#image-modal");
const modalImage = document.querySelector("#modal-image");
const modalCaption = document.querySelector("#modal-caption");

document.querySelectorAll(".project-image").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    const image = link.querySelector("img");
    modalImage.src = link.href;
    modalImage.alt = image.alt;
    modalCaption.textContent = image.alt;
    modal.showModal();
    resetZoom();
  });
});
document
  .querySelector(".modal-close")
  .addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    const bounds = modal.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      modal.close();
  }
});

const viewport = document.querySelector(".image-viewport");
const zoomIn = document.querySelector("#zoom-in");
const zoomOut = document.querySelector("#zoom-out");
const zoomReset = document.querySelector("#zoom-reset");
const pointers = new Map();
let scale = 1;
let offsetX = 0;
let offsetY = 0;

function renderZoom() {
  const limitX = Math.max(
    0,
    (modalImage.clientWidth * scale - viewport.clientWidth) / 2,
  );
  const limitY = Math.max(
    0,
    (modalImage.clientHeight * scale - viewport.clientHeight) / 2,
  );
  offsetX = Math.max(-limitX, Math.min(limitX, offsetX));
  offsetY = Math.max(-limitY, Math.min(limitY, offsetY));
  modalImage.style.transform = `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  viewport.classList.toggle("is-zoomed", scale > 1);
  zoomReset.textContent = `${Math.round(scale * 100)}%`;
  zoomOut.disabled = scale <= 1;
  zoomIn.disabled = scale >= 5;
}

function resetZoom() {
  scale = 1;
  offsetX = offsetY = 0;
  pointers.clear();
  renderZoom();
}

function zoomAt(nextScale, x = 0, y = 0) {
  const clamped = Math.max(1, Math.min(5, nextScale));
  const ratio = clamped / scale;
  offsetX = x - (x - offsetX) * ratio;
  offsetY = y - (y - offsetY) * ratio;
  scale = clamped;
  renderZoom();
}

function position(event) {
  const bounds = viewport.getBoundingClientRect();
  return {
    x: event.clientX - bounds.left - bounds.width / 2,
    y: event.clientY - bounds.top - bounds.height / 2,
  };
}

zoomIn.addEventListener("click", () => zoomAt(scale * 1.5));
zoomOut.addEventListener("click", () => zoomAt(scale / 1.5));
zoomReset.addEventListener("click", resetZoom);
modalImage.addEventListener("load", resetZoom);
modal.addEventListener("close", resetZoom);
new ResizeObserver(() => {
  if (modal.open) renderZoom();
}).observe(viewport);

viewport.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    const point = position(event);
    const delta =
      event.deltaY *
      (event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? viewport.clientHeight
          : 1);
    zoomAt(
      scale * Math.exp(-Math.max(-100, Math.min(100, delta)) * 0.003),
      point.x,
      point.y,
    );
  },
  { passive: false },
);
viewport.addEventListener("dblclick", (event) => {
  const point = position(event);
  zoomAt(scale > 1 ? 1 : 2.5, point.x, point.y);
});

function gesture() {
  const [first, second] = [...pointers.values()];
  if (!second) return { ...first, distance: 0 };
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
    distance: Math.hypot(second.x - first.x, second.y - first.y),
  };
}
viewport.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  event.preventDefault();
  viewport.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, position(event));
});
viewport.addEventListener("pointermove", (event) => {
  if (!pointers.has(event.pointerId)) return;
  const previous = gesture();
  pointers.set(event.pointerId, position(event));
  const current = gesture();
  const nextScale =
    previous.distance > 0
      ? (scale * current.distance) / previous.distance
      : scale;
  const clamped = Math.max(1, Math.min(5, nextScale));
  const ratio = clamped / scale;
  offsetX = current.x - (previous.x - offsetX) * ratio;
  offsetY = current.y - (previous.y - offsetY) * ratio;
  scale = clamped;
  renderZoom();
});
for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
  viewport.addEventListener(eventName, (event) =>
    pointers.delete(event.pointerId),
  );
}

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  const contactEmail = document.querySelector("#contact-email");
  const contactStatus = contactForm.querySelector(".form-status");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  let captchaScript = null;

  function loadCaptcha() {
    if (captchaScript) return;
    captchaScript = document.createElement("script");
    captchaScript.src = "https://web3forms.com/client/script.js";
    captchaScript.async = true;
    captchaScript.addEventListener("error", () => {
      captchaScript.remove();
      captchaScript = null;
      contactStatus.textContent =
        "No se ha podido cargar la verificación antispam. Recarga la página o escríbenos por correo.";
    });
    document.body.appendChild(captchaScript);
  }

  const captchaObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      loadCaptcha();
      captchaObserver.disconnect();
    }
  }, { rootMargin: "400px" });
  contactForm.addEventListener("focusin", loadCaptcha);

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;
    const fields = new FormData(contactForm);
    const name = fields.get("name").trim();
    const message = fields.get("message").trim();
    const topic = fields.get("trabajo");
    contactStatus.textContent = "";

    if (!name || !message) {
      contactStatus.textContent =
        "Escribe tu nombre y unas palabras sobre el trabajo.";
      contactForm.elements.namedItem(name ? "message" : "name").focus();
      return;
    }

    if (!fields.get("h-captcha-response")) {
      loadCaptcha();
      contactStatus.textContent =
        "Completa la verificación antispam. Si no aparece, recarga la página o escríbenos por correo.";
      return;
    }

    fields.set("name", name);
    fields.set("email", fields.get("email").trim());
    fields.set("message", message);
    fields.set(
      "subject",
      topic ? `Consulta de carpintería: ${topic}` : "Consulta de carpintería",
    );
    submitButton.disabled = true;
    submitButton.textContent = "Enviando…";
    contactForm.setAttribute("aria-busy", "true");
    contactStatus.textContent = "Enviando tu consulta…";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fields,
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error("Envío rechazado");
      contactForm.reset();
      contactStatus.textContent =
        "Tu consulta se ha enviado. Gracias por escribirnos.";
    } catch {
      contactStatus.textContent =
        `No hemos podido confirmar el envío. Hemos conservado tu mensaje. Puedes escribirnos a ${contactEmail.textContent.trim()} o contactarnos por WhatsApp.`;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar consulta";
      contactForm.removeAttribute("aria-busy");
      window.hcaptcha?.reset();
    }
  });
  contactForm.hidden = false;
  captchaObserver.observe(contactForm);
}

const navLinks = document.querySelectorAll("nav a");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    });
  },
  { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
);
document
  .querySelectorAll("main section[id]")
  .forEach((section) => observer.observe(section));
