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
